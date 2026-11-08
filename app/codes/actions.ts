'use server';

import 'server-only';
import crypto from 'node:crypto';
import { z } from 'zod';
import { appSql } from '@/lib/db/app.server';
import { requireAuth } from '@/server/auth/requireAuth';
import { checkRateLimit } from '@/server/security/rateLimit';
import { StudentCode } from '@/types/code';

const PEPPER = process.env.CODE_PEPPER || '82ded8e8eb0619c7c16f040af35ad579ed3fcd7711fce3adae54d284d2e791fc';

const CodeInputSchema = z.string().min(8).max(35);

export async function listStudentCodesAction(): Promise<StudentCode[]> {
  const student = await requireAuth();

  const rows = await appSql`
    SELECT 
      sc.id,
      sc.code,
      sc.receipt_number,
      sc.semester,
      sc.status,
      sc.created_at,
      c.id AS course_id,
      c.code AS course_code,
      c.title AS course_title,
      c.doctor_name
    FROM public.academic_student_codes sc
    JOIN public.academic_courses c ON c.id = sc.course_id
    WHERE sc.student_id = ${student.accountId}
    ORDER BY sc.created_at DESC
  `;

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    courseCode: r.course_code,
    courseName: r.course_title,
    courseId: r.course_id,
    doctorName: r.doctor_name,
    receiptNumber: r.receipt_number,
    activatedAt: new Date(r.created_at).toLocaleDateString('ar-EG'),
    semester: r.semester,
    status: r.status as 'active' | 'expired',
  }));
}

export async function redeemCodeAction(rawCode: string): Promise<{ success: boolean; data?: StudentCode; error?: string }> {
  const student = await requireAuth();

  const parsed = CodeInputSchema.safeParse(rawCode);
  if (!parsed.success) {
    return { success: false, error: 'تنسيق الكود غير صحيح، يرجى التأكد من كتابة الكود بشكل سليم.' };
  }

  // Rate limit check: maximum 5 attempts per 15 minutes per student
  const rateLimit = await checkRateLimit(student.accountId, 'redeem', 5, 900);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'تم تجاوز عدد محاولات إدخال الأكواد المسموح بها. يرجى الانتظار 15 دقيقة ثم المحاولة مجدداً.',
    };
  }

  const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const codeHash = crypto.createHmac('sha256', PEPPER).update(cleanCode).digest();

  try {
    const result = await appSql.begin(async (tx) => {
      // 1. Lock the redeemable code row for update
      const [rc] = await tx`
        SELECT id, course_id, receipt_number, semester, masked_code
        FROM academic_private.redeemable_codes
        WHERE code_hash = ${codeHash} AND NOT is_redeemed
        FOR UPDATE
      `;

      if (!rc) {
        await tx`
          INSERT INTO academic_private.redeem_attempts (student_id, success)
          VALUES (${student.accountId}, false)
        `;
        return { ok: false, reason: 'invalid_code' };
      }

      // 2. Prevent burning code if student is already enrolled
      const [alreadyEnrolled] = await tx`
        SELECT 1 FROM public.academic_student_codes
        WHERE student_id = ${student.accountId} AND course_id = ${rc.course_id}
      `;

      if (alreadyEnrolled) {
        return { ok: false, reason: 'already_enrolled' };
      }

      // 3. Mark code as redeemed atomically
      await tx`
        UPDATE academic_private.redeemable_codes
           SET is_redeemed = true,
               redeemed_by = ${student.accountId},
               redeemed_at = now()
         WHERE id = ${rc.id}
      `;

      // 4. Enroll student in the course
      const [newEnrollment] = await tx`
        INSERT INTO public.academic_student_codes (
          student_id, course_id, code, receipt_number, semester, status
        ) VALUES (
          ${student.accountId}, ${rc.course_id}, ${rc.masked_code},
          ${rc.receipt_number}, ${rc.semester}, 'active'
        ) RETURNING id, code, receipt_number, semester, status, created_at
      `;

      // 5. Fetch course details for display
      const [course] = await tx`
        SELECT code, title, doctor_name
        FROM public.academic_courses
        WHERE id = ${rc.course_id}
      `;

      // 6. Generate notification
      await tx`
        INSERT INTO public.academic_notifications (
          student_id, title, message, type, action_url, action_label
        ) VALUES (
          ${student.accountId},
          'تم تفعيل المقرر بنجاح',
          ${'تم تفعيل كود مقرر ' + (course?.title || rc.course_id) + ' بنجاح وإضافته إلى مقرراتك.'},
          'course',
          ${'/courses/' + rc.course_id},
          'عرض المقرر'
        )
      `;

      // 7. Audit log
      await tx`
        INSERT INTO academic_private.audit_log (actor, action, details)
        VALUES (${student.accountId}, 'CODE_REDEEMED', ${JSON.stringify({ course_id: rc.course_id, code_id: rc.id })}::jsonb)
      `;

      return {
        ok: true,
        data: {
          id: newEnrollment.id,
          code: rc.masked_code,
          courseCode: course?.code || rc.course_id,
          courseName: course?.title || 'مقرر دراسي',
          courseId: rc.course_id,
          doctorName: course?.doctor_name || 'عضو هيئة التدريس',
          receiptNumber: rc.receipt_number,
          activatedAt: new Date(newEnrollment.created_at).toLocaleDateString('ar-EG'),
          semester: rc.semester,
          status: newEnrollment.status as 'active',
        },
      };
    });

    if (!result.ok) {
      if (result.reason === 'already_enrolled') {
        return { success: false, error: 'أنت مسجل بالفعل في هذا المقرر الأكاديمي.' };
      }
      return { success: false, error: 'كود التفعيل غير صحيح أو تم استخدامه مسبقاً.' };
    }

    return { success: true, data: result.data };
  } catch (err) {
    console.error('Error during code redemption:', err);
    return { success: false, error: 'حدث خطأ في معالجة الكود. يرجى إعادة المحاولة لاحقاً.' };
  }
}

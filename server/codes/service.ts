import 'server-only';
import { z } from 'zod';
import { appSql } from '@/lib/db/app.server';
import { env } from '@/lib/env';
import { computeCodeHash, normalizeCode } from '@/lib/security/codeHash';
import { StudentCode } from '@/types/code';

export const CodeInputSchema = z.string().min(8).max(35);

export interface CheckEnrollmentKeyResult {
  valid: boolean;
  alreadyEnrolled?: boolean;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  doctorName?: string;
  error?: string;
}

/**
 * Validates whether an enrollment key is valid and unredeemed,
 * and checks if the given student is already enrolled in the target course.
 * Does not mutate state or burn the key.
 */
export async function checkEnrollmentKey(
  rawCode: string,
  studentAccountId?: string
): Promise<CheckEnrollmentKeyResult> {
  const parsed = CodeInputSchema.safeParse(rawCode);
  if (!parsed.success) {
    return { valid: false, error: 'تنسيق الكود غير صحيح، يرجى التأكد من كتابة الكود بشكل سليم.' };
  }

  const cleanCode = normalizeCode(rawCode);
  const codeHash = computeCodeHash(cleanCode, env.CODE_PEPPER);

  try {
    const [rc] = await appSql`
      SELECT rc.id, rc.course_id, rc.is_redeemed, c.code AS course_code, c.title AS course_title, c.doctor_name
      FROM academic_private.redeemable_codes rc
      JOIN public.academic_courses c ON c.id = rc.course_id
      WHERE rc.code_hash = ${codeHash}
    `;

    if (!rc || rc.is_redeemed) {
      return { valid: false, error: 'كود التفعيل غير صالح أو تم استخدامه مسبقاً.' };
    }

    if (studentAccountId) {
      const [enrolled] = await appSql`
        SELECT 1 FROM public.academic_student_codes
        WHERE student_id = ${studentAccountId} AND course_id = ${rc.course_id} AND status = 'active'
      `;
      if (enrolled) {
        return {
          valid: true,
          alreadyEnrolled: true,
          courseId: rc.course_id,
          courseCode: rc.course_code,
          courseTitle: rc.course_title,
          doctorName: rc.doctor_name,
          error: 'أنت مسجل بالفعل في هذا المقرر الدراسي.',
        };
      }
    }

    return {
      valid: true,
      alreadyEnrolled: false,
      courseId: rc.course_id,
      courseCode: rc.course_code,
      courseTitle: rc.course_title,
      doctorName: rc.doctor_name,
    };
  } catch (err) {
    console.error('checkEnrollmentKey error:', err);
    return { valid: false, error: 'حدث خطأ أثناء التحقق من الكود.' };
  }
}

export async function listStudentCodes(studentAccountId: string): Promise<StudentCode[]> {
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
    WHERE sc.student_id = ${studentAccountId}
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

export async function redeemCodeForStudent(
  studentAccountId: string,
  rawCode: string
): Promise<{ success: boolean; data?: StudentCode; error?: string }> {
  const parsed = CodeInputSchema.safeParse(rawCode);
  if (!parsed.success) {
    return { success: false, error: 'تنسيق الكود غير صحيح، يرجى التأكد من كتابة الكود بشكل سليم.' };
  }

  const cleanCode = normalizeCode(rawCode);
  const codeHash = computeCodeHash(cleanCode, env.CODE_PEPPER);

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
          VALUES (${studentAccountId}, false)
        `;
        return { ok: false, reason: 'invalid_code' };
      }

      // 2. Prevent burning code if student is already enrolled
      const [alreadyEnrolled] = await tx`
        SELECT 1 FROM public.academic_student_codes
        WHERE student_id = ${studentAccountId} AND course_id = ${rc.course_id}
      `;

      if (alreadyEnrolled) {
        return { ok: false, reason: 'already_enrolled' };
      }

      // 3. Mark code as redeemed atomically
      await tx`
        UPDATE academic_private.redeemable_codes
           SET is_redeemed = true,
               redeemed_by = ${studentAccountId},
               redeemed_at = now()
         WHERE id = ${rc.id}
      `;

      // 4. Enroll student in the course
      const [newEnrollment] = await tx`
        INSERT INTO public.academic_student_codes (
          student_id, course_id, code, receipt_number, semester, status
        ) VALUES (
          ${studentAccountId}, ${rc.course_id}, ${rc.masked_code},
          ${rc.receipt_number}, ${rc.semester}, 'active'
        ) RETURNING id, code, receipt_number, semester, status, created_at
      `;

      // 5. Fetch course details for display
      const [course] = await tx`
        SELECT code, title, doctor_name
        FROM public.academic_courses
        WHERE id = ${rc.course_id}
      `;

      // 6. Record success in attempts and audit log
      await tx`
        INSERT INTO academic_private.redeem_attempts (student_id, success)
        VALUES (${studentAccountId}, true)
      `;

      await tx`
        INSERT INTO academic_private.audit_log (actor, action, details)
        VALUES (
          ${studentAccountId},
          'CODE_REDEEMED',
          ${tx.json({
            code_id: rc.id,
            course_id: rc.course_id,
            masked_code: rc.masked_code,
          })}
        )
      `;

      return {
        ok: true,
        data: {
          id: newEnrollment.id,
          code: newEnrollment.code,
          courseCode: course ? course.code : '',
          courseName: course ? course.title : '',
          courseId: rc.course_id,
          doctorName: course ? course.doctor_name : '',
          receiptNumber: newEnrollment.receipt_number,
          activatedAt: new Date(newEnrollment.created_at).toLocaleDateString('ar-EG'),
          semester: newEnrollment.semester,
          status: newEnrollment.status as 'active' | 'expired',
        },
      };
    });

    if (!result.ok) {
      if (result.reason === 'already_enrolled') {
        return { success: false, error: 'أنت مسجل بالفعل في هذا المقرر الدراسي، لم يتم استهلاك الكود.' };
      }
      return { success: false, error: 'كود التفعيل غير صالح أو تم استخدامه مسبقاً.' };
    }

    return { success: true, data: result.data };
  } catch (err) {
    console.error('redeemCodeForStudent error:', err);
    return { success: false, error: 'حدث خطأ في معالجة الكود، يرجى المحاولة لاحقاً.' };
  }
}

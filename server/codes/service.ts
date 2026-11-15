import 'server-only';
import { z } from 'zod';
import { appSql } from '@/lib/db/app.server';
import { env } from '@/lib/env';
import { computeCodeHash, normalizeCode } from '@/lib/security/codeHash';
import { StudentCode } from '@/types/code';

export const CodeInputSchema = z.string().min(8).max(35);

export function formatDisplayCode(code: string): string {
  if (!code) return '';
  if (code.includes('ALL3')) return 'ALL3 - 2026 - FULL';
  if (code.includes('XXXP')) return 'XXXP - UKTX - R35R';
  if (code.includes('UNIV')) return 'UNIV - 2026 - L3S1';
  
  const clean = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length >= 8) {
    const parts: string[] = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join(' - ');
  }
  return code;
}

export function formatActivationDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }
  return String(dateInput).replace(/[٠-٩]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit).toString());
}

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
      SELECT rc.id, rc.course_id, rc.is_redeemed, rc.is_bundle, rc.target_level, c.code AS course_code, c.title AS course_title, c.doctor_name
      FROM academic_private.redeemable_codes rc
      LEFT JOIN public.academic_courses c ON c.id = rc.course_id
      WHERE rc.code_hash = ${codeHash}
    `;

    if (!rc || rc.is_redeemed) {
      return { valid: false, error: 'كود التفعيل غير صالح أو تم استخدامه مسبقاً.' };
    }

    if (rc.is_bundle) {
      const targetLevel = rc.target_level || 3;
      const levelTitle = targetLevel === 1 ? 'المستوى الأول' : 'المستوى الثالث';
      const bundleCourseCode = `ALL-L${targetLevel}-S1`;
      const bundleCourseTitle = `باقة كافة مقررات ${levelTitle} (الفصل الأول)`;
      const bundleDoctorName = `هيئة التدريس - ${levelTitle}`;

      if (studentAccountId) {
        const [lvlCount] = await appSql`
          SELECT count(*)::int AS count
          FROM public.academic_courses
          WHERE level = ${targetLevel} AND semester = 'الفصل الأول'
        `;
        const [enrolledCount] = await appSql`
          SELECT count(DISTINCT sc.course_id)::int AS count
          FROM public.academic_student_codes sc
          JOIN public.academic_courses c ON c.id = sc.course_id
          WHERE sc.student_id = ${studentAccountId}
            AND c.level = ${targetLevel} AND c.semester = 'الفصل الأول'
            AND sc.status = 'active'
        `;
        if (lvlCount && enrolledCount && lvlCount.count > 0 && enrolledCount.count >= lvlCount.count) {
          return {
            valid: true,
            alreadyEnrolled: true,
            courseCode: bundleCourseCode,
            courseTitle: bundleCourseTitle,
            doctorName: bundleDoctorName,
            error: 'أنت مسجل بالفعل في كافة مقررات هذا المستوى الدراسي.',
          };
        }
      }

      return {
        valid: true,
        alreadyEnrolled: false,
        courseCode: bundleCourseCode,
        courseTitle: bundleCourseTitle,
        doctorName: bundleDoctorName,
      };
    }

    if (studentAccountId && rc.course_id) {
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

  // Check if any bundle codes were redeemed
  const redeemedBundles = await appSql`
    SELECT id, masked_code, receipt_number, semester, redeemed_at
    FROM academic_private.redeemable_codes
    WHERE redeemed_by = ${studentAccountId} AND is_bundle = true
    ORDER BY redeemed_at DESC
  `;

  const bundleReceipts = new Set(redeemedBundles.map((b) => b.receipt_number));

  // Group rows by receipt_number to combine bundle courses into ONE record
  type StudentCodeRow = (typeof rows)[number];
  const receiptGroups = new Map<string, StudentCodeRow[]>();
  for (const r of rows) {
    const key = r.receipt_number || r.code || r.id;
    if (!receiptGroups.has(key)) {
      receiptGroups.set(key, []);
    }
    receiptGroups.get(key)!.push(r);
  }

  const result: StudentCode[] = [];

  for (const [receipt, group] of receiptGroups) {
    const isBundle =
      bundleReceipts.has(receipt) ||
      group.length >= 2 ||
      group[0].code.includes('ALL') ||
      group[0].code.includes('XXXP') ||
      group[0].code.includes('UNIV');

    if (isBundle) {
      const isL1 =
        group[0].code.includes('ALL1') ||
        group.some((g) => g.course_code?.startsWith('CS1') || g.course_code?.startsWith('BS1') || g.course_code?.startsWith('IT1') || g.course_code?.startsWith('HU1'));
      const targetLvl = isL1 ? 1 : 3;
      const levelTitle = targetLvl === 1 ? 'المستوى الأول' : 'المستوى الثالث';

      result.push({
        id: group[0].id,
        code: formatDisplayCode(group[0].code),
        courseCode: `ALL-L${targetLvl}-S1`,
        courseName: `باقة كافة مقررات ${levelTitle}`,
        courseId: group[0].course_id,
        doctorName: `هيئة تدريس ${levelTitle}`,
        receiptNumber: group[0].receipt_number,
        activatedAt: formatActivationDate(group[0].created_at),
        semester: group[0].semester,
        status: group[0].status as 'active' | 'expired',
      });
    } else {
      for (const r of group) {
        result.push({
          id: r.id,
          code: formatDisplayCode(r.code),
          courseCode: r.course_code,
          courseName: r.course_title,
          courseId: r.course_id,
          doctorName: r.doctor_name,
          receiptNumber: r.receipt_number,
          activatedAt: formatActivationDate(r.created_at),
          semester: r.semester,
          status: r.status as 'active' | 'expired',
        });
      }
    }
  }

  // Also add any redeemed bundles that had no rows in academic_student_codes (edge case)
  for (const b of redeemedBundles) {
    if (!receiptGroups.has(b.receipt_number)) {
      result.push({
        id: b.id,
        code: formatDisplayCode(b.masked_code),
        courseCode: 'ALL-L3-S1',
        courseName: 'كل مقررات الفصل',
        courseId: '',
        doctorName: 'هيئة تدريس المستوى الثالث',
        receiptNumber: b.receipt_number,
        activatedAt: formatActivationDate(b.redeemed_at),
        semester: b.semester,
        status: 'active',
      });
    }
  }

  return result;
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
        SELECT id, course_id, receipt_number, semester, masked_code, is_bundle, target_level
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

      // Handle Bundle Code (activates all target level courses at once)
      if (rc.is_bundle) {
        const targetLevel = rc.target_level || 3;
        const targetCourses = await tx`
          SELECT id, code, title, doctor_name
          FROM public.academic_courses
          WHERE level = ${targetLevel} AND semester = 'الفصل الأول'
          ORDER BY code
        `;

        if (targetCourses.length === 0) {
          return { ok: false, reason: 'no_courses_found' };
        }

        const enrolledRows = await tx`
          SELECT course_id FROM public.academic_student_codes
          WHERE student_id = ${studentAccountId}
            AND course_id IN ${tx(targetCourses.map((c) => c.id))}
            AND status = 'active'
        `;

        if (enrolledRows.length >= targetCourses.length) {
          return { ok: false, reason: 'already_enrolled' };
        }

        // Mark bundle code as redeemed atomically
        await tx`
          UPDATE academic_private.redeemable_codes
             SET is_redeemed = true,
                 redeemed_by = ${studentAccountId},
                 redeemed_at = now()
           WHERE id = ${rc.id}
        `;

        const displayCode = formatDisplayCode(cleanCode);

        // Enroll student into each course of target level
        for (const course of targetCourses) {
          await tx`
            INSERT INTO public.academic_student_codes (
              student_id, course_id, code, receipt_number, semester, status
            ) VALUES (
              ${studentAccountId}, ${course.id}, ${displayCode},
              ${rc.receipt_number}, ${rc.semester}, 'active'
            )
            ON CONFLICT (student_id, course_id) DO NOTHING
          `;
        }

        await tx`
          INSERT INTO academic_private.redeem_attempts (student_id, success)
          VALUES (${studentAccountId}, true)
        `;

        await tx`
          INSERT INTO academic_private.audit_log (actor, action, details)
          VALUES (
            ${studentAccountId},
            'BUNDLE_CODE_REDEEMED',
            ${tx.json({
              code_id: rc.id,
              bundle: `ALL-L${targetLevel}-S1`,
              target_level: targetLevel,
              enrolled_courses: targetCourses.map((c) => c.id),
              masked_code: rc.masked_code,
            })}
          )
        `;

        const levelTitle = targetLevel === 1 ? 'المستوى الأول' : 'المستوى الثالث';
        return {
          ok: true,
          data: {
            id: rc.id,
            code: displayCode,
            courseCode: `ALL-L${targetLevel}-S1`,
            courseName: `باقة كافة مقررات ${levelTitle}`,
            courseId: targetCourses[0]?.id || '',
            doctorName: `هيئة تدريس ${levelTitle}`,
            receiptNumber: rc.receipt_number,
            activatedAt: formatActivationDate(new Date()),
            semester: rc.semester,
            status: 'active' as const,
          },
        };
      }

      // 2. Single Course Code: Prevent burning code if student is already enrolled
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

      const displayCode = formatDisplayCode(cleanCode);

      // 4. Enroll student in the course
      const [newEnrollment] = await tx`
        INSERT INTO public.academic_student_codes (
          student_id, course_id, code, receipt_number, semester, status
        ) VALUES (
          ${studentAccountId}, ${rc.course_id}, ${displayCode},
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
          code: displayCode,
          courseCode: course ? course.code : '',
          courseName: course ? course.title : '',
          courseId: rc.course_id,
          doctorName: course ? course.doctor_name : '',
          receiptNumber: newEnrollment.receipt_number,
          activatedAt: formatActivationDate(newEnrollment.created_at),
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

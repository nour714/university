import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { redeemCodeForStudent, checkEnrollmentKey } from '@/server/codes/service';
import { computeCodeHash, normalizeCode } from '@/lib/security/codeHash';
import { env } from '@/lib/env';

describe('Codes Redemption & Concurrency Locking (Finding S1 & Concurrency)', () => {
  let clients: TestDbClients;

  const testCourseId = 'c-code-test-101';
  const rawTestCode = 'CS101-RACE-TEST-2026';
  const cleanCode = normalizeCode(rawTestCode);
  const codeHash = computeCodeHash(cleanCode, env.CODE_PEPPER);

  const studentIds: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const hex = i.toString().padStart(12, '0');
    studentIds.push(`e0000000-0000-0000-0000-${hex}`);
  }

  let concurrentWinnerStudentId: string | null = null;

  beforeAll(async () => {
    clients = await setupTestDatabase();

    // 1. Create course
    await clients.ownerSql`
      INSERT INTO public.academic_courses (
        id, code, title, description, doctor_name, credit_hours, level, department, semester
      ) VALUES (
        ${testCourseId}, 'CODE101', 'مقرر الأكواد التجريبي', 'الوصف', 'د. كود', 3, 1, 'عام', 'الفصل الأول'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Create student accounts
    for (let i = 0; i < studentIds.length; i++) {
      const sid = studentIds[i];
      const nid = `3010101010${(50 + i).toString()}`;
      await clients.ownerSql`
        INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
        VALUES (${sid}, ${nid}, 'hash', true)
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('normalizes code variants to identical hash', () => {
    const raw1 = '  cs101-race-test-2026  ';
    const raw2 = 'CS101-RACE-TEST-2026';
    const raw3 = 'Cs101-Race-Test-2026';

    const h1 = computeCodeHash(normalizeCode(raw1), env.CODE_PEPPER);
    const h2 = computeCodeHash(normalizeCode(raw2), env.CODE_PEPPER);
    const h3 = computeCodeHash(normalizeCode(raw3), env.CODE_PEPPER);

    expect(h1.equals(h2)).toBe(true);
    expect(h2.equals(h3)).toBe(true);
  });

  it('handles 20 simultaneous redeem attempts: exactly 1 succeeds and 19 fail', async () => {
    // Seed 1 unredeemed code
    await clients.ownerSql`
      INSERT INTO academic_private.redeemable_codes (
        code_hash, masked_code, course_id, receipt_number, semester, is_redeemed
      ) VALUES (
        ${codeHash}, 'CS101-****-2026', ${testCourseId}, 'REC-RACE-01', 'الفصل الأول', false
      ) ON CONFLICT (code_hash) DO UPDATE SET is_redeemed = false, redeemed_by = null, redeemed_at = null;
    `;

    // Fire 20 simultaneous redemption requests
    const results = await Promise.all(
      studentIds.map((sid) => redeemCodeForStudent(sid, rawTestCode))
    );

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(19);

    const winnerIndex = results.findIndex((r) => r.success);
    expect(winnerIndex).toBeGreaterThanOrEqual(0);
    concurrentWinnerStudentId = studentIds[winnerIndex];

    for (const f of failures) {
      expect(f.error).toContain('كود التفعيل غير صالح أو تم استخدامه مسبقاً');
    }

    // Verify DB state
    const [codeRow] = await clients.ownerSql`
      SELECT is_redeemed, redeemed_by FROM academic_private.redeemable_codes
      WHERE code_hash = ${codeHash}
    `;
    expect(codeRow.is_redeemed).toBe(true);
    expect(codeRow.redeemed_by).toBe(successes[0].data?.id ? (await clients.ownerSql`SELECT student_id FROM public.academic_student_codes WHERE id = ${successes[0].data.id}`)[0].student_id : null);

    const enrollments = await clients.ownerSql`
      SELECT id, student_id FROM public.academic_student_codes
      WHERE course_id = ${testCourseId}
    `;
    expect(enrollments).toHaveLength(1);
  });

  it('does not burn code if student is already enrolled in the course', async () => {
    expect(concurrentWinnerStudentId).toBeDefined();
    const winnerStudentId = concurrentWinnerStudentId!;
    const secondRawCode = 'CS101-SECOND-CODE-2026';
    const secondHash = computeCodeHash(normalizeCode(secondRawCode), env.CODE_PEPPER);

    // Seed second unredeemed code
    await clients.ownerSql`
      INSERT INTO academic_private.redeemable_codes (
        code_hash, masked_code, course_id, receipt_number, semester, is_redeemed
      ) VALUES (
        ${secondHash}, 'CS101-****-SEC', ${testCourseId}, 'REC-SEC-02', 'الفصل الأول', false
      ) ON CONFLICT (code_hash) DO UPDATE SET is_redeemed = false;
    `;

    // winnerStudentId is already enrolled in testCourseId from the previous test
    const res = await redeemCodeForStudent(winnerStudentId, secondRawCode);

    expect(res.success).toBe(false);
    expect(res.error).toContain('أنت مسجل بالفعل في هذا المقرر الدراسي، لم يتم استهلاك الكود');

    // Code must NOT be burned (must remain is_redeemed = false)
    const [secondCodeRow] = await clients.ownerSql`
      SELECT is_redeemed, redeemed_by FROM academic_private.redeemable_codes
      WHERE code_hash = ${secondHash}
    `;
    expect(secondCodeRow.is_redeemed).toBe(false);
    expect(secondCodeRow.redeemed_by).toBeNull();
  });

  describe('checkEnrollmentKey inspection without mutation', () => {
    it('returns valid: false for non-existing code or malformed code', async () => {
      const malformed = await checkEnrollmentKey('short');
      expect(malformed.valid).toBe(false);

      const notFound = await checkEnrollmentKey('NON-EXISTING-KEY-999');
      expect(notFound.valid).toBe(false);
      expect(notFound.error).toContain('كود التفعيل غير صالح');
    });

    it('returns alreadyEnrolled: true if student already holds active key for the course', async () => {
      const winnerStudentId = concurrentWinnerStudentId!;
      const checkRes = await checkEnrollmentKey('CS101-SECOND-CODE-2026', winnerStudentId);
      expect(checkRes.valid).toBe(true);
      expect(checkRes.alreadyEnrolled).toBe(true);
      expect(checkRes.courseTitle).toBe('مقرر الأكواد التجريبي');
    });

    it('returns alreadyEnrolled: false and course info if code is unredeemed and student not enrolled', async () => {
      const unEnrolledStudent = studentIds[1]; // didn't win second code
      const checkRes = await checkEnrollmentKey('CS101-SECOND-CODE-2026', unEnrolledStudent);
      expect(checkRes.valid).toBe(true);
      expect(checkRes.alreadyEnrolled).toBe(false);
      expect(checkRes.courseCode).toBe('CODE101');
      expect(checkRes.courseTitle).toBe('مقرر الأكواد التجريبي');
    });

    it('returns valid: false for already redeemed code', async () => {
      const checkRedeemed = await checkEnrollmentKey(rawTestCode);
      expect(checkRedeemed.valid).toBe(false);
      expect(checkRedeemed.error).toContain('كود التفعيل غير صالح أو تم استخدامه مسبقاً');
    });
  });

  describe('Bundle / All-In-One Code Redemption (Level 3 Semester 1)', () => {
    const bundleStudentId = 'e0000000-0000-0000-0000-000000000099';
    const bundleStudentNid = '30101010109999';
    const rawBundleCode = 'ALL3-TEST-BUNDLE-2026';
    const bundleHash = computeCodeHash(normalizeCode(rawBundleCode), env.CODE_PEPPER);

    beforeAll(async () => {
      // 1. Ensure test student account exists
      await clients.ownerSql`
        INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
        VALUES (${bundleStudentId}, ${bundleStudentNid}, 'hash', true)
        ON CONFLICT (id) DO NOTHING;
      `;

      // 2. Ensure at least two Level 3 Semester 1 courses exist
      await clients.ownerSql`
        INSERT INTO public.academic_courses (
          id, code, title, description, doctor_name, credit_hours, level, department, semester
        ) VALUES 
          ('test-l3-c1', 'CS311', 'تطوير تطبيقات الموبايل', 'وصف', 'د. مروة', 3, 3, 'علوم الحاسب', 'الفصل الأول'),
          ('test-l3-c2', 'AI303', 'الرؤية الحاسوبية', 'وصف', 'د. مروة', 3, 3, 'الذكاء الاصطناعي', 'الفصل الأول')
        ON CONFLICT (id) DO NOTHING;
      `;

      // 3. Insert bundle code
      await clients.ownerSql`
        INSERT INTO academic_private.redeemable_codes (
          code_hash, masked_code, course_id, receipt_number, semester, is_redeemed, is_bundle
        ) VALUES (
          ${bundleHash}, 'ALL3-****-2026', null, 'REC-BUNDLE-01', 'الفصل الأول', false, true
        ) ON CONFLICT (code_hash) DO UPDATE SET is_redeemed = false, redeemed_by = null, redeemed_at = null;
      `;
    });

    it('checkEnrollmentKey recognizes bundle code and shows bundle title', async () => {
      const checkRes = await checkEnrollmentKey(rawBundleCode, bundleStudentId);
      expect(checkRes.valid).toBe(true);
      expect(checkRes.alreadyEnrolled).toBe(false);
      expect(checkRes.courseCode).toBe('ALL-L3-S1');
      expect(checkRes.courseTitle).toContain('كافة مقررات المستوى الثالث');
    });

    it('redeems bundle code and enrolls student in ALL Level 3 Semester 1 courses at once', async () => {
      const res = await redeemCodeForStudent(bundleStudentId, rawBundleCode);
      expect(res.success).toBe(true);
      expect(res.data?.courseCode).toBe('ALL-L3-S1');

      // Verify all Level 3 Semester 1 courses are enrolled
      const enrolled = await clients.ownerSql`
        SELECT sc.course_id 
        FROM public.academic_student_codes sc
        JOIN public.academic_courses c ON c.id = sc.course_id
        WHERE sc.student_id = ${bundleStudentId} AND c.level = 3 AND c.semester = 'الفصل الأول'
      `;
      expect(enrolled.length).toBeGreaterThanOrEqual(2);

      // Verify bundle code is marked as redeemed
      const [codeRow] = await clients.ownerSql`
        SELECT is_redeemed, redeemed_by FROM academic_private.redeemable_codes
        WHERE code_hash = ${bundleHash}
      `;
      expect(codeRow.is_redeemed).toBe(true);
      expect(codeRow.redeemed_by).toBe(bundleStudentId);
    });

    it('refuses to burn a second bundle code if student is already enrolled in all courses', async () => {
      const secondBundleCode = 'ALL3-SECOND-BUNDLE-2026';
      const secondBundleHash = computeCodeHash(normalizeCode(secondBundleCode), env.CODE_PEPPER);

      await clients.ownerSql`
        INSERT INTO academic_private.redeemable_codes (
          code_hash, masked_code, course_id, receipt_number, semester, is_redeemed, is_bundle
        ) VALUES (
          ${secondBundleHash}, 'ALL3-****-2026', null, 'REC-BUNDLE-02', 'الفصل الأول', false, true
        ) ON CONFLICT (code_hash) DO UPDATE SET is_redeemed = false;
      `;

      const res = await redeemCodeForStudent(bundleStudentId, secondBundleCode);
      expect(res.success).toBe(false);
      expect(res.error).toContain('مسجل بالفعل');

      // Second bundle code was NOT burned
      const [row] = await clients.ownerSql`
        SELECT is_redeemed FROM academic_private.redeemable_codes
        WHERE code_hash = ${secondBundleHash}
      `;
      expect(row.is_redeemed).toBe(false);
    });
  });

  describe('Empirical Verification: Only 6 Level 3 Courses Exist & All Codes Work', () => {
    const studentForIndiv = 'e0000000-0000-0000-0000-000000000088';
    const studentForBundle = 'e0000000-0000-0000-0000-000000000077';

    beforeAll(async () => {
      // 1. Create fresh test accounts
      await clients.ownerSql`
        INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
        VALUES 
          (${studentForIndiv}, '30101010108888', 'hash', true),
          (${studentForBundle}, '30101010107777', 'hash', true)
        ON CONFLICT (id) DO NOTHING;
      `;

      // 2. Run seed to populate real seeded courses and codes
      const { seed } = await import('@/scripts/seed-data');
      await seed(clients.ownerUrl);
    });

    it('asserts ONLY the 6 new Level 3 courses exist and old courses are removed', async () => {
      const rows = await clients.ownerSql`
        SELECT id, code, title, doctor_name, level, semester 
        FROM public.academic_courses 
        ORDER BY id;
      `;

      const courseIds = rows.map((r) => r.id).sort();
      const expectedIds = ['ai-302', 'ai-303', 'cs-302', 'cs-303', 'cs-311', 'ds-302'].sort();
      expect(courseIds).toEqual(expectedIds);

      // Verify each course is strictly Level 3 Semester 1
      for (const course of rows) {
        expect(course.level).toBe(3);
        expect(course.semester).toBe('الفصل الأول');
      }

      // Explicitly assert old courses do NOT exist
      const oldCourseIds = ['ai-301', 'cs-201', 'ai-101', 'ai-401', 'ai-402', 'ai-403', 'cs-204', 'ai-305'];
      for (const oldId of oldCourseIds) {
        expect(courseIds).not.toContain(oldId);
      }
    });

    it('verifies that each of the 6 individual course activation codes works correctly', async () => {
      const individualCodes = [
        { code: 'MOBL-2026-M91A', expectedCourseId: 'cs-311', expectedTitle: 'تطوير برمجيات الأجهزة المحمولة' },
        { code: 'CVIS-2026-V84X', expectedCourseId: 'ai-303', expectedTitle: 'الرؤية الحاسوبية' },
        { code: 'DATA-2026-D37K', expectedCourseId: 'ds-302', expectedTitle: 'تحليل البيانات' },
        { code: 'PDCS-2026-P62M', expectedCourseId: 'cs-302', expectedTitle: 'الحوسبة المتوازية والموزعة' },
        { code: 'ALGO-2026-A19T', expectedCourseId: 'cs-303', expectedTitle: 'مقدمة في الخوارزميات' },
        { code: 'DEEP-2026-B55H', expectedCourseId: 'ai-302', expectedTitle: 'أساسيات التعلم العميق' },
      ];

      for (const item of individualCodes) {
        const res = await redeemCodeForStudent(studentForIndiv, item.code);
        expect(res.success).toBe(true);
        expect(res.data?.courseId).toBe(item.expectedCourseId);
        expect(res.data?.courseName).toBe(item.expectedTitle);

        // Verify student is enrolled in DB
        const [enrolled] = await clients.ownerSql`
          SELECT 1 FROM public.academic_student_codes
          WHERE student_id = ${studentForIndiv} AND course_id = ${item.expectedCourseId} AND status = 'active'
        `;
        expect(enrolled).toBeDefined();
      }
    });

    it('verifies that the Master Bundle Code (ALL3-2026-FULL) activates all 6 courses at once', async () => {
      const res = await redeemCodeForStudent(studentForBundle, 'ALL3-2026-FULL');
      expect(res.success).toBe(true);
      expect(res.data?.courseCode).toBe('ALL-L3-S1');

      // Verify student is enrolled in ALL 6 courses
      const enrollments = await clients.ownerSql`
        SELECT course_id FROM public.academic_student_codes
        WHERE student_id = ${studentForBundle} AND status = 'active'
      `;
      expect(enrollments.length).toBe(6);

      const enrolledIds = enrollments.map((e) => e.course_id).sort();
      const expectedIds = ['ai-302', 'ai-303', 'cs-302', 'cs-303', 'cs-311', 'ds-302'].sort();
      expect(enrolledIds).toEqual(expectedIds);
    });
  });
});

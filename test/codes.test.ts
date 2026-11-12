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
});

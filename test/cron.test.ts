import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { finalizeExpiredSessions } from '@/server/exams/finalize';
import { GET } from '@/app/api/cron/finalize/route';
import { env } from '@/lib/env';

describe('Cron Finalize & Timed Auto-Submission (Finding E3)', () => {
  let clients: TestDbClients;

  const studentA = 'f0000000-0000-0000-0000-000000000001';
  const studentB = 'f0000000-0000-0000-0000-000000000002';
  const courseId = 'c-cron-101';
  const examId = 'e-cron-101';
  const q1Id = '00000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    clients = await setupTestDatabase();

    // 1. Create accounts & students
    await clients.ownerSql`
      INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
      VALUES 
        (${studentA}, '30101010101031', 'fakehash', true),
        (${studentB}, '30101010101032', 'fakehash', true)
      ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Create course
    await clients.ownerSql`
      INSERT INTO public.academic_courses (id, code, title, description, doctor_name, credit_hours, level, department, semester)
      VALUES (${courseId}, 'CRON101', 'مقرر تجريبي للمجدول', 'الوصف', 'د. تجريبي', 3, 1, 'عام', 'الفصل الأول')
      ON CONFLICT (id) DO NOTHING;
    `;

    // 3. Create exam
    await clients.ownerSql`
      INSERT INTO public.academic_exams (
        id, course_id, title, description, type, duration_minutes, total_marks, passing_marks,
        start_date, end_date
      ) VALUES (
        ${examId}, ${courseId}, 'امتحان المجدول التجريبي', 'وصف', 'quiz', 30, 10, 5,
        now() - interval '2 days', now() + interval '1 day'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // 4. Create question & answer key
    await clients.ownerSql`
      INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
      VALUES (${q1Id}, ${examId}, 1, 'Cron question 1', '[{"id":"opt-1","text":"1"}]'::jsonb, 10)
      ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO academic_private.exam_keys (question_id, correct_option_id)
      VALUES (${q1Id}, 'opt-1')
      ON CONFLICT (question_id) DO NOTHING;
    `;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Authorization & Secret Verification', () => {
    it('rejects missing or empty authorization header with 401', async () => {
      const req = new Request('http://localhost:3000/api/cron/finalize');
      const res = await GET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('rejects incorrect authorization header with 401', async () => {
      const req = new Request('http://localhost:3000/api/cron/finalize', {
        headers: { authorization: 'Bearer wrong-secret' },
      });
      const res = await GET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('accepts correct Bearer token matching env.CRON_SECRET', async () => {
      const req = new Request('http://localhost:3000/api/cron/finalize', {
        headers: { authorization: `Bearer ${env.CRON_SECRET}` },
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('accepts correct Bearer token matching env.APP_SECRET as fallback', async () => {
      const req = new Request('http://localhost:3000/api/cron/finalize', {
        headers: { authorization: `Bearer ${env.APP_SECRET}` },
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('uses crypto.timingSafeEqual rather than string comparison for secret auth', async () => {
      const fs = await import('node:fs');
      const cronSrc = fs.readFileSync('app/api/cron/finalize/route.ts', 'utf-8');
      expect(cronSrc).toContain('crypto.timingSafeEqual');
      expect(cronSrc).not.toContain('authHeader ===');
      expect(cronSrc).not.toContain('authHeader !==');
    });
  });

  describe('Session Finalization Workflow', () => {
    it('finalizes expired unsubmitted sessions and marks them submitted', async () => {
      // Create session for studentA that expired 30 seconds ago
      await clients.ownerSql`
        INSERT INTO public.academic_exam_sessions (
          student_id, exam_id, end_at, submitted, answers, finalize_attempts
        ) VALUES (
          ${studentA}, ${examId}, now() - interval '30 seconds', false, '{"00000000-0000-0000-0000-000000000001":"opt-1"}'::jsonb, 0
        ) ON CONFLICT (student_id, exam_id) DO UPDATE
        SET end_at = now() - interval '30 seconds', submitted = false, answers = '{"00000000-0000-0000-0000-000000000001":"opt-1"}'::jsonb, finalize_attempts = 0;
      `;

      const summary = await finalizeExpiredSessions(50);
      expect(summary.finalizedCount).toBeGreaterThanOrEqual(1);

      // Verify session is now submitted
      const [session] = await clients.ownerSql`
        SELECT submitted FROM public.academic_exam_sessions
        WHERE student_id = ${studentA} AND exam_id = ${examId}
      `;
      expect(session.submitted).toBe(true);

      // Verify submission was recorded
      const [sub] = await clients.ownerSql`
        SELECT score, auto_submitted FROM public.academic_exam_submissions
        WHERE student_id = ${studentA} AND exam_id = ${examId}
      `;
      expect(sub).toBeDefined();
      expect(Number(sub.score)).toBe(10);
      expect(sub.auto_submitted).toBe(true);
    });

    it('increments finalize_attempts and continues on poison session without halting', async () => {
      // Create a corrupted exam with missing answer key for studentB
      const poisonExamId = 'e-cron-poison';
      await clients.ownerSql`
        INSERT INTO public.academic_exams (
          id, course_id, title, description, type, duration_minutes, total_marks, passing_marks,
          start_date, end_date
        ) VALUES (
          ${poisonExamId}, ${courseId}, 'امتحان فاسد', 'وصف', 'quiz', 30, 10, 5,
          now() - interval '2 days', now() + interval '1 day'
        ) ON CONFLICT (id) DO NOTHING;
      `;

      await clients.ownerSql`
        INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
        VALUES ('00000000-0000-0000-0000-000000000009', ${poisonExamId}, 1, 'Poison Q', '[]'::jsonb, 10)
        ON CONFLICT (id) DO NOTHING;
      `;

      // Create expired session for studentB
      await clients.ownerSql`
        INSERT INTO public.academic_exam_sessions (
          student_id, exam_id, end_at, submitted, answers, finalize_attempts
        ) VALUES (
          ${studentB}, ${poisonExamId}, now() - interval '30 seconds', false, '{}'::jsonb, 0
        ) ON CONFLICT (student_id, exam_id) DO UPDATE
        SET end_at = now() - interval '30 seconds', submitted = false, finalize_attempts = 0;
      `;

      const summary = await finalizeExpiredSessions(50);
      expect(summary.failedCount).toBeGreaterThanOrEqual(1);

      // Verify finalize_attempts was incremented
      const [session] = await clients.ownerSql`
        SELECT finalize_attempts FROM public.academic_exam_sessions
        WHERE student_id = ${studentB} AND exam_id = ${poisonExamId}
      `;
      expect(session.finalize_attempts).toBe(1);

      // When finalize_attempts reaches 5, it is excluded
      await clients.ownerSql`
        UPDATE public.academic_exam_sessions
        SET finalize_attempts = 5
        WHERE student_id = ${studentB} AND exam_id = ${poisonExamId}
      `;

      const summaryAfter5 = await finalizeExpiredSessions(50);
      // Poison session is ignored because finalize_attempts < 5
      expect(summaryAfter5.attempted).toBe(0);
    });
  });
});

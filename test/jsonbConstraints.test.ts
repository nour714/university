import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import postgres from 'postgres';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { saveExamAnswers } from '@/server/exams/service';
import { submitAndGradeExam } from '@/server/exams/submit';
import { runMigrations } from '@/scripts/migrate';

describe('TASK 1 — JSONB Encoding and Type Constraints (F1)', () => {
  let clients: TestDbClients;
  const testStudentId = '00000000-0000-0000-0000-000000000001';
  const testCourseId = 'test-course-jsonb';
  const testExamId = 'test-exam-jsonb';
  const testQ1Id = 'test-q-jsonb-01';
  const testQ2Id = 'test-q-jsonb-02';

  beforeAll(async () => {
    clients = await setupTestDatabase();

    // Seed test fixtures for integration tests
    await clients.ownerSql`
      INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
      VALUES (${testStudentId}, '30101010101001', '$argon2id$v=19$m=19456,t=2,p=1$fake$fake', true)
      ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_courses (id, code, title, description, doctor_name, credit_hours, level, department, semester)
      VALUES (${testCourseId}, 'AI102', 'Course JSONB', 'Desc', 'Dr. Test', 3, 1, 'AI', 'Semester 1')
      ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_exams (
        id, course_id, title, description, type, duration_minutes, total_marks, passing_marks,
        start_date, end_date
      ) VALUES (
        ${testExamId}, ${testCourseId}, 'Exam JSONB', 'Desc',
        'quiz', 60, 20, 10,
        now() - interval '1 hour', now() + interval '2 hours'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
      VALUES 
        (${testQ1Id}, ${testExamId}, 1, 'Question 1', '[{"id":"opt_a","text":"A"},{"id":"opt_b","text":"B"}]'::jsonb, 10),
        (${testQ2Id}, ${testExamId}, 2, 'Question 2', '[{"id":"opt_c","text":"C"},{"id":"opt_d","text":"D"}]'::jsonb, 10)
      ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO academic_private.exam_keys (question_id, correct_option_id, explanation)
      VALUES 
        (${testQ1Id}, 'opt_a', 'Option A is correct'),
        (${testQ2Id}, 'opt_c', 'Option C is correct')
      ON CONFLICT (question_id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_exam_sessions (id, student_id, exam_id, end_at, answers)
      VALUES (
        '00000000-0000-0000-0000-000000000010'::uuid,
        ${testStudentId},
        ${testExamId},
        now() + interval '30 minutes',
        '{}'::jsonb
      ) ON CONFLICT (student_id, exam_id) DO NOTHING;
    `;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('1.4(a) Static check against double-encoding in tracked TypeScript files', () => {
    it('no tracked .ts file uses JSON.stringify fed to ::jsonb', () => {
      const gitFiles = execSync('git ls-files "*.ts"', { encoding: 'utf-8' })
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const forbiddenRegex = /JSON\.stringify\s*\([^)]+\)\s*\}?\s*::jsonb/;
      const violations: string[] = [];

      for (const relFile of gitFiles) {
        if (relFile.includes('jsonbConstraints.test.ts')) continue;
        const fullPath = path.join(process.cwd(), relFile);
        if (!fs.existsSync(fullPath)) continue;
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (forbiddenRegex.test(content)) {
          violations.push(relFile);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('1.4(c) Direct SQL INSERT of string scalar into JSONB columns is rejected by CHECK constraints', () => {
    it('rejects string scalar in academic_exam_questions.options', async () => {
      await expect(
        clients.ownerSql`
          INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
          VALUES ('chk-q1', ${testExamId}, 99, 'Test?', '"not-an-array"'::jsonb, 5)
        `
      ).rejects.toThrow();
    });

    it('rejects string scalar in academic_exam_sessions.answers', async () => {
      await expect(
        clients.ownerSql`
          INSERT INTO public.academic_exam_sessions (id, student_id, exam_id, end_at, answers)
          VALUES (
            '00000000-0000-0000-0000-000000000099'::uuid,
            ${testStudentId},
            'test-nonexistent-exam',
            now() + interval '10 minutes',
            '"not-an-object"'::jsonb
          )
        `
      ).rejects.toThrow();
    });

    it('rejects string scalar in academic_exam_submissions.answers and per_question', async () => {
      await expect(
        clients.ownerSql`
          INSERT INTO public.academic_exam_submissions (
            id, student_id, exam_id, score, total_points, passed, correct_count, wrong_count, unanswered_count, auto_submitted, answers, per_question
          )
          VALUES (
            '00000000-0000-0000-0000-000000000098'::uuid,
            ${testStudentId},
            'test-nonexistent-exam-1',
            0, 10, false, 0, 0, 0, false,
            '"not-an-object"'::jsonb,
            '{}'::jsonb
          )
        `
      ).rejects.toThrow();

      await expect(
        clients.ownerSql`
          INSERT INTO public.academic_exam_submissions (
            id, student_id, exam_id, score, total_points, passed, correct_count, wrong_count, unanswered_count, auto_submitted, answers, per_question
          )
          VALUES (
            '00000000-0000-0000-0000-000000000097'::uuid,
            ${testStudentId},
            'test-nonexistent-exam-2',
            0, 10, false, 0, 0, 0, false,
            '{}'::jsonb,
            '"not-an-object"'::jsonb
          )
        `
      ).rejects.toThrow();
    });

    it('rejects string scalar in academic_private.audit_log.details', async () => {
      await expect(
        clients.ownerSql`
          INSERT INTO academic_private.audit_log (actor, action, details)
          VALUES (${testStudentId}::uuid, 'TEST_CHECK', '"scalar_string"'::jsonb)
        `
      ).rejects.toThrow();
    });
  });

  describe('1.4(b) Integration assertions for jsonb_typeof after real operations', () => {
    it('verifies jsonb_typeof is object/array after draft save, submit, and audit log', async () => {
      // 1. Check academic_exam_questions options
      const [qRow] = await clients.ownerSql`
        SELECT jsonb_typeof(options) AS opt_type
        FROM public.academic_exam_questions
        WHERE exam_id = ${testExamId}
        LIMIT 1
      `;
      expect(qRow.opt_type).toBe('array');

      // 2. Draft save
      await saveExamAnswers(testExamId, testStudentId, { [testQ1Id]: 'opt_a' });
      const [sessionRow] = await clients.ownerSql`
        SELECT jsonb_typeof(answers) AS answers_type
        FROM public.academic_exam_sessions
        WHERE student_id = ${testStudentId} AND exam_id = ${testExamId}
      `;
      expect(sessionRow.answers_type).toBe('object');

      // 3. Submit
      await submitAndGradeExam(testExamId, testStudentId, { [testQ1Id]: 'opt_a', [testQ2Id]: 'opt_c' });
      const [subRow] = await clients.ownerSql`
        SELECT jsonb_typeof(answers) AS answers_type, jsonb_typeof(per_question) AS per_q_type
        FROM public.academic_exam_submissions
        WHERE student_id = ${testStudentId} AND exam_id = ${testExamId}
      `;
      expect(subRow.answers_type).toBe('object');
      expect(subRow.per_q_type).toBe('object');

      // 4. Audit log details
      const [auditRow] = await clients.ownerSql`
        SELECT jsonb_typeof(details) AS details_type
        FROM academic_private.audit_log
        WHERE details IS NOT NULL
        ORDER BY id DESC
        LIMIT 1
      `;
      expect(auditRow.details_type).toBe('object');
    });
  });

  describe('1.4(d) Database upgrade test from legacy schema (5cbcdcb)', () => {
    it('successfully upgrades dirty legacy database with double-encoded JSONB string scalars', async () => {
      const upgradeDbName = 'test_upgrade_legacy';
      await clients.ownerSql.unsafe(`CREATE DATABASE ${upgradeDbName};`);

      const port = 5434;
      const upgradeUrl = `postgres://postgres:postgres@localhost:${port}/${upgradeDbName}?sslmode=disable`;
      const upSql = postgres(upgradeUrl, { prepare: false });

      try {
        // Run 000_roles.sql
        const rolesSql = fs.readFileSync(path.join(process.cwd(), 'db/migrations/000_roles.sql'), 'utf-8');
        await upSql.unsafe(rolesSql);

        // Fetch old 001_initial_schema from commit 5cbcdcb
        const old001 = execSync('git show 5cbcdcb:db/migrations/001_initial_schema.sql', { encoding: 'utf-8' });
        await upSql.unsafe(old001);

        // Record 000 and 001 as applied in schema_migrations
        await upSql`
          CREATE TABLE IF NOT EXISTS public.schema_migrations (
            version VARCHAR(100) PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );
        `;
        await upSql`
          INSERT INTO public.schema_migrations (version) VALUES ('000_roles.sql'), ('001_initial_schema.sql');
        `;

        // Insert double-encoded dirty rows mimicking production state before fix (using 5cbcdcb schema)
        await upSql`
          INSERT INTO public.academic_courses (id, code, title, description, doctor_name, credit_hours, level, department, semester)
          VALUES ('course-dirty-1', 'CS101', 'Intro to CS', 'Description', 'Dr. Smith', 3, 1, 'AI', 'Fall')
          ON CONFLICT (id) DO NOTHING;
        `;
        await upSql`
          INSERT INTO public.academic_exams (id, course_id, title, duration_minutes, total_marks, passing_marks, start_date, end_date)
          VALUES ('ex-dirty', 'course-dirty-1', 'Dirty Exam', 60, 10, 5, now() - interval '1 hour', now() + interval '1 hour');
        `;

        // String scalar in options
        await upSql`
          INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
          VALUES ('q-dirty-1', 'ex-dirty', 1, 'Dirty Q?', '"[{\\"id\\":\\"opt1\\",\\"text\\":\\"One\\"}]"'::jsonb, 10);
        `;

        // String scalar in audit_log
        await upSql`
          INSERT INTO academic_private.audit_log (actor, action, details)
          VALUES (null, 'DIRTY_LOG', '"{\\"legacy\\": true}"'::jsonb);
        `;

        // Run migrations runner (will execute 002 -> 002a -> 003 -> 004 ...)
        await runMigrations(upgradeUrl);

        // Verify that 002a unwrapped them and 004 validated constraints
        const [upQ] = await upSql`
          SELECT jsonb_typeof(options) AS opt_type
          FROM public.academic_exam_questions
          WHERE id = 'q-dirty-1'
        `;
        expect(upQ.opt_type).toBe('array');

        const [upAudit] = await upSql`
          SELECT jsonb_typeof(details) AS details_type
          FROM academic_private.audit_log
          WHERE action = 'DIRTY_LOG'
        `;
        expect(upAudit.details_type).toBe('object');
      } finally {
        await upSql.end();
        await clients.ownerSql.unsafe(`DROP DATABASE ${upgradeDbName};`);
      }
    });
  });
});

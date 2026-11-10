import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { seed, loadAndValidateExamKeys } from '@/scripts/seed-data';

describe('TASK 2 — Seed and Example Files (F2)', () => {
  let clients: TestDbClients;

  beforeAll(async () => {
    clients = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('validates seed/exam-keys.example.json without errors', () => {
    const exampleKeysPath = path.join(process.cwd(), 'seed', 'exam-keys.example.json');
    const keysMap = loadAndValidateExamKeys(exampleKeysPath);
    expect(keysMap).toBeDefined();
    expect(Object.keys(keysMap).length).toBe(4);
    expect(keysMap['exam-ai301-midterm']['q1'].correctOptionId).toBe('opt1_c');
  });

  it('fresh DB -> migrate -> seed -> verifies counts for courses, contents, exams, questions, keys', async () => {
    const testDbName = 'test_seed_fresh';
    await clients.ownerSql.unsafe(`CREATE DATABASE ${testDbName};`);

    const port = 5434;
    const testDbUrl = `postgres://postgres:postgres@localhost:${port}/${testDbName}?sslmode=disable`;
    const db = postgres(testDbUrl, { prepare: false });

    try {
      // 1. Run migrations
      const { runMigrations } = await import('@/scripts/migrate');
      await runMigrations(testDbUrl);

      // 2. Run seed
      await seed(testDbUrl);

      // 3. Count rows in all target tables
      const [courses] = await db`SELECT count(*)::int AS count FROM public.academic_courses;`;
      const [contents] = await db`SELECT count(*)::int AS count FROM public.academic_course_contents;`;
      const [exams] = await db`SELECT count(*)::int AS count FROM public.academic_exams;`;
      const [questions] = await db`SELECT count(*)::int AS count FROM public.academic_exam_questions;`;
      const [keys] = await db`SELECT count(*)::int AS count FROM academic_private.exam_keys;`;

      expect(courses.count).toBeGreaterThan(0);
      expect(contents.count).toBeGreaterThan(0);
      expect(exams.count).toBe(4);
      expect(questions.count).toBe(15);
      expect(keys.count).toBe(15);

      // 4. Re-run seed -> assert idempotency (counts remain identical)
      await seed(testDbUrl);

      const [courses2] = await db`SELECT count(*)::int AS count FROM public.academic_courses;`;
      const [contents2] = await db`SELECT count(*)::int AS count FROM public.academic_course_contents;`;
      const [exams2] = await db`SELECT count(*)::int AS count FROM public.academic_exams;`;
      const [questions2] = await db`SELECT count(*)::int AS count FROM public.academic_exam_questions;`;
      const [keys2] = await db`SELECT count(*)::int AS count FROM academic_private.exam_keys;`;

      expect(courses2.count).toBe(courses.count);
      expect(contents2.count).toBe(contents.count);
      expect(exams2.count).toBe(exams.count);
      expect(questions2.count).toBe(questions.count);
      expect(keys2.count).toBe(keys.count);
    } finally {
      await db.end();
      await clients.ownerSql.unsafe(`DROP DATABASE ${testDbName};`);
    }
  });

  it('fails loudly if an exam key file references an invalid option ID or unknown question ID', () => {
    const invalidOptionFile = path.join(process.cwd(), 'test', 'fixtures', 'invalid-option.json');
    fs.mkdirSync(path.dirname(invalidOptionFile), { recursive: true });
    fs.writeFileSync(
      invalidOptionFile,
      JSON.stringify({
        'exam-ai301-midterm': {
          q1: { correctOptionId: 'NOT_AN_OPTION', explanation: 'test' },
        },
      })
    );

    try {
      expect(() => loadAndValidateExamKeys(invalidOptionFile)).toThrow(
        /has invalid correctOptionId "NOT_AN_OPTION"/
      );
    } finally {
      fs.unlinkSync(invalidOptionFile);
    }
  });
});

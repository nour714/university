import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import postgres from 'postgres';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { runMigrations } from '@/scripts/migrate';

describe('TASK 3 — Migration Runner, Roles & Least Privilege (F3, F9)', () => {
  let clients: TestDbClients;

  beforeAll(async () => {
    clients = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('3.1 Demotes roles created with BYPASSRLS to rolbypassrls = false after migration chain', async () => {
    const testDb = 'test_roles_demote';
    await clients.ownerSql.unsafe(`CREATE DATABASE ${testDb};`);

    const port = 5434;
    const dbUrl = `postgres://postgres:postgres@localhost:${port}/${testDb}?sslmode=disable`;
    const db = postgres(dbUrl, { prepare: false });

    try {
      // Intentionally give roles BYPASSRLS
      await db`ALTER ROLE academic_app BYPASSRLS;`;
      await db`ALTER ROLE academic_grader BYPASSRLS;`;

      const [preApp] = await db`SELECT rolbypassrls FROM pg_roles WHERE rolname = 'academic_app';`;
      const [preGrader] = await db`SELECT rolbypassrls FROM pg_roles WHERE rolname = 'academic_grader';`;
      expect(preApp.rolbypassrls).toBe(true);
      expect(preGrader.rolbypassrls).toBe(true);

      // Run full migration chain
      await runMigrations(dbUrl);

      // Verify both roles were demoted to rolbypassrls = false
      const [postApp] = await db`SELECT rolbypassrls FROM pg_roles WHERE rolname = 'academic_app';`;
      const [postGrader] = await db`SELECT rolbypassrls FROM pg_roles WHERE rolname = 'academic_grader';`;
      expect(postApp.rolbypassrls).toBe(false);
      expect(postGrader.rolbypassrls).toBe(false);
    } finally {
      await db.end();
      await clients.ownerSql.unsafe(`DROP DATABASE ${testDb};`);
    }
  });

  it('3.2 Migration runner supports --dry-run, --status, and --baseline on existing database', async () => {
    const testDb = 'test_runner_options';
    await clients.ownerSql.unsafe(`CREATE DATABASE ${testDb};`);

    const port = 5434;
    const dbUrl = `postgres://postgres:postgres@localhost:${port}/${testDb}?sslmode=disable`;
    const db = postgres(dbUrl, { prepare: false });

    try {
      // 1. Dry run on fresh database -> plans but applies zero migrations
      await runMigrations(dbUrl, { dryRun: true });
      const [c0] = await db`SELECT count(*)::int AS count FROM public.schema_migrations;`;
      expect(c0.count).toBe(0);

      // Simulate existing database that already ran 000 and 001 manually
      const rolesSql = require('node:fs').readFileSync(require('node:path').join(process.cwd(), 'db/migrations/000_roles.sql'), 'utf-8');
      const initialSchemaSql = require('node:fs').readFileSync(require('node:path').join(process.cwd(), 'db/migrations/001_initial_schema.sql'), 'utf-8');
      await db.unsafe(rolesSql);
      await db.unsafe(initialSchemaSql);

      // 2. Baseline option: baseline up to 001_initial_schema.sql without re-running them
      await runMigrations(dbUrl, { baseline: '001_initial_schema.sql' });
      const [c1] = await db`SELECT count(*)::int AS count FROM public.schema_migrations;`;
      expect(c1.count).toBe(2); // 000_roles.sql and 001_initial_schema.sql

      // 3. Status check
      await runMigrations(dbUrl, { status: true });

      // 4. Apply remaining migrations (002, 002a, 003, 004, 005)
      await runMigrations(dbUrl);
      const [cFinal] = await db`SELECT count(*)::int AS count FROM public.schema_migrations;`;
      expect(cFinal.count).toBeGreaterThanOrEqual(6);
    } finally {
      await db.end();
      await clients.ownerSql.unsafe(`DROP DATABASE ${testDb};`);
    }
  });

  it('3.2 Safety check refuses to run if schema_migrations contains a version missing on disk', async () => {
    const testDb = 'test_runner_safety';
    await clients.ownerSql.unsafe(`CREATE DATABASE ${testDb};`);

    const port = 5434;
    const dbUrl = `postgres://postgres:postgres@localhost:${port}/${testDb}?sslmode=disable`;
    const db = postgres(dbUrl, { prepare: false });

    try {
      await db`
        CREATE TABLE IF NOT EXISTS public.schema_migrations (
          version VARCHAR(100) PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      await db`
        INSERT INTO public.schema_migrations (version) VALUES ('999_phantom_migration_never_on_disk.sql');
      `;

      await expect(runMigrations(dbUrl)).rejects.toThrow(
        /Migration recorded in database is missing on disk: 999_phantom_migration_never_on_disk.sql/
      );
    } finally {
      await db.end();
      await clients.ownerSql.unsafe(`DROP DATABASE ${testDb};`);
    }
  });

  it('3.3 App role cannot SELECT from academic_private.audit_log (append-only)', async () => {
    let errorCaught = false;
    try {
      await clients.appSql`SELECT * FROM academic_private.audit_log LIMIT 1;`;
    } catch (err: any) {
      errorCaught = true;
      expect(err.message).toMatch(/permission denied/i);
    }
    expect(errorCaught).toBe(true);
  });

  it('3.3 Grader role cannot insert or update academic_private.exam_keys (SELECT-only)', async () => {
    let insertCaught = false;
    try {
      await clients.graderSql`
        INSERT INTO academic_private.exam_keys (question_id, correct_option_id, explanation)
        VALUES ('test-q-01', 'opt_b', 'expl');
      `;
    } catch (err: any) {
      insertCaught = true;
      expect(err.message).toMatch(/permission denied/i);
    }
    expect(insertCaught).toBe(true);

    let updateCaught = false;
    try {
      await clients.graderSql`
        UPDATE academic_private.exam_keys
           SET correct_option_id = 'opt_b'
         WHERE question_id = 'test-q-01';
      `;
    } catch (err: any) {
      updateCaught = true;
      expect(err.message).toMatch(/permission denied/i);
    }
    expect(updateCaught).toBe(true);
  });
});

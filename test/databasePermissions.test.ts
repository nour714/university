import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';

describe('Database Role Permissions & RLS Verification', () => {
  let clients: TestDbClients;

  beforeAll(async () => {
    clients = await setupTestDatabase();
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('academic_app MUST NOT read academic_private.exam_keys', async () => {
    let errorCaught = false;
    try {
      await clients.appSql`SELECT * FROM academic_private.exam_keys LIMIT 1`;
    } catch (err: any) {
      errorCaught = true;
      expect(err.message).toMatch(/permission denied for schema academic_private|permission denied/i);
    }
    expect(errorCaught).toBe(true);
  });

  it('academic_grader CAN read academic_private.exam_keys', async () => {
    const rows = await clients.graderSql`SELECT * FROM academic_private.exam_keys LIMIT 1`;
    expect(Array.isArray(rows)).toBe(true);
  });

  it('academic_grader CAN insert into academic_private.audit_log', async () => {
    let errorCaught = false;
    try {
      await clients.graderSql`
        INSERT INTO academic_private.audit_log (actor, action, details)
        VALUES (null, 'VITEST_GRADER_AUDIT', '{"test": true}'::jsonb)
      `;
    } catch {
      errorCaught = true;
    }
    expect(errorCaught).toBe(false);
  });

  it('academic_grader MUST NOT update end_at on academic_exam_sessions', async () => {
    let errorCaught = false;
    try {
      await clients.graderSql`
        UPDATE public.academic_exam_sessions
           SET end_at = now() + interval '10 hours'
      `;
    } catch (err: any) {
      errorCaught = true;
      expect(err.message).toMatch(/permission denied for table academic_exam_sessions|permission denied for column end_at/i);
    }
    expect(errorCaught).toBe(true);
  });

  it('academic_app MUST NOT update end_at or submitted on academic_exam_sessions', async () => {
    let errorCaught = false;
    try {
      await clients.appSql`
        UPDATE public.academic_exam_sessions
           SET end_at = now() + interval '10 hours'
      `;
    } catch (err: any) {
      errorCaught = true;
      expect(err.message).toMatch(/permission denied/i);
    }
    expect(errorCaught).toBe(true);
  });
});

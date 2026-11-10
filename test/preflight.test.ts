import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { runPreflight } from '@/scripts/preflight';

describe('Production Preflight Verification Tests (Task 9)', () => {
  let clients: TestDbClients;

  beforeAll(async () => {
    clients = await setupTestDatabase();
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('9.3(a) preflight passes with 0 failures on cleanly migrated database', async () => {
    const result = await runPreflight(clients.ownerUrl);
    expect(result.ready).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.info.version).toBeDefined();
    expect(result.info.appliedMigrationsCount).toBeGreaterThanOrEqual(6);
  });

  it('9.3(b) preflight fails and reports error if a role has BYPASSRLS enabled', async () => {
    // Introduce violation: grant BYPASSRLS to academic_app
    await clients.ownerSql`ALTER ROLE academic_app BYPASSRLS;`;

    try {
      const result = await runPreflight(clients.ownerUrl);
      expect(result.ready).toBe(false);
      expect(result.failures.length).toBeGreaterThan(0);
      expect(
        result.failures.some((f) => f.includes('academic_app') && f.includes('rolbypassrls'))
      ).toBe(true);
    } finally {
      // Restore clean state
      await clients.ownerSql`ALTER ROLE academic_app NOBYPASSRLS;`;
    }

    // Verify it passes again after restoration
    const restoredResult = await runPreflight(clients.ownerUrl);
    expect(restoredResult.ready).toBe(true);
  });

  it('9.3(c) preflight fails and reports missing table if a required table is absent', async () => {
    // Temporarily drop a non-critical table in test DB
    await clients.ownerSql`DROP TABLE IF EXISTS public.academic_notifications CASCADE;`;

    try {
      const result = await runPreflight(clients.ownerUrl);
      expect(result.ready).toBe(false);
      expect(
        result.failures.some((f) => f.includes('public.academic_notifications') && f.includes('missing'))
      ).toBe(true);
    } finally {
      // Re-create notifications table to leave database clean
      await clients.ownerSql`
        CREATE TABLE IF NOT EXISTS public.academic_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
          title VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
          priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
          is_read BOOLEAN NOT NULL DEFAULT false,
          action_url VARCHAR(255) NULL,
          action_label VARCHAR(50) NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
    }
  });
});

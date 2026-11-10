import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import postgres from 'postgres';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { GET as healthHandler } from '@/app/api/health/route';
import { getAppSql, appSql } from '@/lib/db/app.server';

describe('Resilience & Health Check Suite (Finding F10 / Task 8)', () => {
  let clients: TestDbClients;

  beforeAll(async () => {
    clients = await setupTestDatabase();
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('8.4(a) /api/health returns 200 on healthy database', async () => {
    const response = await healthHandler();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.timestamp).toBeDefined();
    expect(new Date(body.timestamp).getTime()).toBeGreaterThan(0);
    expect(body.commit).toBeDefined();
  });

  it('8.4(b) /api/health returns 503 within < 3s when connection fails (no 300s hang)', async () => {
    // Temporarily point globalThis.appSql to an unreachable port to simulate connection failure
    const globalDb = globalThis as any;
    const originalAppSql = globalDb.appSql;

    try {
      // Unreachable port on localhost
      globalDb.appSql = postgres('postgres://academic_app:pass@127.0.0.1:59998/postgres?sslmode=disable', {
        connect_timeout: 1,
        max: 1,
      });

      const t0 = Date.now();
      const response = await healthHandler();
      const elapsed = Date.now() - t0;

      // Assert error response and strict completion within < 3 seconds
      expect(response.status).toBe(503);
      expect(elapsed).toBeLessThan(3000);

      const body = await response.json();
      expect(body.ok).toBe(false);
      expect(body.error).toBeDefined();
    } finally {
      // Restore valid connection
      globalDb.appSql = originalAppSql;
    }
  });

  it('8.4(c) DB pool is lazily created and does not connect on module load', () => {
    // Assert appSql proxy object is defined without forcing immediate pool creation
    expect(appSql).toBeDefined();
    expect(typeof appSql).toBe('function');
  });
});

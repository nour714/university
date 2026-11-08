import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { validateScriptDbUrl } from './env';

export async function runPermissionsTest(ownerUrl?: string) {
  const dbUrl = ownerUrl || process.env.DATABASE_URL_OWNER;
  if (!dbUrl) {
    throw new Error('[PERMISSIONS TEST] DATABASE_URL_OWNER is required.');
  }
  validateScriptDbUrl('DATABASE_URL_OWNER', dbUrl);

  const sql = postgres(dbUrl, {
    prepare: false,
    ssl: process.env.DB_SSL === 'require' ? 'require' : false,
  });

  try {
    console.log('[PERMISSIONS TEST] Running db/tests/permissions.sql...');
    const testFile = path.join(process.cwd(), 'db', 'tests', 'permissions.sql');
    const sqlContent = fs.readFileSync(testFile, 'utf-8');

    await sql.unsafe(sqlContent);
    console.log('[PERMISSIONS TEST] All role permission checks passed cleanly!');
    return true;
  } finally {
    await sql.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('test-permissions.ts')) {
  (async () => {
    let teardown: (() => Promise<void>) | null = null;
    if (!process.env.DATABASE_URL_OWNER) {
      console.log('[PERMISSIONS TEST] No DATABASE_URL_OWNER provided. Bootstrapping embedded test database...');
      const { setupTestDatabase, teardownTestDatabase } = await import('../test/setupTestDb');
      await setupTestDatabase();
      teardown = teardownTestDatabase;
    } else {
      await runPermissionsTest();
    }
    if (teardown) {
      await teardown();
    }
  })().catch((err) => {
    console.error('[PERMISSIONS TEST FAILED]', err);
    process.exit(1);
  });
}

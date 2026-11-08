import path from 'node:path';
import fs from 'node:fs';
import postgres from 'postgres';
import { runMigrations } from '@/scripts/migrate';
import { runPermissionsTest } from '@/scripts/test-permissions';

let embeddedPgInstance: any = null;
let ownerSql: postgres.Sql | null = null;
let appSqlTest: postgres.Sql | null = null;
let graderSqlTest: postgres.Sql | null = null;

export interface TestDbClients {
  ownerSql: postgres.Sql;
  appSql: postgres.Sql;
  graderSql: postgres.Sql;
  ownerUrl: string;
  appUrl: string;
  graderUrl: string;
}

export async function setupTestDatabase(): Promise<TestDbClients> {
  const testPort = 5434;
  const dbDir = path.join(process.cwd(), '.pg-vitest-data');

  if (!embeddedPgInstance) {
    if (fs.existsSync(dbDir)) {
      try {
        fs.rmSync(dbDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }

    const { default: EmbeddedPostgres } = await import('embedded-postgres');
    embeddedPgInstance = new EmbeddedPostgres({
      databaseDir: dbDir,
      port: testPort,
      user: 'postgres',
      password: 'postgres',
      initdbFlags: ['-E', 'UTF8', '--locale=C'],
    });

    await embeddedPgInstance.initialise();
    await embeddedPgInstance.start();
  }

  const ownerUrl = `postgres://postgres:postgres@localhost:${testPort}/postgres?sslmode=disable`;
  const appUrl = `postgres://academic_app:app_pass_test@localhost:${testPort}/postgres?sslmode=disable`;
  const graderUrl = `postgres://academic_grader:grader_pass_test@localhost:${testPort}/postgres?sslmode=disable`;

  // Set environment variables for services under test
  process.env.DATABASE_URL_OWNER = ownerUrl;
  process.env.DATABASE_URL_APP = appUrl;
  process.env.DATABASE_URL_GRADER = graderUrl;
  process.env.APP_SECRET = 'test_app_secret_at_least_32_characters_long_for_vitest';
  process.env.CODE_PEPPER = 'test_code_pepper_at_least_32_characters_long_for_vitest';
  process.env.CRON_SECRET = 'test_cron_secret_at_least_32_characters_long_for_vitest';
  process.env.DB_SSL = 'disable';
  process.env.DB_POOL_MAX = '5';

  // Run migrations 000 -> 001 -> 002 -> 003
  await runMigrations(ownerUrl);

  // Set role passwords
  ownerSql = postgres(ownerUrl, { prepare: false });
  await ownerSql`ALTER ROLE academic_app WITH PASSWORD 'app_pass_test';`;
  await ownerSql`ALTER ROLE academic_grader WITH PASSWORD 'grader_pass_test';`;

  // Run permissions test
  await runPermissionsTest(ownerUrl);

  appSqlTest = postgres(appUrl, { prepare: false });
  graderSqlTest = postgres(graderUrl, { prepare: false });

  return {
    ownerSql,
    appSql: appSqlTest,
    graderSql: graderSqlTest,
    ownerUrl,
    appUrl,
    graderUrl,
  };
}

export async function teardownTestDatabase() {
  if (appSqlTest) {
    await appSqlTest.end();
    appSqlTest = null;
  }
  if (graderSqlTest) {
    await graderSqlTest.end();
    graderSqlTest = null;
  }
  if (ownerSql) {
    await ownerSql.end();
    ownerSql = null;
  }
  if (embeddedPgInstance) {
    try {
      await embeddedPgInstance.stop();
    } catch {
      // ignore
    }
    embeddedPgInstance = null;
  }
}

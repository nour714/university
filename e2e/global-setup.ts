import path from 'node:path';
import fs from 'node:fs';
import postgres from 'postgres';
import { runMigrations } from '../scripts/migrate';
import { seed } from '../scripts/seed-data';

interface EmbeddedPostgresInstance {
  initialise(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

let embeddedPgInstance: EmbeddedPostgresInstance | null = null;

export default async function globalSetup() {
  const testPort = 5434;
  const dbDir = path.join(process.cwd(), '.pg-vitest-data');

  const ownerUrl = `postgres://postgres:postgres@localhost:${testPort}/postgres?sslmode=disable`;
  const appUrl = `postgres://academic_app:test_app_pass_32_chars_minimum@localhost:${testPort}/postgres?sslmode=disable`;
  const graderUrl = `postgres://academic_grader:test_grader_pass_32_chars_minimum@localhost:${testPort}/postgres?sslmode=disable`;

  // Temporarily back up .env.local so Next.js doesn't try to connect to external Supabase
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envBakPath = path.join(process.cwd(), '.env.local.e2e-bak');
  let backedUpEnv = false;

  if (fs.existsSync(envLocalPath)) {
    fs.renameSync(envLocalPath, envBakPath);
    backedUpEnv = true;
  }

  // Write temporary test env for Next.js webServer
  const envProductionLocalPath = path.join(process.cwd(), '.env.production.local');
  const testEnvContent = [
    `DATABASE_URL_OWNER="${ownerUrl}"`,
    `DATABASE_URL_APP="${appUrl}"`,
    `DATABASE_URL_GRADER="${graderUrl}"`,
    'APP_SECRET="test_app_secret_32_characters_minimum_length"',
    'CODE_PEPPER="test_code_pepper_32_characters_minimum_length"',
    'CRON_SECRET="test_cron_secret_16_min"',
    'DB_SSL="disable"',
    'DB_POOL_MAX="5"',
    'SEED_DEMO_PASSWORD="Student@2026"',
    'E2E_HTTP_ONLY="1"',
  ].join('\n');
  fs.writeFileSync(envProductionLocalPath, testEnvContent, 'utf-8');

  // Explicitly ensure NODE_ENV is test during seeding so student accounts are generated
  (process.env as Record<string, string>).NODE_ENV = 'test';
  process.env.DATABASE_URL_OWNER = ownerUrl;
  process.env.DATABASE_URL_APP = appUrl;
  process.env.DATABASE_URL_GRADER = graderUrl;
  process.env.APP_SECRET = 'test_app_secret_32_characters_minimum_length';
  process.env.CODE_PEPPER = 'test_code_pepper_32_characters_minimum_length';
  process.env.CRON_SECRET = 'test_cron_secret_16_min';
  process.env.DB_SSL = 'disable';
  process.env.DB_POOL_MAX = '5';
  process.env.SEED_DEMO_PASSWORD = 'Student@2026';

  let isRunning = false;
  try {
    const testClient = postgres(ownerUrl, { connect_timeout: 1, max: 1 });
    await testClient`SELECT 1`;
    await testClient.end();
    isRunning = true;
  } catch {
    isRunning = false;
  }

  if (!isRunning) {
    console.log('[E2E Global Setup] Starting embedded PostgreSQL on port 5434...');
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
    console.log('[E2E Global Setup] Embedded PostgreSQL started successfully.');
  } else {
    console.log('[E2E Global Setup] PostgreSQL already running on port 5434.');
  }

  // 1. Run migrations
  console.log('[E2E Global Setup] Applying database migrations...');
  await runMigrations(ownerUrl);

  // 2. Set role passwords
  const ownerSql = postgres(ownerUrl, { prepare: false });
  try {
    await ownerSql`ALTER ROLE academic_app WITH PASSWORD 'test_app_pass_32_chars_minimum';`;
    await ownerSql`ALTER ROLE academic_grader WITH PASSWORD 'test_grader_pass_32_chars_minimum';`;
  } finally {
    await ownerSql.end();
  }

  // 3. Seed data
  console.log('[E2E Global Setup] Seeding test database...');
  await seed(ownerUrl);
  console.log('[E2E Global Setup] Test database seeded successfully.');

  return async () => {
    // Clean up .env.production.local
    if (fs.existsSync(envProductionLocalPath)) {
      try {
        fs.unlinkSync(envProductionLocalPath);
      } catch {
        // ignore
      }
    }

    // Restore .env.local
    if (backedUpEnv && fs.existsSync(envBakPath)) {
      try {
        fs.renameSync(envBakPath, envLocalPath);
      } catch {
        // ignore
      }
    }

    if (embeddedPgInstance) {
      console.log('[E2E Global Teardown] Stopping embedded PostgreSQL...');
      try {
        await embeddedPgInstance.stop();
        console.log('[E2E Global Teardown] Embedded PostgreSQL stopped.');
      } catch (err) {
        console.error('[E2E Global Teardown] Error stopping PostgreSQL:', err);
      }
    }
  };
}

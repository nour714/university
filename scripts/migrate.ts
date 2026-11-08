import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { validateScriptDbUrl } from './env';

export async function runMigrations(customOwnerUrl?: string) {
  const dbUrl = customOwnerUrl || process.env.DATABASE_URL_OWNER;
  if (!dbUrl) {
    throw new Error('[MIGRATE] DATABASE_URL_OWNER environment variable is required.');
  }

  validateScriptDbUrl('DATABASE_URL_OWNER', dbUrl);

  const sql = postgres(dbUrl, {
    prepare: false,
    ssl: process.env.DB_SSL === 'require' ? 'require' : false,
  });

  try {
    console.log('[MIGRATE] Connected to database as owner. Initializing migration table...');

    await sql`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const appliedRows = await sql`
      SELECT version FROM public.schema_migrations
    `;
    const appliedSet = new Set(appliedRows.map((r) => r.version));

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[MIGRATE] Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`[MIGRATE] Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      await sql.unsafe(sqlContent);

      await sql`
        INSERT INTO public.schema_migrations (version) VALUES (${file});
      `;
      console.log(`[MIGRATE] Applied ${file} successfully.`);
    }

    console.log('[MIGRATE] All migrations applied successfully.');
  } finally {
    await sql.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations().catch((err) => {
    console.error('[MIGRATE ERROR]', err);
    process.exit(1);
  });
}

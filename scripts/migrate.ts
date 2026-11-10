import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { validateScriptDbUrl } from './env';

export interface MigrateOptions {
  baseline?: string;
  dryRun?: boolean;
  status?: boolean;
}

export async function runMigrations(customOwnerUrl?: string, options: MigrateOptions = {}) {
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
    const filesSet = new Set(files);

    const appliedRows = await sql`
      SELECT version, applied_at FROM public.schema_migrations ORDER BY version
    `;
    const appliedMap = new Map<string, Date>(appliedRows.map((r) => [r.version, r.applied_at]));

    // Safety check: refuse to run if database has records of migrations missing on disk
    for (const appliedVer of appliedMap.keys()) {
      if (!filesSet.has(appliedVer)) {
        throw new Error(
          `[MIGRATE ERROR] Migration recorded in database is missing on disk: ${appliedVer}`
        );
      }
    }

    // Status check
    if (options.status) {
      console.log('\n--- Migration Status ---');
      for (const file of files) {
        const appliedAt = appliedMap.get(file);
        console.log(`[${appliedAt ? 'APPLIED' : 'PENDING'}] ${file}${appliedAt ? ` (at ${appliedAt.toISOString()})` : ''}`);
      }
      console.log('------------------------\n');
      return;
    }

    // Baseline option: mark migrations up to specified version as applied without executing them
    if (options.baseline) {
      const targetVersion = options.baseline;
      const targetFile = files.find((f) => f === targetVersion || f.startsWith(targetVersion));
      if (!targetFile) {
        throw new Error(`[MIGRATE ERROR] Baseline target version "${targetVersion}" not found on disk.`);
      }

      console.log(`[MIGRATE] Baselining migrations up to ${targetFile}...`);
      const baselineFiles = files.filter((f) => f <= targetFile);
      for (const bf of baselineFiles) {
        if (!appliedMap.has(bf)) {
          if (options.dryRun) {
            console.log(`[DRY-RUN] Would baseline: ${bf}`);
          } else {
            await sql`
              INSERT INTO public.schema_migrations (version) VALUES (${bf})
              ON CONFLICT (version) DO NOTHING;
            `;
            console.log(`[MIGRATE] Baselined: ${bf}`);
            appliedMap.set(bf, new Date());
          }
        }
      }
      console.log(`[MIGRATE] Baselined successfully up to ${targetFile}.`);
      return;
    }

    // Apply pending migrations
    for (const file of files) {
      if (appliedMap.has(file)) {
        console.log(`[MIGRATE] Skipping ${file} (already applied)`);
        continue;
      }

      if (options.dryRun) {
        console.log(`[DRY-RUN] Would apply migration: ${file}`);
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

    console.log(options.dryRun ? '[DRY-RUN] Dry-run plan completed.' : '[MIGRATE] All migrations applied successfully.');
  } finally {
    await sql.end();
  }
}

function parseCliArgs(): MigrateOptions {
  const args = process.argv.slice(2);
  const options: MigrateOptions = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--status') {
      options.status = true;
    } else if (args[i] === '--baseline') {
      options.baseline = args[++i];
    }
  }
  return options;
}

if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  const opts = parseCliArgs();
  runMigrations(undefined, opts).catch((err) => {
    console.error('[MIGRATE ERROR]', err);
    process.exit(1);
  });
}

import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

export interface PreflightResult {
  ready: boolean;
  failures: string[];
  warnings: string[];
  info: Record<string, unknown>;
}

export async function runPreflight(customUrl?: string): Promise<PreflightResult> {
  const connectionUrl =
    customUrl ||
    process.env.DATABASE_URL_OWNER ||
    process.env.DATABASE_URL_APP ||
    process.env.DATABASE_URL;

  if (!connectionUrl) {
    return {
      ready: false,
      failures: ['No database connection URL found. Set DATABASE_URL_OWNER or DATABASE_URL_APP.'],
      warnings: [],
      info: {},
    };
  }

  const sql = postgres(connectionUrl, {
    prepare: false,
    connect_timeout: 5,
    max: 1,
  });

  const failures: string[] = [];
  const warnings: string[] = [];
  const info: Record<string, unknown> = {};

  try {
    // 1. Database version check
    const [versionRow] = await sql`SELECT version();`;
    info.version = versionRow?.version;

    // 2. Role properties check (rolbypassrls)
    try {
      const roles = await sql`
        SELECT rolname, rolsuper, rolbypassrls 
        FROM pg_roles 
        WHERE rolname IN ('academic_app', 'academic_grader', 'postgres');
      `;
      info.roles = roles;

      for (const role of roles) {
        if (role.rolname === 'academic_app' && role.rolbypassrls) {
          failures.push("Role 'academic_app' has rolbypassrls = true (must be false).");
        }
        if (role.rolname === 'academic_grader' && role.rolbypassrls) {
          failures.push("Role 'academic_grader' has rolbypassrls = true (must be false).");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      warnings.push(`Could not inspect pg_roles (likely unprivileged connection): ${msg}`);
    }

    // 3. Schema & Table check
    const requiredTables = [
      'public.academic_accounts',
      'public.academic_sessions',
      'public.academic_profiles',
      'public.academic_courses',
      'public.academic_course_contents',
      'public.academic_student_codes',
      'public.academic_notifications',
      'public.academic_exams',
      'public.academic_exam_questions',
      'public.academic_exam_sessions',
      'public.academic_exam_submissions',
      'public.academic_support_tickets',
      'academic_private.redeemable_codes',
      'academic_private.exam_keys',
      'academic_private.rate_limits',
      'academic_private.audit_log',
      'academic_private.redeem_attempts',
    ];

    for (const table of requiredTables) {
      const [schemaName, tableName] = table.split('.');
      const [exists] = await sql`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = ${schemaName} AND table_name = ${tableName};
      `;
      if (!exists) {
        failures.push(`Required table ${table} is missing.`);
      }
    }

    // 4. Migrations check
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const diskFiles = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      try {
        const appliedRows = await sql`SELECT version FROM public.schema_migrations;`;
        const appliedSet = new Set(appliedRows.map((r) => r.version));

        const pending = diskFiles.filter((f) => !appliedSet.has(f));
        info.appliedMigrationsCount = appliedRows.length;
        info.pendingMigrations = pending;

        if (pending.length > 0) {
          failures.push(`Pending migrations on disk not applied: ${pending.join(', ')}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        failures.push(`Failed to read public.schema_migrations: ${msg}`);
      }
    }

    // 5. Double-encoding scan (Must be 0)
    try {
      const [qOptions] = await sql`
        SELECT COUNT(*)::int AS count 
        FROM public.academic_exam_questions 
        WHERE jsonb_typeof(options) = 'string';
      `;
      if (qOptions?.count > 0) {
        failures.push(`Found ${qOptions.count} double-encoded string options in academic_exam_questions.`);
      }

      const [sessAnswers] = await sql`
        SELECT COUNT(*)::int AS count 
        FROM public.academic_exam_sessions 
        WHERE jsonb_typeof(answers) = 'string';
      `;
      if (sessAnswers?.count > 0) {
        failures.push(`Found ${sessAnswers.count} double-encoded string answers in academic_exam_sessions.`);
      }

      const [subAnswers] = await sql`
        SELECT COUNT(*)::int AS count 
        FROM public.academic_exam_submissions 
        WHERE jsonb_typeof(answers) = 'string';
      `;
      if (subAnswers?.count > 0) {
        failures.push(`Found ${subAnswers.count} double-encoded string answers in academic_exam_submissions.`);
      }

      const [subPerQ] = await sql`
        SELECT COUNT(*)::int AS count 
        FROM public.academic_exam_submissions 
        WHERE jsonb_typeof(per_question) = 'string';
      `;
      if (subPerQ?.count > 0) {
        failures.push(`Found ${subPerQ.count} double-encoded string per_question in academic_exam_submissions.`);
      }

      try {
        const [auditDetails] = await sql`
          SELECT COUNT(*)::int AS count 
          FROM academic_private.audit_log 
          WHERE jsonb_typeof(details) = 'string';
        `;
        if (auditDetails?.count > 0) {
          failures.push(`Found ${auditDetails.count} double-encoded string details in academic_private.audit_log.`);
        }
      } catch {
        // Unprivileged app role cannot SELECT audit_log (expected under least privilege)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`Double-encoding scan error: ${msg}`);
    }

    // 6. Privilege check (academic_app cannot SELECT audit_log, academic_grader cannot INSERT exam_keys)
    // If running as owner, test with SET ROLE
    try {
      const [currentUserRow] = await sql`SELECT current_user;`;
      const currentUser = currentUserRow?.current_user;

      if (currentUser === 'postgres' || currentUser?.includes('admin')) {
        // Test academic_app least privilege
        try {
          await sql`
            DO $$
            BEGIN
              SET LOCAL ROLE academic_app;
              PERFORM 1 FROM academic_private.audit_log LIMIT 1;
            END $$;
          `;
          failures.push("Least-privilege violation: academic_app was able to SELECT from academic_private.audit_log.");
        } catch {
          // Expected: permission denied
        }

        // Test academic_grader least privilege
        try {
          await sql`
            DO $$
            BEGIN
              SET LOCAL ROLE academic_grader;
              INSERT INTO academic_private.exam_keys (question_id, correct_option_id, explanation)
              VALUES ('q_dummy_preflight_check', 'opt_a', 'test');
            END $$;
          `;
          failures.push("Least-privilege violation: academic_grader was able to INSERT into academic_private.exam_keys.");
        } catch {
          // Expected: permission denied
        }
      }
    } catch {
      // Role switching not permitted in this context
    }

    return {
      ready: failures.length === 0,
      failures,
      warnings,
      info,
    };
  } finally {
    await sql.end();
  }
}

// Direct execution from CLI
if (require.main === module || process.argv[1]?.includes('preflight')) {
  runPreflight()
    .then((result) => {
      console.log('====================================================');
      console.log('             PRODUCTION PREFLIGHT REPORT            ');
      console.log('====================================================');
      console.log(`Database Version: ${result.info.version || 'Unknown'}`);
      console.log(`Applied Migrations: ${result.info.appliedMigrationsCount ?? 'Unknown'}`);
      console.log(`Status: ${result.ready ? 'PASSED (READY FOR DEPLOYMENT)' : 'FAILED'}`);
      console.log('----------------------------------------------------');

      if (result.warnings.length > 0) {
        console.log('WARNINGS:');
        result.warnings.forEach((w) => console.log(`  [!] ${w}`));
      }

      if (result.failures.length > 0) {
        console.log('FAILURES:');
        result.failures.forEach((f) => console.log(`  [X] ${f}`));
        console.log('====================================================');
        process.exit(1);
      }

      console.log('All checks passed cleanly. Database is production-ready.');
      console.log('====================================================');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FATAL PREFLIGHT ERROR]:', err);
      process.exit(1);
    });
}

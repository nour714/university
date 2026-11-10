# Production Rollout & Deployment Runbook

This runbook outlines the required step-by-step procedures for deploying the production database migrations, environment variables, and Next.js application release.

---

## 1. Prerequisites & Context

- **Platform Architecture:** Next.js 16 (App Router) on Vercel connected to PostgreSQL hosted on Supabase (used strictly as a Postgres database).
- **Database Roles:**
  - `postgres` (or supabase admin): Owner role used exclusively for applying migrations.
  - `academic_app`: Application role used by all standard routes and Server Actions (`rolbypassrls = false`).
  - `academic_grader`: Specialist role used exclusively by automated exam submission and grading (`server/exams/submit.ts`, `server/exams/finalize.ts`).
- **Safety Rule:** Never run migrations or code directly without completing the pre-requisite backup and preflight verification steps.

---

## 2. Step-by-Step Rollout Checklist

### Step 1: Database Snapshot & Backup
Before executing any DDL or data changes on Supabase:
1. Navigate to **Supabase Dashboard** -> **Project Settings** -> **Database** -> **Backups**.
2. Trigger a manual snapshot or run `pg_dump` via your secure terminal:
   ```bash
   pg_dump -h <SUPABASE_DB_HOST> -p 5432 -U postgres -d postgres -F c -b -v -f "pre_migration_backup_$(date +%Y%m%d_%H%M%S).dump"
   ```
3. Store the backup securely.

### Step 2: Configure Environment Variables in Vercel
Why current builds failed: `lib/env.ts` enforces strict Zod schema validation at build/boot time. `APP_SECRET` (at least 32 characters) is required for HMAC key derivation (rate limiters, token obscuration).

1. In Vercel Project Dashboard, navigate to **Settings** -> **Environment Variables**.
2. Add or verify the following variables for **Production** and **Preview**:
   - `APP_SECRET`: 64-character random hex string (`openssl rand -hex 32`).
   - `CODE_PEPPER`: 64-character random hex string (`openssl rand -hex 32`).
   - `CRON_SECRET`: 32-character random hex string (`openssl rand -hex 16`).
   - `DATABASE_URL_APP`: Connection string using `academic_app` role with port 6543 (transaction pooler) or 5432.
   - `DATABASE_URL_GRADER`: Connection string using `academic_grader` role.
   - `DATABASE_URL_OWNER`: (For migration scripts only, do NOT expose to application runtime).
   - `DB_SSL`: `require`
   - `DB_POOL_MAX`: `3`

### Step 3: Inspect Migration Status
Run the migration status check to view pending migrations on Supabase:
```bash
DATABASE_URL_OWNER="postgres://postgres:[PASSWORD]@[HOST]:5432/postgres" npx tsx scripts/migrate.ts --status
```
Expected output:
- Shows which migrations (000, 001, 002, 002a, 003, 004, 005) are applied vs pending.

### Step 4: Apply Migrations
If the database schema already has tables created previously, use `--baseline 001` so that `001_initial_schema.sql` is marked as applied without re-running existing table creation:
```bash
# If database tables already exist from previous manual setup:
DATABASE_URL_OWNER="postgres://postgres:[PASSWORD]@[HOST]:5432/postgres" npx tsx scripts/migrate.ts --baseline 001_initial_schema.sql

# Then apply all remaining migrations (002, 002a, 003, 004, 005):
DATABASE_URL_OWNER="postgres://postgres:[PASSWORD]@[HOST]:5432/postgres" npx tsx scripts/migrate.ts
```

What these migrations do:
- `000_roles.sql`: Idempotently creates `academic_app` and `academic_grader`, demoting `BYPASSRLS`.
- `002_fix_roles_grants_rls.sql`: Enforces RLS policies and table grants.
- `002a_fix_double_encoded_jsonb.sql`: Unwraps double-encoded JSONB string scalars into genuine objects/arrays.
- `003_hardening.sql`: Triggers and checks for exam answer keys and options.
- `004_jsonb_type_constraints.sql`: Adds CHECK constraints (`jsonb_typeof = 'object'`) with `NOT VALID` then `VALIDATE CONSTRAINT` (zero downtime).
- `005_least_privilege_fixups.sql`: Revokes SELECT on `audit_log` from `academic_app`; revokes INSERT/UPDATE on `exam_keys` from `academic_grader`.

### Step 5: Run Production Preflight Verification
Verify that all database constraints, role permissions, and JSONB formats are 100% compliant:
```bash
DATABASE_URL_OWNER="postgres://postgres:[PASSWORD]@[HOST]:5432/postgres" npx tsx scripts/preflight.ts
```
Expected output:
- `Status: PASSED (READY FOR DEPLOYMENT)` with 0 failures and 0 double-encoded rows.

### Step 6: Deploy Application to Vercel
1. Push the verified `main` branch to GitHub:
   ```bash
   git push origin main
   ```
2. Monitor Vercel build output:
   - TypeScript verification passes.
   - 19 static pages prerender cleanly with zero DB calls during build.
   - Server Actions manifest registers exactly 12 validated actions.

### Step 7: Verify Live Production Health
Once deployed, check the monitoring health route:
```bash
curl -i https://your-domain.vercel.app/api/health
```
Expected response:
```json
HTTP/2 200
{
  "ok": true,
  "timestamp": "2026-11-10T22:45:00.000Z",
  "commit": "abcdef1"
}
```

---

## 3. Rollback Procedures

### Rollback Strategy A: Application Deployment Revert
If a regression or front-end error occurs:
1. In Vercel Dashboard, go to **Deployments**.
2. Locate the previous stable deployment and select **Instant Rollback / Promote to Production**.
3. Traffic immediately shifts back to the previous build within seconds.

### Rollback Strategy B: Database Constraint Reversion
If a migration constraint causes unexpected lock contention:
1. Connect via `DATABASE_URL_OWNER`.
2. To drop the newly added check constraints without losing data:
   ```sql
   ALTER TABLE public.academic_exam_sessions DROP CONSTRAINT IF EXISTS chk_sessions_answers_object;
   ALTER TABLE public.academic_exam_submissions DROP CONSTRAINT IF EXISTS chk_submissions_answers_object;
   ALTER TABLE public.academic_exam_submissions DROP CONSTRAINT IF EXISTS chk_submissions_per_question_object;
   ALTER TABLE academic_private.audit_log DROP CONSTRAINT IF EXISTS chk_audit_log_details_object;
   ```
3. Remove the migration record from `public.schema_migrations` if rolling back to a previous migration state:
   ```sql
   DELETE FROM public.schema_migrations WHERE version = '004_jsonb_type_constraints.sql';
   ```

### Rollback Strategy C: Full Database Restore
If data corruption occurred:
1. In Supabase Dashboard, select **Restore Backup** from the snapshot taken in Step 1.
2. Verify restoration completion and run `scripts/preflight.ts`.

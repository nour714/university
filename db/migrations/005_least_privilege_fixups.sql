-- Migration: 005_least_privilege_fixups.sql
-- Description: Revoke SELECT on audit_log from academic_app (append-only audit log)
-- and revoke INSERT/UPDATE/DELETE on exam_keys from academic_grader (SELECT-only grading).

-- 1. App role cannot read audit_log (write-only / append-only audit trail)
REVOKE SELECT ON academic_private.audit_log FROM academic_app;
DROP POLICY IF EXISTS p_app_audit_log_select ON academic_private.audit_log;

-- 2. Grader role can only SELECT exam_keys; cannot insert, update, or delete answer keys
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON academic_private.exam_keys FROM academic_grader;
GRANT SELECT ON academic_private.exam_keys TO academic_grader;

-- 3. Ensure role demotions are permanent
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'academic_app') THEN
    ALTER ROLE academic_app NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'academic_grader') THEN
    ALTER ROLE academic_grader NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

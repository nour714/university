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
ALTER ROLE academic_app NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
ALTER ROLE academic_grader NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

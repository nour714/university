-- Migration: 002_fix_roles_grants_rls.sql
-- Description: Enforces least-privilege column grants, explicit RLS policies for app and grader, and grader audit_log insert

-- Section 1: Revoke excessive ALL grants from academic_app and academic_grader (Fix D3 & least-privilege)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM academic_app;
REVOKE ALL ON ALL TABLES IN SCHEMA academic_private FROM academic_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM academic_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA academic_private FROM academic_app;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM academic_grader;
REVOKE ALL ON ALL TABLES IN SCHEMA academic_private FROM academic_grader;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM academic_grader;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA academic_private FROM academic_grader;

-- Section 2: Schema USAGE
GRANT USAGE ON SCHEMA public TO academic_app;
GRANT USAGE ON SCHEMA public TO academic_grader;
GRANT USAGE ON SCHEMA academic_private TO academic_app;
GRANT USAGE ON SCHEMA academic_private TO academic_grader;

-- Section 3: Fine-grained Column/Table Grants for academic_app
-- Accounts: can read account info, update password and lockout, cannot update national_id
GRANT SELECT ON public.academic_accounts TO academic_app;
GRANT UPDATE (password_hash, must_change_password, failed_login_count, locked_until, password_changed_at, last_login_at, updated_at) 
  ON public.academic_accounts TO academic_app;

-- Sessions: manage student login sessions
GRANT SELECT, INSERT, DELETE ON public.academic_sessions TO academic_app;
GRANT UPDATE (last_seen_at, idle_expires_at, revoked_at) ON public.academic_sessions TO academic_app;

-- Profiles: read and update student profile
GRANT SELECT, INSERT, UPDATE ON public.academic_profiles TO academic_app;

-- Courses and contents: read-only for students
GRANT SELECT ON public.academic_courses TO academic_app;
GRANT SELECT ON public.academic_course_contents TO academic_app;

-- Student codes: read, insert enrollment, update status
GRANT SELECT, INSERT ON public.academic_student_codes TO academic_app;
GRANT UPDATE (status) ON public.academic_student_codes TO academic_app;

-- Notifications: read, insert system notifications, mark read, delete
GRANT SELECT, INSERT, DELETE ON public.academic_notifications TO academic_app;
GRANT UPDATE (is_read) ON public.academic_notifications TO academic_app;

-- Exams & Questions: app can read exams and sanitized questions (never keys)
GRANT SELECT ON public.academic_exams TO academic_app;
GRANT SELECT ON public.academic_exam_questions TO academic_app;

-- Exam Sessions: app can create session, save draft answers; CANNOT alter end_at or submitted
GRANT SELECT ON public.academic_exam_sessions TO academic_app;
GRANT INSERT (id, student_id, exam_id, end_at, answers, created_at, updated_at) 
  ON public.academic_exam_sessions TO academic_app;
GRANT UPDATE (answers, updated_at) ON public.academic_exam_sessions TO academic_app;

-- Exam Submissions: app role can ONLY read; CANNOT insert, update, or delete submissions
GRANT SELECT ON public.academic_exam_submissions TO academic_app;

-- Support tickets: app can insert and read
GRANT SELECT, INSERT ON public.academic_support_tickets TO academic_app;
GRANT USAGE, SELECT ON SEQUENCE public.academic_ticket_no_seq TO academic_app;

-- Rate limits & redeem attempts: app can manage rate limits
GRANT SELECT, INSERT, UPDATE, DELETE ON academic_private.rate_limits TO academic_app;
GRANT SELECT, INSERT ON academic_private.redeem_attempts TO academic_app;
GRANT USAGE, SELECT ON SEQUENCE academic_private.redeem_attempts_id_seq TO academic_app;

-- Redeemable codes: app can query code and mark redeemed
GRANT SELECT ON academic_private.redeemable_codes TO academic_app;
GRANT UPDATE (is_redeemed, redeemed_by, redeemed_at) ON academic_private.redeemable_codes TO academic_app;

-- Audit log: app can append and read (never update or delete)
GRANT SELECT, INSERT ON academic_private.audit_log TO academic_app;
GRANT USAGE, SELECT ON SEQUENCE academic_private.audit_log_id_seq TO academic_app;

-- STRICT: app role NEVER accesses exam_keys
REVOKE ALL ON academic_private.exam_keys FROM academic_app;

-- Section 4: Fine-grained Grants for academic_grader
GRANT SELECT ON public.academic_exams TO academic_grader;
GRANT SELECT ON public.academic_exam_questions TO academic_grader;
GRANT SELECT ON public.academic_exam_sessions TO academic_grader;
GRANT UPDATE (submitted, answers, updated_at) ON public.academic_exam_sessions TO academic_grader;

-- Grader inserts final submission; cannot update or delete submissions
GRANT SELECT, INSERT ON public.academic_exam_submissions TO academic_grader;

-- Grader is the ONLY role with access to exam_keys
GRANT SELECT ON academic_private.exam_keys TO academic_grader;

-- Grader audit log grant (Fix D2: Grader writes audit_log in submit transaction)
GRANT SELECT, INSERT ON academic_private.audit_log TO academic_grader;
GRANT USAGE, SELECT ON SEQUENCE academic_private.audit_log_id_seq TO academic_grader;

-- Section 5: Explicit RLS Policies for academic_app and academic_grader (Fix D1)

-- Accounts
CREATE POLICY p_app_accounts_select ON public.academic_accounts FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_accounts_update ON public.academic_accounts FOR UPDATE TO academic_app USING (true) WITH CHECK (true);

-- Sessions
CREATE POLICY p_app_sessions_all ON public.academic_sessions FOR ALL TO academic_app USING (true) WITH CHECK (true);

-- Profiles
CREATE POLICY p_app_profiles_select ON public.academic_profiles FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_profiles_insert ON public.academic_profiles FOR INSERT TO academic_app WITH CHECK (true);
CREATE POLICY p_app_profiles_update ON public.academic_profiles FOR UPDATE TO academic_app USING (true) WITH CHECK (true);

-- Courses & Contents
CREATE POLICY p_app_courses_select ON public.academic_courses FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_contents_select ON public.academic_course_contents FOR SELECT TO academic_app USING (true);

-- Student Codes
CREATE POLICY p_app_student_codes_select ON public.academic_student_codes FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_student_codes_insert ON public.academic_student_codes FOR INSERT TO academic_app WITH CHECK (true);
CREATE POLICY p_app_student_codes_update ON public.academic_student_codes FOR UPDATE TO academic_app USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY p_app_notifications_select ON public.academic_notifications FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_notifications_insert ON public.academic_notifications FOR INSERT TO academic_app WITH CHECK (true);
CREATE POLICY p_app_notifications_update ON public.academic_notifications FOR UPDATE TO academic_app USING (true) WITH CHECK (true);
CREATE POLICY p_app_notifications_delete ON public.academic_notifications FOR DELETE TO academic_app USING (true);

-- Exams & Questions
CREATE POLICY p_app_exams_select ON public.academic_exams FOR SELECT TO academic_app USING (true);
CREATE POLICY p_grader_exams_select ON public.academic_exams FOR SELECT TO academic_grader USING (true);
CREATE POLICY p_app_questions_select ON public.academic_exam_questions FOR SELECT TO academic_app USING (true);
CREATE POLICY p_grader_questions_select ON public.academic_exam_questions FOR SELECT TO academic_grader USING (true);

-- Exam Sessions
CREATE POLICY p_app_sessions_select ON public.academic_exam_sessions FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_sessions_insert ON public.academic_exam_sessions FOR INSERT TO academic_app WITH CHECK (true);
CREATE POLICY p_app_sessions_update ON public.academic_exam_sessions FOR UPDATE TO academic_app USING (true) WITH CHECK (true);

CREATE POLICY p_grader_sessions_select ON public.academic_exam_sessions FOR SELECT TO academic_grader USING (true);
CREATE POLICY p_grader_sessions_update ON public.academic_exam_sessions FOR UPDATE TO academic_grader USING (true) WITH CHECK (true);

-- Exam Submissions
CREATE POLICY p_app_submissions_select ON public.academic_exam_submissions FOR SELECT TO academic_app USING (true);
CREATE POLICY p_grader_submissions_select ON public.academic_exam_submissions FOR SELECT TO academic_grader USING (true);
CREATE POLICY p_grader_submissions_insert ON public.academic_exam_submissions FOR INSERT TO academic_grader WITH CHECK (true);

-- Support Tickets
CREATE POLICY p_app_tickets_select ON public.academic_support_tickets FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_tickets_insert ON public.academic_support_tickets FOR INSERT TO academic_app WITH CHECK (true);

-- Private Schema RLS Policies
CREATE POLICY p_app_rate_limits_all ON academic_private.rate_limits FOR ALL TO academic_app USING (true) WITH CHECK (true);

CREATE POLICY p_app_audit_log_select ON academic_private.audit_log FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_audit_log_insert ON academic_private.audit_log FOR INSERT TO academic_app WITH CHECK (true);
CREATE POLICY p_grader_audit_log_select ON academic_private.audit_log FOR SELECT TO academic_grader USING (true);
CREATE POLICY p_grader_audit_log_insert ON academic_private.audit_log FOR INSERT TO academic_grader WITH CHECK (true);

CREATE POLICY p_app_redeem_attempts_select ON academic_private.redeem_attempts FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_redeem_attempts_insert ON academic_private.redeem_attempts FOR INSERT TO academic_app WITH CHECK (true);

CREATE POLICY p_app_redeemable_codes_select ON academic_private.redeemable_codes FOR SELECT TO academic_app USING (true);
CREATE POLICY p_app_redeemable_codes_update ON academic_private.redeemable_codes FOR UPDATE TO academic_app USING (true) WITH CHECK (true);

CREATE POLICY p_grader_exam_keys_select ON academic_private.exam_keys FOR SELECT TO academic_grader USING (true);

-- Demote existing roles to guarantee rolbypassrls = false on existing databases
ALTER ROLE academic_app NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
ALTER ROLE academic_grader NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

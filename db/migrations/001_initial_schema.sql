-- Migration: 001_initial_schema.sql
-- Description: Sets up the full PostgreSQL database schema for academic portal (v2.1 architecture)

-- 1. Private schema for sensitive data
CREATE SCHEMA IF NOT EXISTS academic_private;

-- 2. Accounts (Authentication & Lockout)
CREATE TABLE IF NOT EXISTS public.academic_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(14) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  password_changed_at TIMESTAMPTZ NULL,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_accounts_national_id ON public.academic_accounts(national_id);

-- 3. Sessions (Opaque 256-bit Token Hash)
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  token_hash BYTEA UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  idle_expires_at TIMESTAMPTZ NOT NULL,
  absolute_expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  ip INET NULL,
  user_agent TEXT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON public.academic_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_account_id ON public.academic_sessions(account_id);

-- 4. Student Profiles
CREATE TABLE IF NOT EXISTS public.academic_profiles (
  id UUID PRIMARY KEY REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  student_code VARCHAR(30) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL DEFAULT 'المستوى الثاني',
  current_gpa NUMERIC(3, 2) NOT NULL DEFAULT 3.65,
  max_gpa NUMERIC(3, 2) NOT NULL DEFAULT 4.00,
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Courses
CREATE TABLE IF NOT EXISTS public.academic_courses (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  title VARCHAR(150) NOT NULL,
  english_title VARCHAR(150) NULL,
  description TEXT NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  doctor_title VARCHAR(150) NULL,
  doctor_avatar TEXT NULL,
  credit_hours INT NOT NULL DEFAULT 3,
  level INT NOT NULL DEFAULT 1,
  department VARCHAR(100) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'BookOpen',
  thumbnail_color VARCHAR(100) NOT NULL DEFAULT 'from-blue-600 to-indigo-700',
  color VARCHAR(50) NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Course Contents (Cloudflare R2 storage_key OR external_url)
CREATE TABLE IF NOT EXISTS public.academic_course_contents (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL REFERENCES public.academic_courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('file', 'video', 'image', 'link')),
  format VARCHAR(20) NOT NULL DEFAULT 'PDF',
  size_label VARCHAR(30) NOT NULL DEFAULT '',
  duration VARCHAR(30) NULL,
  date_label VARCHAR(50) NOT NULL DEFAULT '',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  storage_key TEXT NULL,
  external_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_content_source CHECK (
    (storage_key IS NOT NULL AND external_url IS NULL) OR
    (storage_key IS NULL AND external_url IS NOT NULL) OR
    (storage_key IS NULL AND external_url IS NULL)
  ),
  CONSTRAINT check_external_url_https CHECK (
    external_url IS NULL OR external_url ~* '^https://'
  )
);
CREATE INDEX IF NOT EXISTS idx_contents_course_id ON public.academic_course_contents(course_id);

-- 7. Redeemable Codes (Private Schema with HMAC Hash)
CREATE TABLE IF NOT EXISTS academic_private.redeemable_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash BYTEA UNIQUE NOT NULL,
  masked_code VARCHAR(30) NOT NULL,
  course_id VARCHAR(50) NOT NULL REFERENCES public.academic_courses(id),
  receipt_number VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_by UUID NULL REFERENCES public.academic_accounts(id),
  redeemed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_redeemable_code_hash ON academic_private.redeemable_codes(code_hash);

-- 8. Student Enrolled Codes
CREATE TABLE IF NOT EXISTS public.academic_student_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  course_id VARCHAR(50) NOT NULL REFERENCES public.academic_courses(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  receipt_number VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_student_codes_student_id ON public.academic_student_codes(student_id);

-- 9. Notifications
CREATE TABLE IF NOT EXISTS public.academic_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('exam', 'course', 'system', 'announcement', 'security')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url VARCHAR(255) NULL CHECK (action_url IS NULL OR action_url ~ '^/[^/\\]'),
  action_label VARCHAR(50) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_student_created ON public.academic_notifications(student_id, created_at DESC);

-- 10. Exams
CREATE TABLE IF NOT EXISTS public.academic_exams (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL REFERENCES public.academic_courses(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  total_marks INT NOT NULL CHECK (total_marks > 0),
  passing_marks INT NOT NULL CHECK (passing_marks > 0 AND passing_marks <= total_marks),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_exam_dates CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.academic_exams(course_id);

-- 11. Exam Questions (Public with sanitized options)
CREATE TABLE IF NOT EXISTS public.academic_exam_questions (
  id VARCHAR(50) PRIMARY KEY,
  exam_id VARCHAR(50) NOT NULL REFERENCES public.academic_exams(id) ON DELETE CASCADE,
  number INT NOT NULL,
  question_text TEXT NOT NULL,
  code_snippet TEXT NULL,
  options JSONB NOT NULL,
  points INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, number)
);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.academic_exam_questions(exam_id);

-- 12. Exam Answer Keys (Private Schema - Strict Isolation)
CREATE TABLE IF NOT EXISTS academic_private.exam_keys (
  question_id VARCHAR(50) PRIMARY KEY REFERENCES public.academic_exam_questions(id) ON DELETE CASCADE,
  correct_option_id VARCHAR(10) NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Exam Sessions
CREATE TABLE IF NOT EXISTS public.academic_exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  exam_id VARCHAR(50) NOT NULL REFERENCES public.academic_exams(id) ON DELETE CASCADE,
  end_at TIMESTAMPTZ NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, exam_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_exam ON public.academic_exam_sessions(student_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_pending_finalize ON public.academic_exam_sessions(end_at) WHERE submitted = false;

-- 14. Exam Submissions (Final Results - Strictly Single Attempt)
CREATE TABLE IF NOT EXISTS public.academic_exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  exam_id VARCHAR(50) NOT NULL REFERENCES public.academic_exams(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL,
  total_marks INT NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN NOT NULL,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  unanswered_count INT NOT NULL DEFAULT 0,
  auto_submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, exam_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_student ON public.academic_exam_submissions(student_id, exam_id);

-- 15. Support Tickets
CREATE SEQUENCE IF NOT EXISTS public.academic_ticket_no_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS public.academic_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no VARCHAR(20) NOT NULL UNIQUE DEFAULT ('TK-' || lpad(nextval('public.academic_ticket_no_seq')::text, 6, '0')),
  student_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'academic', 'codes', 'inquiry', 'complaint')),
  subject VARCHAR(150) NOT NULL,
  message VARCHAR(2000) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_student ON public.academic_support_tickets(student_id, created_at DESC);

-- 16. Rate Limits (Private Schema)
CREATE TABLE IF NOT EXISTS academic_private.rate_limits (
  key VARCHAR(64) NOT NULL,
  bucket VARCHAR(20) NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (key, bucket)
);

-- 17. Audit Log (Private Schema)
CREATE TABLE IF NOT EXISTS academic_private.audit_log (
  id BIGSERIAL PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor UUID NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 18. Redeem Attempts Tracker (Private Schema)
CREATE TABLE IF NOT EXISTS academic_private.redeem_attempts (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.academic_accounts(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_redeem_attempts_student ON academic_private.redeem_attempts(student_id, attempted_at DESC);

-- 19. Security Hardening & Permissions
-- Revoke all access to private schema from PUBLIC, anon, and authenticated
REVOKE ALL ON SCHEMA academic_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA academic_private FROM PUBLIC, anon, authenticated;

-- Enable RLS (Deny by default) on all academic tables in public and private
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'academic_%') LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON public.' || quote_ident(r.tablename) || ' FROM anon, authenticated, PUBLIC';
  END LOOP;
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'academic_private') LOOP
    EXECUTE 'ALTER TABLE academic_private.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON academic_private.' || quote_ident(r.tablename) || ' FROM anon, authenticated, PUBLIC';
  END LOOP;
END $$;

-- 20. Grants for academic_app (Application Service Layer)
GRANT USAGE ON SCHEMA public TO academic_app;
GRANT ALL ON ALL TABLES IN SCHEMA public TO academic_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO academic_app;

GRANT USAGE ON SCHEMA academic_private TO academic_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON academic_private.rate_limits TO academic_app;
GRANT SELECT, INSERT ON academic_private.audit_log TO academic_app;
GRANT SELECT, INSERT ON academic_private.redeem_attempts TO academic_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA academic_private TO academic_app;
GRANT SELECT, UPDATE ON academic_private.redeemable_codes TO academic_app;

-- STRICT: academic_app MUST NOT access exam_keys!
REVOKE ALL ON academic_private.exam_keys FROM academic_app;

-- 21. Grants for academic_grader (Exam Grading Service Layer)
GRANT USAGE ON SCHEMA public TO academic_grader;
GRANT USAGE ON SCHEMA academic_private TO academic_grader;
GRANT SELECT ON public.academic_exams TO academic_grader;
GRANT SELECT ON public.academic_exam_questions TO academic_grader;
GRANT SELECT, UPDATE ON public.academic_exam_sessions TO academic_grader;
GRANT INSERT, SELECT ON public.academic_exam_submissions TO academic_grader;
GRANT SELECT ON academic_private.exam_keys TO academic_grader;

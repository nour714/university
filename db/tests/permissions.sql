-- db/tests/permissions.sql
-- Rigorous SQL test matrix verifying least-privilege role boundaries and RLS

-- Setup test fixtures as owner
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOBYPASSRLS;
  END IF;
END $$;

-- Clean existing test records if any
DELETE FROM public.academic_exam_submissions WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_exam_sessions WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_student_codes WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_notifications WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_profiles WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_accounts WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM academic_private.exam_keys WHERE question_id = 'test-q-01';
DELETE FROM public.academic_exam_questions WHERE id = 'test-q-01';
DELETE FROM public.academic_exams WHERE id = 'test-exam-01';
DELETE FROM public.academic_courses WHERE id = 'test-course-01';

-- Create fixtures
INSERT INTO public.academic_courses (id, code, title, doctor_name, department, description, semester)
VALUES ('test-course-01', 'TC101', 'Test Course', 'Dr. Test', 'الذكاء الاصطناعي', 'Course for permission tests', 'الفصل الأول');

INSERT INTO public.academic_exams (id, course_id, title, duration_minutes, total_marks, passing_marks, start_date, end_date)
VALUES ('test-exam-01', 'test-course-01', 'Test Exam', 30, 10, 5, now() - interval '1 hour', now() + interval '1 hour');

INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
VALUES ('test-q-01', 'test-exam-01', 1, 'Question 1?', '[{"id":"opt_a","text":"A"},{"id":"opt_b","text":"B"}]'::jsonb, 5);

INSERT INTO academic_private.exam_keys (question_id, correct_option_id, explanation)
VALUES ('test-q-01', 'opt_a', 'Option A is correct');

INSERT INTO public.academic_accounts (id, national_id, password_hash, must_change_password)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, '10000000000001', 'argon2_hash', false);

INSERT INTO public.academic_profiles (id, full_name, email, student_code, department)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Test Student', 'test@edu.eg', 'STD001', 'الذكاء الاصطناعي');

COMMIT;

-- ============================================================================
-- TEST 1: academic_app role
-- ============================================================================

-- 1.1 academic_app can read courses and accounts
SET ROLE academic_app;
SELECT id, code, title FROM public.academic_courses WHERE id = 'test-course-01';
SELECT id, national_id FROM public.academic_accounts WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 1.2 academic_app can insert notifications, student codes, and exam sessions
INSERT INTO public.academic_notifications (student_id, title, message, type)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Welcome', 'Test notification', 'system');

INSERT INTO public.academic_student_codes (student_id, course_id, code, receipt_number, semester)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'test-course-01', 'CODE123', 'REC001', 'الفصل الأول');

INSERT INTO public.academic_exam_sessions (student_id, exam_id, end_at, answers)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'test-exam-01', now() + interval '30 minutes', '{"test-q-01":"opt_a"}'::jsonb);

-- 1.3 academic_app can update answers on sessions
UPDATE public.academic_exam_sessions 
   SET answers = '{"test-q-01":"opt_b"}'::jsonb 
 WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid AND exam_id = 'test-exam-01';

-- 1.4 academic_app CANNOT read exam_keys (Must fail)
DO $$
BEGIN
  BEGIN
    PERFORM * FROM academic_private.exam_keys;
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to read academic_private.exam_keys';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.5 academic_app CANNOT update end_at on exam sessions (Must fail)
DO $$
BEGIN
  BEGIN
    UPDATE public.academic_exam_sessions 
       SET end_at = now() + interval '2 hours' 
     WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to update end_at';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.6 academic_app CANNOT update submitted on exam sessions (Must fail)
DO $$
BEGIN
  BEGIN
    UPDATE public.academic_exam_sessions 
       SET submitted = true 
     WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to update submitted';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.7 academic_app CANNOT insert into academic_exam_submissions (Must fail)
DO $$
BEGIN
  BEGIN
    INSERT INTO public.academic_exam_submissions (student_id, exam_id, score, total_marks, percentage, passed)
    VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'test-exam-01', 10, 10, 100, true);
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to insert into academic_exam_submissions';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.8 academic_app CANNOT truncate tables (Must fail)
DO $$
BEGIN
  BEGIN
    TRUNCATE TABLE public.academic_courses;
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to truncate academic_courses';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.9 academic_app CANNOT delete from audit_log (Must fail)
DO $$
BEGIN
  BEGIN
    DELETE FROM academic_private.audit_log;
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to delete from academic_private.audit_log';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.10 academic_app CANNOT update national_id (Must fail)
DO $$
BEGIN
  BEGIN
    UPDATE public.academic_accounts 
       SET national_id = '99999999999999' 
     WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to update national_id';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.11 academic_app CANNOT select from audit_log (Must fail - least privilege fixup)
DO $$
BEGIN
  BEGIN
    PERFORM * FROM academic_private.audit_log;
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to select from academic_private.audit_log';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.12 academic_app CANNOT update academic_exam_submissions (Must fail)
DO $$
BEGIN
  BEGIN
    UPDATE public.academic_exam_submissions SET score = 100 WHERE exam_id = 'test-exam-01';
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to update academic_exam_submissions';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 1.13 academic_app CANNOT delete from academic_exam_submissions (Must fail)
DO $$
BEGIN
  BEGIN
    DELETE FROM public.academic_exam_submissions WHERE exam_id = 'test-exam-01';
    RAISE EXCEPTION 'TEST FAILED: academic_app was able to delete from academic_exam_submissions';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

RESET ROLE;

-- ============================================================================
-- TEST 2: academic_grader role
-- ============================================================================

SET ROLE academic_grader;

-- 2.1 academic_grader can read keys, questions, sessions, exams
SELECT correct_option_id FROM academic_private.exam_keys WHERE question_id = 'test-q-01';
SELECT id, question_text FROM public.academic_exam_questions WHERE id = 'test-q-01';
SELECT id, end_at FROM public.academic_exam_sessions WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
SELECT id, total_marks FROM public.academic_exams WHERE id = 'test-exam-01';

-- 2.2 academic_grader full submit transaction succeeds
BEGIN;
SELECT id FROM public.academic_exam_sessions 
 WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid AND exam_id = 'test-exam-01'
   FOR UPDATE;

INSERT INTO public.academic_exam_submissions (
  student_id, exam_id, score, total_marks, percentage, passed, correct_count, wrong_count, unanswered_count, answers, per_question
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, 'test-exam-01', 5, 10, 50, true, 1, 0, 0,
  '{"test-q-01":"opt_a"}'::jsonb, '{"test-q-01":true}'::jsonb
);

UPDATE public.academic_exam_sessions 
   SET submitted = true 
 WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid AND exam_id = 'test-exam-01';

INSERT INTO academic_private.audit_log (actor, action, details)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'TEST_SUBMIT', '{"score":5}'::jsonb);
COMMIT;

-- 2.3 academic_grader CANNOT read accounts (Must fail)
DO $$
BEGIN
  BEGIN
    PERFORM * FROM public.academic_accounts;
    RAISE EXCEPTION 'TEST FAILED: academic_grader was able to read academic_accounts';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 2.4 academic_grader CANNOT update end_at (Must fail)
DO $$
BEGIN
  BEGIN
    UPDATE public.academic_exam_sessions 
       SET end_at = now() + interval '1 day' 
     WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
    RAISE EXCEPTION 'TEST FAILED: academic_grader was able to update end_at';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 2.5 academic_grader CANNOT delete submissions (Must fail)
DO $$
BEGIN
  BEGIN
    DELETE FROM public.academic_exam_submissions;
    RAISE EXCEPTION 'TEST FAILED: academic_grader was able to delete submissions';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 2.6 academic_grader CANNOT insert into exam_keys (Must fail)
DO $$
BEGIN
  BEGIN
    INSERT INTO academic_private.exam_keys (question_id, correct_option_id, explanation)
    VALUES ('test-q-01', 'opt_b', 'malicious change');
    RAISE EXCEPTION 'TEST FAILED: academic_grader was able to insert into exam_keys';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 2.7 academic_grader CANNOT update exam_keys (Must fail)
DO $$
BEGIN
  BEGIN
    UPDATE academic_private.exam_keys SET correct_option_id = 'opt_b' WHERE question_id = 'test-q-01';
    RAISE EXCEPTION 'TEST FAILED: academic_grader was able to update exam_keys';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

-- 2.8 academic_grader CANNOT delete from exam_keys (Must fail)
DO $$
BEGIN
  BEGIN
    DELETE FROM academic_private.exam_keys WHERE question_id = 'test-q-01';
    RAISE EXCEPTION 'TEST FAILED: academic_grader was able to delete from exam_keys';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

RESET ROLE;

-- ============================================================================
-- TEST 4: Verification of role attributes (NOBYPASSRLS)
-- ============================================================================
DO $$
DECLARE
  v_app_bypass boolean;
  v_grader_bypass boolean;
BEGIN
  SELECT rolbypassrls INTO v_app_bypass FROM pg_roles WHERE rolname = 'academic_app';
  IF v_app_bypass THEN
    RAISE EXCEPTION 'TEST FAILED: academic_app has rolbypassrls = true';
  END IF;

  SELECT rolbypassrls INTO v_grader_bypass FROM pg_roles WHERE rolname = 'academic_grader';
  IF v_grader_bypass THEN
    RAISE EXCEPTION 'TEST FAILED: academic_grader has rolbypassrls = true';
  END IF;
END $$;

-- ============================================================================
-- TEST 3: anon / authenticated roles
-- ============================================================================

SET ROLE anon;
-- anon must see nothing in academic_courses, accounts, private schema
DO $$
DECLARE
  v_cnt int;
BEGIN
  BEGIN
    SELECT count(*) INTO v_cnt FROM public.academic_courses;
    IF v_cnt > 0 THEN
      RAISE EXCEPTION 'TEST FAILED: anon was able to read % courses', v_cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;

  BEGIN
    PERFORM * FROM academic_private.exam_keys;
    RAISE EXCEPTION 'TEST FAILED: anon was able to read exam_keys';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

SET ROLE authenticated;
-- authenticated must see nothing in academic_courses, accounts, private schema
DO $$
DECLARE
  v_cnt int;
BEGIN
  BEGIN
    SELECT count(*) INTO v_cnt FROM public.academic_courses;
    IF v_cnt > 0 THEN
      RAISE EXCEPTION 'TEST FAILED: authenticated was able to read % courses', v_cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;

  BEGIN
    PERFORM * FROM academic_private.exam_keys;
    RAISE EXCEPTION 'TEST FAILED: authenticated was able to read exam_keys';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected PASS
  END;
END $$;

RESET ROLE;

-- Cleanup test fixtures
DELETE FROM public.academic_exam_submissions WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_exam_sessions WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_student_codes WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_notifications WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_profiles WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.academic_accounts WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM academic_private.exam_keys WHERE question_id = 'test-q-01';
DELETE FROM public.academic_exam_questions WHERE id = 'test-q-01';
DELETE FROM public.academic_exams WHERE id = 'test-exam-01';
DELETE FROM public.academic_courses WHERE id = 'test-course-01';

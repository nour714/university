-- Migration: 004_jsonb_type_constraints.sql
-- Description: Enforce JSONB object constraints on sessions, submissions, and audit_log using NOT VALID + VALIDATE CONSTRAINT

DO $$
BEGIN
  -- 1. academic_exam_sessions.answers must be a JSON object
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_exam_sessions_answers_object'
  ) THEN
    ALTER TABLE public.academic_exam_sessions
      ADD CONSTRAINT check_exam_sessions_answers_object 
      CHECK (jsonb_typeof(answers) = 'object') NOT VALID;
  END IF;

  -- 2. academic_exam_submissions.answers must be a JSON object
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_exam_submissions_answers_object'
  ) THEN
    ALTER TABLE public.academic_exam_submissions
      ADD CONSTRAINT check_exam_submissions_answers_object 
      CHECK (jsonb_typeof(answers) = 'object') NOT VALID;
  END IF;

  -- 3. academic_exam_submissions.per_question must be a JSON object
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_exam_submissions_per_question_object'
  ) THEN
    ALTER TABLE public.academic_exam_submissions
      ADD CONSTRAINT check_exam_submissions_per_question_object 
      CHECK (jsonb_typeof(per_question) = 'object') NOT VALID;
  END IF;

  -- 4. academic_private.audit_log.details must be null or a JSON object
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_audit_log_details_object'
  ) THEN
    ALTER TABLE academic_private.audit_log
      ADD CONSTRAINT check_audit_log_details_object 
      CHECK (details IS NULL OR jsonb_typeof(details) = 'object') NOT VALID;
  END IF;
END $$;

-- Validate all constraints after unwrap to guarantee safety on existing production databases
ALTER TABLE public.academic_exam_sessions 
  VALIDATE CONSTRAINT check_exam_sessions_answers_object;

ALTER TABLE public.academic_exam_submissions 
  VALIDATE CONSTRAINT check_exam_submissions_answers_object;

ALTER TABLE public.academic_exam_submissions 
  VALIDATE CONSTRAINT check_exam_submissions_per_question_object;

ALTER TABLE academic_private.audit_log 
  VALIDATE CONSTRAINT check_audit_log_details_object;

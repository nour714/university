-- Migration: 002a_fix_double_encoded_jsonb.sql
-- Description: Data-fix migration to unwrap double-encoded JSONB string scalars into genuine JSONB objects and arrays
-- Runs before 003_hardening so that the CHECK (jsonb_typeof(options)='array') constraint succeeds on existing data.

DO $$
BEGIN
  -- 1. Unwrap double-encoded options in academic_exam_questions (convert string scalar to array)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'academic_exam_questions' AND column_name = 'options'
  ) THEN
    UPDATE public.academic_exam_questions
       SET options = (options #>> '{}')::jsonb
     WHERE jsonb_typeof(options) = 'string';
  END IF;

  -- 2. Unwrap double-encoded answers in academic_exam_sessions (convert string scalar to object)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'academic_exam_sessions' AND column_name = 'answers'
  ) THEN
    UPDATE public.academic_exam_sessions
       SET answers = (answers #>> '{}')::jsonb
     WHERE jsonb_typeof(answers) = 'string';
  END IF;

  -- 3. Unwrap double-encoded details in academic_private.audit_log (convert string scalar to object)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'academic_private' AND table_name = 'audit_log' AND column_name = 'details'
  ) THEN
    UPDATE academic_private.audit_log
       SET details = (details #>> '{}')::jsonb
     WHERE details IS NOT NULL AND jsonb_typeof(details) = 'string';
  END IF;

  -- 4. Unwrap double-encoded answers and per_question in academic_exam_submissions if columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'academic_exam_submissions' AND column_name = 'answers'
  ) THEN
    UPDATE public.academic_exam_submissions
       SET answers = (answers #>> '{}')::jsonb
     WHERE jsonb_typeof(answers) = 'string';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'academic_exam_submissions' AND column_name = 'per_question'
  ) THEN
    UPDATE public.academic_exam_submissions
       SET per_question = (per_question #>> '{}')::jsonb
     WHERE jsonb_typeof(per_question) = 'string';
  END IF;
END $$;

-- Migration: 003_hardening.sql
-- Description: Schema hardening, exam submission answer persistence, profile columns, finalize attempts, and consistency triggers

-- 1. Submissions: persist raw answers and per-question score breakdown
ALTER TABLE public.academic_exam_submissions
  ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS per_question JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Exams: dynamic type, description, instructions
ALTER TABLE public.academic_exams
  ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'midterm' CHECK (type IN ('midterm', 'quiz', 'final', 'practical')),
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instructions TEXT[] NOT NULL DEFAULT ARRAY[
    'الأسئلة والخيارات باللغة الإنجليزية.',
    'يتم حفظ الإجابات تلقائياً على خوادم الكلية.',
    'تسليم الامتحان آلي بمجرد انتهاء الوقت المخصص.'
  ];

-- 3. Profiles: eliminate hard-coded student metadata
ALTER TABLE public.academic_profiles
  ADD COLUMN IF NOT EXISTS faculty VARCHAR(100) NOT NULL DEFAULT 'كلية الذكاء الاصطناعي',
  ADD COLUMN IF NOT EXISTS level_number INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS registered_hours INT NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  ADD COLUMN IF NOT EXISTS semester VARCHAR(50) NOT NULL DEFAULT 'الفصل الدراسي الأول';

-- 4. Notifications: priority column
ALTER TABLE public.academic_notifications
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent'));

-- 5. Exam Sessions: finalize attempts tracking
ALTER TABLE public.academic_exam_sessions
  ADD COLUMN IF NOT EXISTS finalize_attempts INT NOT NULL DEFAULT 0;

GRANT UPDATE (finalize_attempts) ON public.academic_exam_sessions TO academic_grader;

-- 6. Question Options validation: JSONB array format
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_questions_options_array'
  ) THEN
    ALTER TABLE public.academic_exam_questions
      ADD CONSTRAINT check_questions_options_array CHECK (jsonb_typeof(options) = 'array');
  END IF;
END $$;

-- 7. Trigger on academic_private.exam_keys: correct_option_id must exist in options
CREATE OR REPLACE FUNCTION academic_private.check_exam_key_option_exists()
RETURNS TRIGGER AS $$
DECLARE
  v_options jsonb;
  v_found boolean;
BEGIN
  SELECT options INTO v_options
  FROM public.academic_exam_questions
  WHERE id = NEW.question_id;

  IF v_options IS NULL THEN
    RAISE EXCEPTION 'Question % does not exist in academic_exam_questions', NEW.question_id;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_options) AS opt
    WHERE opt->>'id' = NEW.correct_option_id
  ) INTO v_found;

  IF NOT v_found THEN
    RAISE EXCEPTION 'Option % does not exist in question % options', NEW.correct_option_id, NEW.question_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_exam_key_option ON academic_private.exam_keys;
CREATE TRIGGER trg_check_exam_key_option
  BEFORE INSERT OR UPDATE ON academic_private.exam_keys
  FOR EACH ROW
  EXECUTE FUNCTION academic_private.check_exam_key_option_exists();

-- 8. Execution and Idle Timeouts for Least-Privilege Roles
ALTER ROLE academic_app SET statement_timeout = '10s';
ALTER ROLE academic_app SET idle_in_transaction_session_timeout = '15s';

ALTER ROLE academic_grader SET statement_timeout = '10s';
ALTER ROLE academic_grader SET idle_in_transaction_session_timeout = '15s';

-- 9. Index for Finalizer (end_at WHERE submitted = false)
CREATE INDEX IF NOT EXISTS idx_exam_sessions_unsubmitted_end_at 
  ON public.academic_exam_sessions(end_at) 
  WHERE submitted = false;

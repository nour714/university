-- Migration: 008_fix_course_levels.sql
-- Description: Correct academic course levels for specialized courses that defaulted to level 1

UPDATE public.academic_courses SET level = 3 WHERE id IN ('ai-303', 'ai-305');
UPDATE public.academic_courses SET level = 4 WHERE id IN ('ai-402', 'ai-403');
UPDATE public.academic_courses SET level = 2 WHERE id IN ('cs-204');

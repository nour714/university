-- Migration: 006_nullable_gpa.sql
-- Description: Allow NULL values for current_gpa in public.academic_profiles to support accounts without grades recorded yet.

ALTER TABLE public.academic_profiles ALTER COLUMN current_gpa DROP NOT NULL;
ALTER TABLE public.academic_profiles ALTER COLUMN current_gpa SET DEFAULT NULL;

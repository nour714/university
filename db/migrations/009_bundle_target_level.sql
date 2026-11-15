-- Migration: 009_bundle_target_level.sql
-- Description: Add target_level column to redeemable_codes to support Level 1 & Level 3 bundle codes

ALTER TABLE academic_private.redeemable_codes
  ADD COLUMN IF NOT EXISTS target_level INT NULL DEFAULT 3;

-- Set existing bundle codes to level 3
UPDATE academic_private.redeemable_codes
  SET target_level = 3
  WHERE is_bundle = true AND target_level IS NULL;

-- Populate target_level for course-specific codes based on course level
UPDATE academic_private.redeemable_codes rc
  SET target_level = c.level
  FROM public.academic_courses c
  WHERE rc.course_id = c.id AND rc.target_level IS NULL;

CREATE INDEX IF NOT EXISTS idx_redeemable_target_level
  ON academic_private.redeemable_codes(target_level);

-- Migration 007: Allow bundle redeemable codes that unlock all courses for a level/semester

ALTER TABLE academic_private.redeemable_codes 
  ALTER COLUMN course_id DROP NOT NULL;

ALTER TABLE academic_private.redeemable_codes 
  ADD COLUMN IF NOT EXISTS is_bundle BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_redeemable_is_bundle 
  ON academic_private.redeemable_codes(is_bundle);

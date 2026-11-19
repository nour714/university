-- Migration: 010_support_ticket_public.sql
-- Description: Allow public support tickets submitted without prior authentication

ALTER TABLE public.academic_support_tickets
  ALTER COLUMN student_id DROP NOT NULL;

-- Migration: 000_roles.sql
-- Description: Ensures roles exist for strict least-privilege isolation and fresh DB compatibility

DO $$
BEGIN
  -- Dummy roles for anon/authenticated if not on Supabase
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOBYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOBYPASSRLS;
  END IF;

  -- Application roles without passwords (passwords set via env/secret rotation)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'academic_app') THEN
    CREATE ROLE academic_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'academic_grader') THEN
    CREATE ROLE academic_grader WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;

-- Adds triage_flags JSONB to the wills table.
-- Stores boolean indicators for complex-situation flags raised during the questionnaire.
-- Run in Supabase Dashboard > SQL Editor.

alter table public.wills
  add column if not exists triage_flags jsonb;

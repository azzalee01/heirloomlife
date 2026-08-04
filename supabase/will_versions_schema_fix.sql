-- Run this in the Supabase Dashboard > SQL Editor
--
-- The `will_versions` table already existed (with a different, unused
-- amendment-approval schema: version_number, amendment_summary, status,
-- approved_by, etc.) before live_will_and_versions.sql was written, so that
-- migration's "create table if not exists" silently did nothing. Every call
-- to recordVersion() has been failing ever since — inserting into columns
-- (changed_section, change_summary, needs_review, needs_review_reasons)
-- that don't exist — which is why "Version History" on The Will page has
-- always shown "No changes recorded yet" regardless of how many saves ran.
--
-- The app only ever reads/writes the columns below, never the pre-existing
-- amendment-workflow ones, so we add what's missing rather than touch those.

alter table public.will_versions add column if not exists changed_section text;
alter table public.will_versions add column if not exists change_summary text;
alter table public.will_versions add column if not exists needs_review boolean not null default false;
alter table public.will_versions add column if not exists needs_review_reasons jsonb;

-- The old amendment-workflow columns (version_number, status) are NOT NULL
-- with no default, but the app never sets them — every insert has been
-- failing on these constraints too, even after adding the columns above.
alter table public.will_versions alter column version_number drop not null;
alter table public.will_versions alter column status drop not null;

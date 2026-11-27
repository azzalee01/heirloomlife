-- Remove the children_fill_last_name stopgap (see 20261127031204).
--
-- The Children step now collects separate First name and Last name fields, and
-- the save action writes both columns, so the fallback trigger is no longer
-- needed — and its last-space split is sometimes wrong (e.g. "Mary Anne Van der
-- Berg"). Removing it restores plain, correct inserts.
--
-- DO NOT APPLY until the application code (separate first/last name fields) is
-- deployed to production. Applying this before the deploy would reintroduce the
-- NOT NULL failure for any client still sending a combined name.
drop trigger if exists children_fill_last_name on public.children;
drop function if exists public.children_fill_last_name();

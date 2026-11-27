-- Stopgap applied directly to the Sydney project (copbetdvhkreyzvywmmr) on
-- 2026-11-27 as migration version 20261127031204. Added to the repo so the
-- migration history matches what is live on Sydney.
--
-- Context: the children table has first_name/last_name NOT NULL, but the save
-- action only ever set first_name (the Children step collected a single "Full
-- name"), causing `null value in column "last_name" ... violates not-null`.
-- This trigger fills last_name from a combined first_name by splitting on the
-- LAST space. Fallback only — it gets some names wrong. Superseded by the app
-- collecting separate first/last names, and dropped by a later migration.
create or replace function public.children_fill_last_name()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare n text := btrim(coalesce(new.first_name, ''));
begin
  if new.last_name is null or btrim(new.last_name) = '' then
    if position(' ' in n) > 0 then
      new.last_name := btrim(substring(n from '[^ ]+$'));
      new.first_name := btrim(regexp_replace(n, '\s+[^ ]+$', ''));
    else
      new.last_name := '';
    end if;
  end if;
  return new;
end $function$;

drop trigger if exists children_fill_last_name on public.children;
create trigger children_fill_last_name
  before insert or update on public.children
  for each row execute function public.children_fill_last_name();

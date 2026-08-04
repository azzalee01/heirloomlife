-- Run this in the Supabase Dashboard > SQL Editor
--
-- Adds the handful of document-level settings that had no existing column:
-- the survivorship period, pet care instructions, and life interest (right
-- to reside) provisions. Everything else this feature needs — funeral
-- wishes, substitute beneficiaries, testamentary trust vesting age, death
-- benefit nominations, overseas assets — already existed as unused columns
-- on testators/beneficiaries/specific_gifts/children/assets.

alter table public.wills add column if not exists survivorship_days integer not null default 30;
alter table public.wills add column if not exists pet_care jsonb;
alter table public.wills add column if not exists life_interest jsonb;

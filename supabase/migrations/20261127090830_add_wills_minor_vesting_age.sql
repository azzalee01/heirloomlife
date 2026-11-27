-- Persist the testamentary-trust vesting age (18/21/25) at the will level so it
-- survives even when there are no dependent children (children.distribution_age
-- only covers dependent children). Applied to Sydney as 20261127090830.
--
-- wills has a column-level UPDATE lockdown for `authenticated`, so this column
-- must be granted explicitly for the wizard save to write it.
alter table public.wills add column if not exists minor_vesting_age integer;

alter table public.wills drop constraint if exists wills_minor_vesting_age_check;
alter table public.wills add constraint wills_minor_vesting_age_check
  check (minor_vesting_age is null or (minor_vesting_age >= 18 and minor_vesting_age <= 30));

grant update (minor_vesting_age) on public.wills to authenticated;

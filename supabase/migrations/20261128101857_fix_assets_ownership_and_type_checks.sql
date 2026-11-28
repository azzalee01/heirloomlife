-- Two save-blocking CHECK gaps: the wizard offers ownership_type 'entity'
-- (PR #5) and asset_type 'digital_asset' (Cryptocurrency), but neither was
-- allowed by the constraints, so saving the Assets step threw a constraint
-- violation surfaced only as "We couldn't save your changes".
-- Widening a CHECK to add allowed values cannot invalidate existing rows.
-- Applied to Sydney (copbetdvhkreyzvywmmr) as 20261128101857.

alter table public.assets drop constraint assets_ownership_type_check;
alter table public.assets add constraint assets_ownership_type_check
  check (ownership_type in ('sole','joint_tenants','tenants_in_common','entity'));

alter table public.assets drop constraint assets_asset_type_check;
alter table public.assets add constraint assets_asset_type_check
  check (asset_type in ('real_estate','shares','superannuation','life_insurance','bank_account','vehicle','business','personal_property','other','digital_asset'));

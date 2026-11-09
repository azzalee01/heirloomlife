-- Tier 1 charity partnership channel (applied to prod 2026-11-08).
-- Builds on charity_partner_schema.sql.
--
-- No-fee model (confirmed): billing_model / fee_per_referral_cents / pilot_* are
-- legacy and ignored. We relax their NOT NULLs so a partner can be created with
-- just name + verified ABN + logo + referral_code + active.
--
-- Attribution: beneficiaries.charity_partner_id is the engine. It is set the
-- moment a partner is chosen in StepBeneficiaries, so reporting can read
-- beneficiaries ⋈ wills ⋈ charity_partners for Wills started / completed and
-- gifts left — including drafts. partner_referrals is still written on
-- completeWill as a clean completion event (see _actions.ts).

alter table public.charity_partners
  add column if not exists logo_url text;

alter table public.charity_partners alter column billing_model drop not null;
alter table public.charity_partners alter column fee_per_referral_cents drop not null;
alter table public.charity_partners alter column fee_per_referral_cents set default 0;
alter table public.charity_partners alter column contact_email drop not null;

alter table public.beneficiaries
  add column if not exists charity_partner_id uuid references public.charity_partners(id);

create index if not exists beneficiaries_charity_partner_id_idx
  on public.beneficiaries (charity_partner_id)
  where charity_partner_id is not null;

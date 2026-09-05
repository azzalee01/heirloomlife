-- Charity partner referral program schema.
-- Run in Supabase Dashboard > SQL Editor.
--
-- charity_partners: admin-managed registry of verified charity partners.
-- partner_referrals: one row per Will completed via a partner referral link.
-- wills.partner_referral_code: persists the ?ref= attribution through the intake flow.
--
-- Billing collection for v1 is manual (Option C: invoice/bank transfer).
-- ACNC verification is a manual admin step before marking active = true.
-- No partner portal for v1.

-- ─── Partner registry ────────────────────────────────────────────────────────
create table if not exists public.charity_partners (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  abn                   text not null,
  contact_email         text not null,
  referral_code         text not null unique,
  active                boolean not null default false,
  billing_model         text not null check (billing_model in ('per_referral', 'capped_pilot')),
  fee_per_referral_cents integer not null,
  pilot_cap             integer,
  pilot_fee_cents       integer,
  pilot_starts_at       timestamptz,
  pilot_ends_at         timestamptz,
  stripe_customer_id    text,
  notes                 text,
  created_at            timestamptz not null default now()
);

create index if not exists charity_partners_referral_code_idx
  on public.charity_partners (referral_code)
  where active = true;

-- Admin-only: no user-facing RLS policies (all access via service role key).
alter table public.charity_partners enable row level security;

-- ─── Referral events ─────────────────────────────────────────────────────────
create table if not exists public.partner_referrals (
  id           uuid primary key default gen_random_uuid(),
  partner_id   uuid not null references public.charity_partners(id),
  will_id      uuid not null references public.wills(id),
  user_id      uuid not null references public.profiles(id),
  completed_at timestamptz not null default now(),
  billed       boolean not null default false,
  billed_at    timestamptz
);

create index if not exists partner_referrals_partner_id_idx on public.partner_referrals(partner_id, completed_at desc);
create index if not exists partner_referrals_will_id_idx on public.partner_referrals(will_id);

alter table public.partner_referrals enable row level security;

-- ─── Attribution column on wills ─────────────────────────────────────────────
alter table public.wills
  add column if not exists partner_referral_code text;

create index if not exists wills_partner_referral_code_idx
  on public.wills (partner_referral_code)
  where partner_referral_code is not null;

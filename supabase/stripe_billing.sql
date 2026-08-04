-- Stripe billing columns on the profiles table.
-- Run in Supabase Dashboard > SQL Editor.
--
-- Before running, create two products in your Stripe test dashboard:
--   1. "Will Document"    — one-time price  → copy the price_... ID to STRIPE_PRICE_WILL
--   2. "Living Vault"     — recurring/year  → copy the price_... ID to STRIPE_PRICE_VAULT_ANNUAL

alter table public.profiles
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan                   text not null default 'free',
  add column if not exists plan_status            text;

-- Speeds up webhook lookups by Stripe customer ID
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

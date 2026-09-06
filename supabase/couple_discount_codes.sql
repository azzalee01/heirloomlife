-- Couple's discount codes — single-use, per-purchaser, expiring.
-- Generated automatically after a Will or Vault purchase.
-- Applied at the partner's Stripe checkout via promotion_code.

create table if not exists public.couple_discount_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  generator_id    uuid not null references public.profiles(id),
  stripe_promo_id text not null,
  product         text not null check (product in ('will', 'vault')),
  discount_cents  int  not null,
  expires_at      timestamptz not null,
  used_at         timestamptz,
  used_by_id      uuid references public.profiles(id),
  created_at      timestamptz not null default now()
);

create index if not exists couple_discount_codes_code_idx
  on public.couple_discount_codes (code)
  where used_at is null;

create index if not exists couple_discount_codes_generator_idx
  on public.couple_discount_codes (generator_id);

alter table public.couple_discount_codes enable row level security;

-- Owners can read their own generated codes (to display the link)
create policy "Owner can read own codes"
  on public.couple_discount_codes for select
  using (auth.uid() = generator_id);

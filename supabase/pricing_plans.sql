-- Pricing plans table — drives the /pricing page and can be updated without deploys.
-- Run in Supabase Dashboard > SQL Editor.

create table if not exists public.pricing_plans (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,          -- 'will' | 'vault' — must match Product type in stripe.ts
  name         text not null,
  tagline      text not null,
  price_amount integer not null,              -- AUD cents (display only — source of truth is Stripe)
  price_label  text not null,                 -- e.g. '$199' or '$299/year'
  billing_type text not null,                 -- 'one_time' | 'annual'
  description  text not null,
  features     text[] not null default '{}',
  highlight    boolean not null default false,
  sort_order   integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Public read — pricing is not sensitive
alter table public.pricing_plans enable row level security;

create policy "pricing_plans_public_read"
  on public.pricing_plans for select
  using (active = true);

-- Seed
insert into public.pricing_plans
  (slug, name, tagline, price_amount, price_label, billing_type, description, features, highlight, sort_order)
values
  (
    'will',
    'Will Document',
    'One-off purchase',
    19900,
    '$199',
    'one_time',
    'A legally valid will drafted by AI, reviewed by a qualified solicitor, and ready to sign.',
    ARRAY[
      'AI-guided will builder',
      'Solicitor review included',
      'Downloadable & printable PDF',
      'Valid in all Australian states',
      'Covers assets, beneficiaries & executors'
    ],
    false,
    1
  ),
  (
    'vault',
    'Living Vault',
    'Annual subscription',
    29900,
    '$299/year',
    'annual',
    'Everything in Will Document, plus a secure digital vault to keep your estate plan current as life changes.',
    ARRAY[
      'Everything in Will Document',
      'Secure document vault',
      'Unlimited will updates',
      'Remote witnessing sessions',
      'Priority solicitor support'
    ],
    true,
    2
  )
on conflict (slug) do nothing;

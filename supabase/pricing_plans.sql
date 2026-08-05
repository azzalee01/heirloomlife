-- Pricing plans table — drives the /pricing page and can be updated without deploys.
-- Run in Supabase Dashboard > SQL Editor.

create table if not exists public.pricing_plans (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  tagline         text not null,
  price_amount    integer,                        -- AUD cents; null = not yet confirmed
  price_label     text not null,                 -- e.g. '$490' or 'TBC'
  billing_type    text not null,                 -- 'one_time' | 'annual'
  description     text not null,
  features        text[] not null default '{}',
  highlight       boolean not null default false,
  sort_order      integer not null default 0,
  active          boolean not null default true,
  is_placeholder  boolean not null default false, -- true = pricing not yet confirmed; show badge
  created_at      timestamptz not null default now()
);

-- Add is_placeholder column if migrating an existing table
alter table public.pricing_plans
  add column if not exists is_placeholder boolean not null default false;

-- Public read — pricing is not sensitive
alter table public.pricing_plans enable row level security;

create policy if not exists "pricing_plans_public_read"
  on public.pricing_plans for select
  using (active = true);

-- Seed (upsert so re-running is safe)
insert into public.pricing_plans
  (slug, name, tagline, price_amount, price_label, billing_type, description, features, highlight, sort_order, is_placeholder)
values
  (
    'will-single',
    'The Will — Single',
    'One-off, solicitor reviewed',
    null,
    'TBC',
    'one_time',
    'A legally valid Will drafted with guidance, reviewed by a solicitor, and ready to sign.',
    ARRAY[
      'Seven-step guided drafting',
      'State-specific legal compliance',
      'Solicitor review included',
      'Printed Will, cloth-bound folder'
    ],
    false,
    1,
    true
  ),
  (
    'will-couple',
    'The Will — Couple',
    'One-off, both partners',
    null,
    'TBC',
    'one_time',
    'Two mirrored Wills for partners, cross-referenced and sharing one asset register.',
    ARRAY[
      'Two mirrored Wills, cross-referenced',
      'Shared asset register',
      'Both solicitor reviews included',
      'Two folders, one Vault'
    ],
    false,
    2,
    true
  ),
  (
    'vault',
    'Living Vault',
    'Ongoing membership',
    null,
    'TBC',
    'annual',
    'Life-event tracking, annual solicitor review, and executor access — keeping your estate current as your life changes.',
    ARRAY[
      'Life-event tracking and alerts',
      'Included annual solicitor review',
      'Executor access and Legacy Key',
      'Will version history',
      'Cancel anytime'
    ],
    true,
    3,
    true
  )
on conflict (slug) do update
  set
    name           = excluded.name,
    tagline        = excluded.tagline,
    price_label    = excluded.price_label,
    billing_type   = excluded.billing_type,
    description    = excluded.description,
    features       = excluded.features,
    highlight      = excluded.highlight,
    sort_order     = excluded.sort_order,
    is_placeholder = excluded.is_placeholder;

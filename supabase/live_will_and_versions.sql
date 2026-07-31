-- Run this in the Supabase Dashboard > SQL Editor
--
-- Adds version history for wills, an AI legal-review flag, and lawyer
-- review requests (payment is UI-only for now — no live Stripe charge).

-- ─── Will versions ──────────────────────────────────────────────────────────
create table if not exists public.will_versions (
  id uuid primary key default gen_random_uuid(),
  will_id uuid not null references public.wills(id) on delete cascade,
  changed_section text,
  change_summary text not null,
  snapshot jsonb not null,
  needs_review boolean not null default false,
  needs_review_reasons jsonb,
  created_at timestamptz not null default now()
);

create index if not exists will_versions_will_id_idx on public.will_versions(will_id, created_at desc);

alter table public.will_versions enable row level security;

create policy "Users can view their own will versions"
  on public.will_versions for select
  using (
    exists (
      select 1 from public.wills
      where wills.id = will_versions.will_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Users can insert their own will versions"
  on public.will_versions for insert
  with check (
    exists (
      select 1 from public.wills
      where wills.id = will_versions.will_id
        and wills.user_id = auth.uid()
    )
  );

-- ─── Lawyer review requests ─────────────────────────────────────────────────
create table if not exists public.lawyer_review_requests (
  id uuid primary key default gen_random_uuid(),
  will_id uuid not null references public.wills(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  payment_status text not null default 'unpaid' check (payment_status in ('free', 'unpaid', 'paid')),
  requested_at timestamptz not null default now()
);

create index if not exists lawyer_review_requests_will_id_idx on public.lawyer_review_requests(will_id, requested_at desc);

alter table public.lawyer_review_requests enable row level security;

create policy "Users can view their own review requests"
  on public.lawyer_review_requests for select
  using (
    exists (
      select 1 from public.wills
      where wills.id = lawyer_review_requests.will_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Users can insert their own review requests"
  on public.lawyer_review_requests for insert
  with check (
    exists (
      select 1 from public.wills
      where wills.id = lawyer_review_requests.will_id
        and wills.user_id = auth.uid()
    )
  );

-- ─── Wills: subscription + latest legal-review flag ────────────────────────
alter table public.wills add column if not exists subscription_status text not null default 'none' check (subscription_status in ('none', 'active'));
alter table public.wills add column if not exists needs_review boolean not null default false;
alter table public.wills add column if not exists needs_review_reasons jsonb;

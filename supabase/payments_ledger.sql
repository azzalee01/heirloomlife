-- Real payment ledger, written by the Stripe webhook. Source of truth for revenue (the profiles
-- plan/* columns only describe entitlement/access, not money actually collected).
create table if not exists payments (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        references profiles(id) on delete set null,
  email                 text,
  product               text        not null,                    -- 'will' | 'will+updates' | 'updates' | 'rewit'
  amount_total          integer     not null,                    -- cents actually charged by Stripe
  amount_refunded       integer     not null default 0,          -- cents refunded
  currency              text        not null default 'aud',
  status                text        not null default 'paid',     -- 'paid' | 'partially_refunded' | 'refunded'
  stripe_session_id     text        unique,                      -- checkout session (initial purchases)
  stripe_invoice_id     text        unique,                      -- invoice (subscription renewals)
  stripe_payment_intent text,                                    -- for refund matching
  stripe_customer_id    text,
  livemode              boolean     not null default true,
  created_at            timestamptz not null default now()
);
create index if not exists payments_user_id_idx on payments(user_id);
create index if not exists payments_payment_intent_idx on payments(stripe_payment_intent);

alter table payments enable row level security;
-- All writes/reads are via the service role (Stripe webhook + admin dashboard).

-- Will payment gate: vault_included_until on profiles.
-- Run in Supabase Dashboard > SQL Editor after deploying the Will checkout flow.
--
-- vault_included_until tracks when the complimentary 3-month Vault period expires
-- for Will purchasers. Set at checkout.session.completed (product = 'will') by
-- the webhook handler. Opt-in and subscription logic reads this date to gate access.

alter table public.profiles
  add column if not exists vault_included_until timestamptz;

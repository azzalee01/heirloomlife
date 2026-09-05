-- Adds the fixed benefits window included with a one-off Will purchase.
-- Apply before deploying code that reads vault_access_until.

alter table public.profiles
  add column if not exists vault_access_until timestamptz;

comment on column public.profiles.vault_access_until is
  'End of the included Living Vault benefits window for one-off Will purchases. Recurring Vault memberships are governed by Stripe subscription status.';

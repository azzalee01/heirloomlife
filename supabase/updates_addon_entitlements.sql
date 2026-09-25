-- Optional "unlimited updates" annual add-on (A$25/yr, GST inclusive), bought at checkout or later.
-- Additive and safe to run before the code that reads it is deployed.
--
-- Separates the one-off Will purchase (profiles.plan / plan_status) from the updates subscription
-- (updates_status / updates_active_until) so cancelling or failing a renewal never revokes a Will
-- the customer already paid for. Both columns are server-managed: they are NOT granted to
-- `authenticated` (see security_lockdown_server_columns.sql) and are written only by the Stripe webhook.

alter table public.profiles
  add column if not exists updates_status       text,
  add column if not exists updates_active_until timestamptz;

comment on column public.profiles.updates_status is
  'Stripe subscription status of the optional unlimited-updates add-on (active, trialing, past_due, cancelled...). Webhook-managed.';
comment on column public.profiles.updates_active_until is
  'End of the paid period for the updates add-on (set to now() when cancelled). Amendments after first download require this to be in the future. Webhook-managed.';

-- Retired with the 3-month included window: profiles.vault_access_until, profiles.vault_included_until.
-- Left in place for now; drop in a later migration once nothing reads them.

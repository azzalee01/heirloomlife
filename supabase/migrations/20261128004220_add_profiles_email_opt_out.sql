-- Marketing/reminder email opt-out (Spam Act unsubscribe). Written only by the
-- service role (the unsubscribe route + the abandonment cron), so no
-- authenticated column grant is needed. Applied to Sydney as 20261128004220.
alter table public.profiles add column if not exists email_opt_out boolean not null default false;

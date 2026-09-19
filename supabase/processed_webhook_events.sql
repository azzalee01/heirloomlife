CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  stripe_event_id text        PRIMARY KEY,
  processed_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
-- No RLS policies: accessed exclusively via service role key from webhook handler

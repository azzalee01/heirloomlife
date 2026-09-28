-- anonymous_will_sessions: stores in-progress Will data for unauthenticated users.
-- Sessions expire after 30 days. Migrated to a real will_id on account creation.

CREATE TABLE IF NOT EXISTS public.anonymous_will_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  email             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  migrated_to_will_id uuid
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anonymous_will_sessions TO anon, authenticated;

-- RLS
ALTER TABLE public.anonymous_will_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon session insert"
  ON public.anonymous_will_sessions
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "anon session select"
  ON public.anonymous_will_sessions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "anon session update"
  ON public.anonymous_will_sessions
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

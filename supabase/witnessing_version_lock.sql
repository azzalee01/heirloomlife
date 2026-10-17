-- witnessing_version_lock.sql
-- Locks the will version that is presented to witnesses at signing time.
-- Applied to test project cbnosutzwacmhafsdaeb on 2026-10-18.

ALTER TABLE public.witnessing_sessions
  ADD COLUMN IF NOT EXISTS will_version_id  uuid  REFERENCES public.will_versions(id),
  ADD COLUMN IF NOT EXISTS content_hash     text,
  ADD COLUMN IF NOT EXISTS version_stale    boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ws_will_version_id
  ON public.witnessing_sessions(will_version_id);

-- Fast lookup: "are there any active sessions for this will?"
CREATE INDEX IF NOT EXISTS idx_ws_will_id_status
  ON public.witnessing_sessions(will_id, status);

-- appointments: capture the will version when a host links a will in a guided call
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS will_version_id  uuid  REFERENCES public.will_versions(id),
  ADD COLUMN IF NOT EXISTS content_hash     text;

-- Locked document bucket (private, 5 MB max, plain text only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('witnessing-booking-docs', 'witnessing-booking-docs', false, 5242880, ARRAY['text/plain'])
ON CONFLICT (id) DO NOTHING;

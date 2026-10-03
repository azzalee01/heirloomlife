-- Track when a will-abandonment email was sent to a user
-- Prevents repeated sends; NULL means not yet sent

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS abandonment_email_sent_at TIMESTAMPTZ;

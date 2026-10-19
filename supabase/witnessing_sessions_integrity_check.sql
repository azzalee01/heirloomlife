-- Trigger: witnessing_sessions_integrity_check
--
-- Fires BEFORE UPDATE on witnessing_sessions.
-- Only enforces constraints on the scheduled → in_progress transition.
--
-- Within the same transaction as the status update, this trigger:
--   1. Acquires the same per-will advisory lock used by will_versions_signing_lock.
--   2. Reads the latest will_versions row for the will.
--   3. Rejects the transition if the session's locked version is not the
--      latest (i.e. the Will was edited after the session was booked).
--   4. Rejects the transition if version_stale is already true.
--
-- Together with will_versions_signing_lock, this creates mutual exclusion:
--   - Edit path (INSERT will_versions) holds the lock while checking sessions.
--   - Join path (UPDATE witnessing_sessions → in_progress) holds the lock
--     while checking will_versions.
-- Neither can proceed while the other holds the lock.

CREATE OR REPLACE FUNCTION witnessing_sessions_integrity_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_latest_version uuid;
BEGIN
  -- Only enforce on the scheduled → in_progress transition.
  IF NOT (NEW.status = 'in_progress' AND OLD.status = 'scheduled') THEN
    RETURN NEW;
  END IF;

  -- Acquire the same advisory lock key as will_versions_signing_lock so that
  -- a concurrent edit cannot insert a new will_versions row between our
  -- SELECT and the UPDATE committing.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.will_id::text));

  -- Belt-and-braces version check at the DB level.
  SELECT id INTO v_latest_version
  FROM   will_versions
  WHERE  will_id = NEW.will_id
  ORDER  BY created_at DESC
  LIMIT  1;

  IF v_latest_version IS DISTINCT FROM NEW.will_version_id THEN
    RAISE EXCEPTION
      'Session cannot start: the Will was edited after this session was booked. Please cancel and rebook.'
      USING ERRCODE = 'P0001';
  END IF;

  IF NEW.version_stale THEN
    RAISE EXCEPTION
      'Session cannot start: this session has been marked stale.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION witnessing_sessions_integrity_check() FROM PUBLIC;

DROP TRIGGER IF EXISTS witnessing_sessions_integrity_check_trigger ON witnessing_sessions;
CREATE TRIGGER witnessing_sessions_integrity_check_trigger
  BEFORE UPDATE ON witnessing_sessions
  FOR EACH ROW EXECUTE FUNCTION witnessing_sessions_integrity_check();

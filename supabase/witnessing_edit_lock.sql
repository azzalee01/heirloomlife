-- Atomic pre-mutation edit lock for Will mutations that may affect witnessing sessions.
--
-- will_edit_lock(p_will_id):
--   1. Acquires a transaction-scoped advisory lock for this will ID, serialising
--      concurrent edit calls at the database level.
--   2. Checks for any in_progress witnessing sessions — raises P0001 if found.
--   3. Marks all scheduled sessions stale within the same transaction.
--   4. Returns the count of sessions marked stale.
--
-- Because steps 2–3 execute in a single transaction protected by the advisory
-- lock, there is no race window between the check and the stale marking.
-- Any concurrent call for the same will queues behind the lock and proceeds
-- only after the first caller's transaction commits.
--
-- Raises ERRCODE P0001 with a user-facing message if a session is in progress.
-- Raises any standard Postgres error on infrastructure failure (caller fails closed).

CREATE OR REPLACE FUNCTION will_edit_lock(p_will_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_in_progress integer;
  v_stale_count integer;
BEGIN
  -- Transaction-scoped advisory lock keyed to this will.
  -- Serialises concurrent edit attempts; released automatically on commit/rollback.
  PERFORM pg_advisory_xact_lock(hashtext(p_will_id::text));

  SELECT COUNT(*) INTO v_in_progress
  FROM witnessing_sessions
  WHERE will_id = p_will_id
    AND status = 'in_progress';

  IF v_in_progress > 0 THEN
    RAISE EXCEPTION 'A witnessing session is currently in progress. Your Will is locked until the session completes.'
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE witnessing_sessions
  SET version_stale = true
  WHERE will_id = p_will_id
    AND status = 'scheduled'
    AND NOT version_stale;

  GET DIAGNOSTICS v_stale_count = ROW_COUNT;
  RETURN v_stale_count;
END;
$$;

-- Revoke public execute; only the service role (SECURITY DEFINER) may call this.
REVOKE EXECUTE ON FUNCTION will_edit_lock(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION will_edit_lock(uuid) TO service_role;

-- Trigger: will_versions_signing_lock
--
-- Fires BEFORE INSERT on will_versions.
--
-- Within the same database transaction as the version row insertion, this
-- trigger acquires a per-will advisory lock and checks whether any
-- in_progress witnessing session exists.  If one does, the insert is
-- refused with P0001, which causes the entire saveStep transaction to fail
-- rather than silently proceeding with an unversioned edit.
--
-- The advisory lock is the same key used by will_edit_lock() and by the
-- witnessing_sessions_integrity_check trigger, so all three paths
-- serialise against each other.  Advisory locks are transaction-scoped:
-- they are held until the INSERT commits or rolls back.
--
-- Why a trigger rather than the existing RPC?
-- The will_edit_lock() RPC runs in its own transaction and releases its
-- advisory lock before the caller's mutation requests are issued.  No
-- application-level check can bridge that gap.  This trigger runs inside
-- the transaction that actually writes will_versions, making the guard
-- atomic with the write it protects.

CREATE OR REPLACE FUNCTION will_versions_signing_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_in_progress integer;
BEGIN
  -- Serialise with the witnessing_sessions status-transition trigger.
  -- Both triggers acquire this lock; only one transaction proceeds at a time.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.will_id::text));

  SELECT COUNT(*) INTO v_in_progress
  FROM witnessing_sessions
  WHERE will_id = NEW.will_id
    AND status  = 'in_progress';

  IF v_in_progress > 0 THEN
    RAISE EXCEPTION
      'Will edit blocked: a witnessing session is currently in progress. Please wait for the session to complete before saving changes.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION will_versions_signing_lock() FROM PUBLIC;

DROP TRIGGER IF EXISTS will_versions_signing_lock_trigger ON will_versions;
CREATE TRIGGER will_versions_signing_lock_trigger
  BEFORE INSERT ON will_versions
  FOR EACH ROW EXECUTE FUNCTION will_versions_signing_lock();

-- Atomic promotion of a pending amendment to the live Will.
--
-- Called by staff when reviewing an amendment submitted via the Estate Assistant.
-- Runs as a single transaction:
--   1. Lock the version row and verify it is pending_review with a document.
--   2. Promote document_text to wills.document_text.
--   3. Mark wills.status = approved and record the reviewer.
--   4. Mark the version row as approved with reviewer + timestamp.
--
-- The previous approved version row remains in will_versions permanently as
-- historical record; only wills.document_text is replaced.
--
-- Usage: SELECT promote_will_amendment('<version_uuid>', '<staff_user_uuid>');

create or replace function promote_will_amendment(
  p_version_id  uuid,
  p_reviewed_by uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_will_id       uuid;
  v_document_text text;
begin
  -- Acquire a row-level lock and verify preconditions atomically.
  select will_id, document_text
  into strict v_will_id, v_document_text
  from will_versions
  where id = p_version_id
    and status = 'pending_review'
  for update;

  if v_document_text is null then
    raise exception 'will_versions row % has no document_text — cannot promote', p_version_id;
  end if;

  -- Promote to the live will.
  update wills
  set
    document_text      = v_document_text,
    status             = 'approved',
    approved_by        = p_reviewed_by,
    solicitor_reviewed_at = now(),
    updated_at         = now()
  where id = v_will_id;

  -- Mark the version as approved, preserving the historical record.
  update will_versions
  set
    status      = 'approved',
    approved_by = p_reviewed_by,
    approved_at = now()
  where id = p_version_id;
end;
$$;

-- Allow only service-role (admin) callers to execute this function.
revoke execute on function promote_will_amendment(uuid, uuid) from public, anon, authenticated;
grant  execute on function promote_will_amendment(uuid, uuid) to service_role;

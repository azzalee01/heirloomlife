-- Run this in the Supabase Dashboard > SQL Editor
--
-- Lets a witnessing session be scheduled either by the testator (host picks
-- date/time up front) or by the witness themselves via a shareable link
-- (testator just adds the witness, the witness picks a time that works).

alter table public.witnessing_sessions
  add column if not exists scheduling_mode text not null default 'host_scheduled'
    check (scheduling_mode in ('host_scheduled', 'witness_self_scheduled'));

-- scheduled_at is only known up front for host-scheduled sessions.
alter table public.witnessing_sessions alter column scheduled_at drop not null;

alter table public.witness_attestations
  add column if not exists access_token uuid not null default gen_random_uuid();

create unique index if not exists witness_attestations_access_token_idx
  on public.witness_attestations(access_token);

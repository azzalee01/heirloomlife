-- Run this in the Supabase Dashboard > SQL Editor
--
-- Remote witnessing sessions for will signing (NSW Electronic Transactions Act,
-- Part 2B). Recording + long-term storage of the session is a premium feature
-- gated by wills.subscription_status; the live AVL session itself is available
-- on every tier since recording is not a legal requirement for valid witnessing.

-- ─── Witnessing sessions ────────────────────────────────────────────────────
create table if not exists public.witnessing_sessions (
  id uuid primary key default gen_random_uuid(),
  will_id uuid not null references public.wills(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  provider text not null default 'daily',
  room_url text,
  recording_enabled boolean not null default false,
  recording_url text,
  recording_status text
    check (recording_status in ('none', 'processing', 'available', 'failed')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists witnessing_sessions_will_id_idx
  on public.witnessing_sessions(will_id, scheduled_at desc);

alter table public.witnessing_sessions enable row level security;

create policy "Users can view their own witnessing sessions"
  on public.witnessing_sessions for select
  using (
    exists (
      select 1 from public.wills
      where wills.id = witnessing_sessions.will_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Users can insert their own witnessing sessions"
  on public.witnessing_sessions for insert
  with check (
    exists (
      select 1 from public.wills
      where wills.id = witnessing_sessions.will_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Users can update their own witnessing sessions"
  on public.witnessing_sessions for update
  using (
    exists (
      select 1 from public.wills
      where wills.id = witnessing_sessions.will_id
        and wills.user_id = auth.uid()
    )
  );

-- ─── Witness attestations ───────────────────────────────────────────────────
-- One row per witness per session, capturing the Part 2B-required endorsement
-- of the method used to witness the signature.
create table if not exists public.witness_attestations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.witnessing_sessions(id) on delete cascade,
  witness_name text not null,
  witness_email text,
  witnessing_method text not null default 'audio_visual_link',
  attested_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists witness_attestations_session_id_idx
  on public.witness_attestations(session_id);

alter table public.witness_attestations enable row level security;

create policy "Users can view attestations for their own sessions"
  on public.witness_attestations for select
  using (
    exists (
      select 1 from public.witnessing_sessions
      join public.wills on wills.id = witnessing_sessions.will_id
      where witnessing_sessions.id = witness_attestations.session_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Users can insert attestations for their own sessions"
  on public.witness_attestations for insert
  with check (
    exists (
      select 1 from public.witnessing_sessions
      join public.wills on wills.id = witnessing_sessions.will_id
      where witnessing_sessions.id = witness_attestations.session_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Users can update attestations for their own sessions"
  on public.witness_attestations for update
  using (
    exists (
      select 1 from public.witnessing_sessions
      join public.wills on wills.id = witnessing_sessions.will_id
      where witnessing_sessions.id = witness_attestations.session_id
        and wills.user_id = auth.uid()
    )
  );

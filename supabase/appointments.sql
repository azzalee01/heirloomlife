-- Guided appointments: booking + call + recording metadata.
--
-- NOT YET APPLIED ANYWHERE. Review first, then apply to the Supabase TEST project
-- (heirloom-life-test) before production, per the standing rule on schema changes.
--
-- Separate from witnessing_sessions / heirloom_witness_slots (statutory AV witnessing):
-- different purpose, consent, and retention.
--
-- v2 changes vs the first draft:
--   * Join links are signed (HMAC of appointment id + token_version, secret in env), so nothing
--     secret is stored and reminder emails can re-derive the same link. access_token_* columns removed.
--   * appointment_recordings gains provider_recording_id and duration_seconds.
--   * appointment_events gains recording_accessed and recording_start_failed.

create extension if not exists btree_gist;

-- 1. Host availability ------------------------------------------------------
create table if not exists public.staff_availability_rules (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id),
  weekday smallint not null check (weekday between 0 and 6),   -- 0 = Sunday
  start_time time not null,
  end_time time not null check (end_time > start_time),
  slot_minutes integer not null default 60 check (slot_minutes between 15 and 180),
  timezone text not null default 'Australia/Sydney',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_availability_overrides (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id),
  override_date date not null,
  is_blocked boolean not null default true,       -- true = day off / blocked window; false = extra open window
  start_time time,                                -- null with is_blocked = whole day
  end_time time,
  note text,
  created_at timestamptz not null default now(),
  check ((start_time is null) = (end_time is null)),
  check (is_blocked or start_time is not null)    -- an extra open window needs times
);

-- 2. Appointments -----------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id),
  user_id uuid references public.profiles(id),            -- set when the booker was signed in
  will_id uuid references public.wills(id),
  appointment_type text not null default 'guided_will'
    check (appointment_type in ('guided_will')),
  source text not null default 'website'
    check (source in ('website', 'phone', 'admin')),

  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  booked_by_name text,                                    -- set when family books on behalf of the will-maker
  booked_by_email text,

  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),

  -- Signed join link: HMAC(secret, id:token_version). Bump token_version to invalidate issued links.
  token_version integer not null default 1,

  -- Daily room (created lazily on first join)
  daily_room_name text unique,
  daily_room_url text,

  -- recording consent (explicit, timestamped, versioned wording)
  recording_consent_at timestamptz,
  recording_consent_version text,

  -- reminders
  reminder_24h_sent_at timestamptz,
  reminder_1h_sent_at timestamptz,

  -- outcome
  started_at timestamptz,
  ended_at timestamptz,
  cancelled_at timestamptz,
  escalated boolean not null default false,               -- capacity / undue-influence escalation raised
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (ends_at > starts_at),
  -- no double-booking per host while a booking is live
  constraint appointments_no_overlap exclude using gist (
    host_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('scheduled', 'in_progress'))
);

create index if not exists appointments_user_idx on public.appointments (user_id, starts_at desc);
create index if not exists appointments_email_idx on public.appointments (lower(customer_email));
create index if not exists appointments_scheduled_idx on public.appointments (starts_at) where status = 'scheduled';

create or replace function public.appointments_set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.appointments_set_updated_at();

-- 3. Recordings: one row per segment (recording is stopped/restarted around card entry) --
create table if not exists public.appointment_recordings (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id),
  segment_index integer not null,
  provider_recording_id text unique,                      -- Daily recording id; used to mint short-lived access links
  storage_path text,                                      -- object key, if/when recordings are written to our own bucket
  status text not null default 'recording'
    check (status in ('recording', 'processing', 'available', 'failed', 'deleted')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  retention_until timestamptz,                            -- DECISION PENDING: null until the retention period is set
  created_at timestamptz not null default now(),
  unique (appointment_id, segment_index)
);

-- 4. Append-only audit trail ------------------------------------------------
create table if not exists public.appointment_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id),
  event_type text not null check (event_type in (
    'booked', 'rescheduled', 'cancelled', 'reminder_sent',
    'consent_given', 'consent_declined',
    'joined', 'left', 'recording_started', 'recording_paused', 'recording_stopped',
    'recording_start_failed', 'recording_accessed',
    'payment_step_started', 'payment_step_completed',
    'capacity_flag', 'third_party_present', 'escalated', 'completed', 'no_show'
  )),
  actor text not null default 'system'
    check (actor in ('customer', 'host', 'system')),
  offset_seconds integer,                                 -- seconds into the current recording segment
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists appointment_events_appt_idx on public.appointment_events (appointment_id, created_at);

-- Append-only audit trail. RLS does not bind the service role, so this is enforced with a trigger:
-- no updates or deletes on events, for any role.
create or replace function public.appointment_events_immutable()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  raise exception 'appointment_events is append-only';
end $$;

drop trigger if exists appointment_events_no_update on public.appointment_events;
create trigger appointment_events_no_update
before update or delete on public.appointment_events
for each row execute function public.appointment_events_immutable();

-- 5. RLS: customers read their own rows; ALL writes go through server code using the service role ----
alter table public.staff_availability_rules enable row level security;
alter table public.staff_availability_overrides enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_recordings enable row level security;
alter table public.appointment_events enable row level security;

drop policy if exists "customers read own appointments" on public.appointments;
create policy "customers read own appointments"
  on public.appointments for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Recordings, events and availability: no client policies (service role only).

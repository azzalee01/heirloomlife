-- Run this in the Supabase Dashboard > SQL Editor
--
-- NSW requires a minimum of two witnesses for a will signing. This adds:
--   1. witness_source on witnessing_sessions, so a session is tagged as
--      using the testator's own witnesses vs. Heirloom-provided witnesses.
--   2. heirloom_witness_slots, a bookable pool of pre-scheduled slots each
--      staffed by two Heirloom witnesses, for testators who don't have
--      their own two witnesses available.

alter table public.witnessing_sessions
  add column if not exists witness_source text not null default 'own'
    check (witness_source in ('own', 'heirloom_provided'));

create table if not exists public.heirloom_witness_slots (
  id uuid primary key default gen_random_uuid(),
  scheduled_at timestamptz not null,
  witness_1_name text not null,
  witness_1_email text,
  witness_2_name text not null,
  witness_2_email text,
  is_booked boolean not null default false,
  session_id uuid references public.witnessing_sessions(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists heirloom_witness_slots_open_idx
  on public.heirloom_witness_slots(scheduled_at) where is_booked = false;

alter table public.heirloom_witness_slots enable row level security;

-- Any signed-in user can see open slots to book, plus the slot they booked
-- themselves (via the session they own) once it's no longer open.
create policy "Authenticated users can view bookable or owned slots"
  on public.heirloom_witness_slots for select
  to authenticated
  using (
    is_booked = false
    or exists (
      select 1 from public.witnessing_sessions
      join public.wills on wills.id = witnessing_sessions.will_id
      where witnessing_sessions.id = heirloom_witness_slots.session_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Authenticated users can book an open slot"
  on public.heirloom_witness_slots for update
  to authenticated
  using (is_booked = false);

-- Demo availability so the booking flow has something to show immediately.
-- Replace with real staff-witness scheduling once that's operational.
insert into public.heirloom_witness_slots (scheduled_at, witness_1_name, witness_1_email, witness_2_name, witness_2_email)
select v.scheduled_at, v.w1_name, v.w1_email, v.w2_name, v.w2_email
from (values
  (now() + interval '1 day' + interval '10 hours', 'Sarah Mitchell', 'witness1@heirloomlife.com.au', 'James Chen', 'witness2@heirloomlife.com.au'),
  (now() + interval '2 days' + interval '14 hours', 'Sarah Mitchell', 'witness1@heirloomlife.com.au', 'James Chen', 'witness2@heirloomlife.com.au'),
  (now() + interval '3 days' + interval '11 hours', 'Priya Nair', 'witness3@heirloomlife.com.au', 'Tom Walsh', 'witness4@heirloomlife.com.au')
) as v(scheduled_at, w1_name, w1_email, w2_name, w2_email)
where not exists (select 1 from public.heirloom_witness_slots limit 1);

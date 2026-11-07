-- appointment_ratings: one row per appointment, written when the customer clicks a star in the post-call email
create table if not exists appointment_ratings (
  id             uuid        primary key default gen_random_uuid(),
  appointment_id uuid        not null references appointments(id) on delete cascade,
  rating         smallint    not null check (rating between 1 and 5),
  created_at     timestamptz not null default now(),
  unique (appointment_id)   -- only the first click is recorded; duplicates are ignored
);

alter table appointment_ratings enable row level security;
-- All access is via service role (admin API + server actions only).

-- Run this in the Supabase Dashboard > SQL Editor
--
-- Adds storage for the Estate Assistant chat history and the AI-drafted
-- will document text.

-- ─── Chat messages ─────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  will_id uuid not null references public.wills(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_will_id_idx on public.chat_messages(will_id, created_at);

alter table public.chat_messages enable row level security;

create policy "Users can view their own chat messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.wills
      where wills.id = chat_messages.will_id
        and wills.user_id = auth.uid()
    )
  );

create policy "Users can insert their own chat messages"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.wills
      where wills.id = chat_messages.will_id
        and wills.user_id = auth.uid()
    )
  );

-- ─── Drafted will document ─────────────────────────────────────────────────
alter table public.wills add column if not exists document_text text;

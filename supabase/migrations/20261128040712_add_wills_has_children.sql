-- Persist the Children step's yes/no answer so "No children" survives a reload
-- (null = unanswered, true = yes, false = no). Without it, a "No" answer leaves no
-- children rows and reads as unanswered — resume returns to Children and the
-- abandonment cron treats the user as incomplete. Applied to Sydney as 20261128040712.
alter table public.wills add column if not exists has_children boolean;
grant update (has_children) on public.wills to authenticated;

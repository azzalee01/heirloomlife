-- SECURITY LOCKDOWN: stop signed-in users writing billing / entitlement / review columns.
--
-- Root cause: the RLS policies users_own_profile / users_own_wills are FOR ALL and the `authenticated`
-- role holds table-level INSERT/UPDATE, so any browser client could run, e.g.
--   supabase.from('profiles').update({ plan: 'will', plan_status: 'active' }).eq('id', myId)
-- and the server then trusted those columns (download route, completeWill, amendment gate).
-- The trigger the code comments refer to (wills_protect_server_columns) does not exist in production.
--
-- Fix: column-level privileges. Deny by default: a column added later is server-only until granted here.
-- The service role (all server code using supabaseAdmin) is unaffected.
-- Verified in the test project on a scratch replica of both tables: the exploits work BEFORE, are blocked
-- AFTER, and the app's real writes (profile upsert, wizard saves) still work.
--
-- TWO PARTS, run separately:
--   PART A is compatible with the code that is live today (its only browser-side profile writes are
--          id / email / full_name). Run it NOW: it closes the payment bypass.
--   PART B needs the code on branch feat/pricing-updates-addon deployed first, because that code stops
--          the wizard inserting `status` and moves markWillDownloaded to the service role.
--          Run it right after that deploy, then smoke-test: sign up, start a Will, complete a step, download.
--
-- Not yet covered (follow-up audit): other user-writable tables with server-managed columns, and
-- wills.needs_review / needs_review_reasons / triage_flags, which the wizard still writes as the user.

-- ===================== PART A: run now =====================
begin;

-- wills.document_text is written by completeWill (service role) and read by the download route,
-- but the column is missing in production (ai_chat_and_drafting.sql was only partly applied).
-- Additive; fixes the paid download path.
alter table public.wills add column if not exists document_text text;

-- profiles: users may only maintain their own identity fields.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, email, full_name, phone) on public.profiles to authenticated;
grant update (id, email, full_name, phone) on public.profiles to authenticated;

commit;

-- ===================== PART B: run after the code deploy =====================
begin;

-- wills: users may create a draft Will and save wizard inputs. Status, payment, solicitor review,
-- document text and the download flag are server-managed.
revoke insert, update on public.wills from anon, authenticated;
grant insert (user_id, partner_referral_code) on public.wills to authenticated;
grant update (survivorship_days, pet_care, life_interest, triage_flags, needs_review, needs_review_reasons)
  on public.wills to authenticated;

commit;

-- ROLLBACK (restores the previous, insecure state):
--   grant insert, update on public.profiles to authenticated, anon;
--   grant insert, update on public.wills to authenticated, anon;

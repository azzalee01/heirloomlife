# Heirloom Life — Launch Checklist

**Target:** First paying customer (NSW, AV witnessing + print-and-sign)  
**Last updated:** 2026-10-18

Mark each item ✅ when confirmed. Items marked ⚠ are blockers.

---

## Code & branch

- [ ] ⚠ Merge `feat/witnessing-version-lock` into `main` (3× P0 + 2× P1 fixes)
- [ ] Confirm `e2e-audit` Playwright suite reviewed — cherry-pick or merge if desired
- [ ] TypeScript: `npx tsc --noEmit` → 0 errors
- [ ] Tests: `npx vitest run` → 175/175 passing
- [ ] `next build` completes without errors on main

---

## Database — production (`rzxdzoooghsjfnixckgq`)

- [ ] ⚠ Apply `supabase/employer_enquiries_rls.sql` to prod
- [ ] ⚠ Apply `supabase/witnessing_version_lock.sql` to prod (adds `will_version_id`, `content_hash`, `version_stale` to `witnessing_sessions`)
- [ ] Verify `security_lockdown_server_columns.sql` PART B applied to prod
- [ ] Verify `promote_will_amendment` RPC exists in prod
- [ ] Verify `increment_rewit_credits` RPC exists in prod
- [ ] Verify Storage buckets exist: `witnessing-booking-docs`, `witnessing-uploads`, `executed-wills`, `session-recordings`
- [ ] Verify Storage bucket policies (no public read on private buckets)

---

## Vercel environment variables — production

- [ ] ⚠ `DAILY_API_KEY` set
- [ ] ⚠ `DAILY_WEBHOOK_HMAC_SECRET` set (P0 fix requires this or all Daily webhooks return 500)
- [ ] ⚠ `STRIPE_WEBHOOK_SECRET` set
- [ ] `STRIPE_SECRET_KEY` set (production key, not test)
- [ ] `STRIPE_PRICE_WILL` set (production price ID for AUD $149)
- [ ] `STRIPE_PRICE_UPDATES` set (production price ID for AUD $25/yr)
- [ ] `STRIPE_PRICE_REWIT` set (production price ID for re-witnessing)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (prod project)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set (prod project)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set (prod project)
- [ ] `APPOINTMENT_HOST_USER_IDS` set (comma-separated Supabase auth user IDs for Aaron)
- [ ] `APPOINTMENT_LINK_SECRET` set (HMAC key for customer join links)
- [ ] `CRON_SECRET` set (guards cron and IndexNow endpoints)
- [ ] `ANTHROPIC_API_KEY` set (will upload extraction)
- [ ] `RESEND_API_KEY` set (transactional email)
- [ ] `LOOPS_API_KEY` set (if marketing automation active)
- [ ] `APP_URL` set to `https://www.heirloomlife.com.au`

---

## Stripe — production account

- [ ] ⚠ Products and prices created in live mode (not test mode)
- [ ] ⚠ Webhook endpoint registered: `https://www.heirloomlife.com.au/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Webhook signing secret copied to Vercel `STRIPE_WEBHOOK_SECRET`
- [ ] Test a real card payment end-to-end in staging before go-live

---

## Daily.co

- [ ] ⚠ Webhook registered in Daily dashboard pointing to `https://www.heirloomlife.com.au/api/webhooks/daily`
  - Event: `recording.ready-to-download`
- [ ] HMAC secret copied to Vercel `DAILY_WEBHOOK_HMAC_SECRET`
- [ ] Test room creation via `ensureAppointmentRoom()` in prod

---

## Witnessing operations

- [ ] Availability rules entered in admin (`/admin/availability`) for Aaron's slots
- [ ] Test booking flow: customer books → slot appears in admin → Daily room created
- [ ] Test version-lock: book → edit Will → confirm amber warning on witnessing page
- [ ] Test join token: stale session hard-blocks with clear error message
- [ ] Confirm s14G AV statement renders correctly in WitnessingPanel after witnessing

---

## Legal & copy

- [ ] All 42 NSW clauses reviewed and status confirmed (35 active, 7 escalation)
- [ ] Clause sync run against prod (`npx tsx scripts/sync-legal-content.ts` with prod env)
- [ ] No "solicitor-reviewed" / "solicitor-signed" copy anywhere (check with `grep -r`)
- [ ] No "legally binding" or "guaranteed valid" copy anywhere
- [ ] Footer: privacy policy, terms of service links live
- [ ] ABN displayed if required

---

## Monitoring & alerting

- [ ] Vercel error alerting configured (email or Slack)
- [ ] Supabase prod project: DB connection pool checked (default pooler settings sufficient for launch)
- [ ] Stripe radar rules reviewed (no overly aggressive blocks for AU cards)

---

## First-customer dry run

- [ ] Aaron completes full Will flow on prod (draft → pay → witnessing session → executed Will download)
- [ ] Confirm PDF/TXT renders correctly with real data
- [ ] Confirm executed Will accessible from dashboard
- [ ] Confirm Resend transactional emails delivered (booking confirmation, amendment emails)

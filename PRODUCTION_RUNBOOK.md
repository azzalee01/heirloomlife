# Heirloom Life — Production Runbook

**Last updated:** 2026-10-18  
**Production project:** `rzxdzoooghsjfnixckgq` (Supabase)  
**Production URL:** `https://www.heirloomlife.com.au`

---

## Standing rules

- **Never touch production DB directly** unless a migration is in `supabase/` and has been tested on `cbnosutzwacmhafsdaeb` first.
- **Never apply migrations to `rzxdzoooghsjfnixckgq`** without confirming on test first.
- Stripe: never modify live prices or webhooks without a runbook entry.
- Daily.co: never delete rooms that belong to scheduled/in-progress appointments.

---

## Deployment

Heirloom Life deploys via Vercel on push to `main`.

```bash
# Verify the deploy
vercel ls --prod          # latest production deployment
vercel logs --prod        # tail production logs
```

To roll back:
```bash
vercel rollback           # reverts to the previous production deployment
```

Rollback is safe for code-only changes. If the deployment included a DB migration, do NOT rollback without also reverting the migration (usually not possible without data loss — prefer a forward fix).

---

## Database migrations (production)

Always apply to test first:
```bash
# .env must point to TEST project (cbnosutzwacmhafsdaeb)
npx supabase db push --project-ref cbnosutzwacmhafsdaeb
```

Then apply to prod via the Supabase MCP or CLI:
```bash
npx supabase db push --project-ref rzxdzoooghsjfnixckgq
```

Pending migrations to apply before launch:
1. `supabase/employer_enquiries_rls.sql`
2. `supabase/witnessing_version_lock.sql`
3. Confirm `security_lockdown_server_columns.sql` PART B

---

## Incident response

### Customer reports Will won't generate

1. Check Vercel function logs for error from `app/will/new/_actions.ts`
2. Likely causes:
   - `No active beneficiaries` — customer removed all beneficiaries (expected error, UI should show it)
   - `assembleWillDocument` RPC error — check Supabase function logs
   - Clause text missing from `clause_versions` — run sync script

### Customer can't join witnessing session

1. Error: "Will was updated after this session was booked" → version locked. Customer must contact support. Admin can check `witnessing_sessions.version_stale` and `will_version_id`.
2. Error: "Session was booked before version locking" → legacy session (pre-feature). Admin must reschedule.
3. Check `DAILY_API_KEY` is set in Vercel and Daily room exists.

### Witnessing session: Daily room not created

1. Check `DAILY_API_KEY` env var in Vercel.
2. Check Daily API quota at `https://dashboard.daily.co`.
3. Room is created lazily on first join — check `appointments.daily_room_name` in DB.

### Payment webhook not firing

1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches the signing secret for the registered endpoint.
2. Check Stripe dashboard → Developers → Webhooks → recent deliveries.
3. Replay a failed event from the Stripe dashboard (safe — `processed_webhook_events` ensures idempotency).

### Stripe webhook: duplicate event

Idempotency is handled by `processed_webhook_events` table. A replayed event is a no-op if it was already processed. Safe to replay.

### Email not delivered

1. Check Resend dashboard for bounce/spam classification.
2. Check `RESEND_API_KEY` in Vercel.
3. Transactional emails use `aaron@heirloomlife.com.au` as sender — ensure domain is verified in Resend.

### Admin: can't approve amendment

1. Confirm the logged-in user's Supabase auth `user.id` is in `APPOINTMENT_HOST_USER_IDS` env var.
2. Check Vercel function logs for the server action error.

---

## Useful queries (run on prod via Supabase SQL editor — read-only)

```sql
-- Wills pending review
SELECT w.id, p.email, wv.change_summary, wv.created_at
FROM will_versions wv
JOIN wills w ON w.id = wv.will_id
JOIN profiles p ON p.id = w.user_id
WHERE wv.status = 'pending_review'
ORDER BY wv.created_at;

-- Active witnessing sessions
SELECT ws.id, ws.status, ws.version_stale, ws.will_version_id, w.id as will_id
FROM witnessing_sessions ws
JOIN wills w ON w.id = ws.will_id
WHERE ws.status IN ('scheduled', 'in_progress');

-- Recent payments
SELECT p.email, sb.plan_status, sb.stripe_customer_id, sb.updated_at
FROM stripe_billing sb
JOIN profiles p ON p.id = sb.user_id
ORDER BY sb.updated_at DESC
LIMIT 20;

-- Recent employer enquiries
SELECT contact_name, company, email, created_at
FROM employer_enquiries
ORDER BY created_at DESC
LIMIT 20;
```

---

## Clause sync (run after any clause changes in heirloomlife-legal)

```bash
# From heirloomlife-legal repo — MUST use test .env first
SUPABASE_URL=https://cbnosutzwacmhafsdaeb.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<test-key> \
npx tsx scripts/sync-legal-content.ts

# Then prod (only after confirming on test)
SUPABASE_URL=https://rzxdzoooghsjfnixckgq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<prod-key> \
npx tsx scripts/sync-legal-content.ts
```

---

## Key contacts

- Infrastructure / code: Aaron (founder)
- Legal review: solicitor on retainer (for escalation clauses: FOREIGN-01, BIZ-01, BIZ-02, TRUST-TESTAMENTARY-01, DISABILITY-01, LIFE-INT-01, EXCL-01)
- Witnessing sessions: Aaron hosts all sessions at launch

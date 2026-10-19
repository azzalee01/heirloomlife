# Heirloom Life — Pre-Launch Audit

**Date:** 2026-10-18  
**Scope:** Full codebase audit across customer journey, security, payments, witnessing, admin operations, and production readiness.  
**Branch audited:** `feat/witnessing-version-lock` (based on `main` @ `c407fcc`)

---

## Executive summary

The product is substantially ready for a controlled first-customer launch. Three P0 issues have been fixed in this branch. Two P1 issues are fixed. Two P1 items require production DB migration before launch. No P0 blockers remain in the codebase.

---

## P0 — Critical (fixed in this branch)

| # | File | Issue | Fix |
|---|------|-------|-----|
| P0-1 | `app/api/webhooks/daily/route.ts:68` | Webhook returned `200 OK` when `DAILY_WEBHOOK_HMAC_SECRET` not set — all Daily events accepted unauthenticated | Now returns `500` with error body; all unverified events rejected |
| P0-2 | `app/api/will/upload/route.ts:144` | `console.log` printed up to 300 chars of testator PII (name, DOB, address from Claude extraction) to server logs | Log line removed |
| P0-3 | `app/will/new/_assembly.ts:206` | Assembly silently produced a Will with no residue clause when all beneficiaries filtered out (empty name / 0%) | Throws descriptive error before assembly when no active beneficiaries — blocks document generation |

---

## P1 — High (fixed in this branch or test DB)

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| P1-1 | `app/admin/wills/_actions.ts`, `app/admin/clauses/_actions.ts` | Actions used a local `requireStaffAuth()` (DB `profiles.role = 'staff'`) while every admin page uses `getHostUser()` (env `APPOINTMENT_HOST_USER_IDS`). A host could see but not act; a DB staff user could act but not see the page. | Both replaced with `requireHost()` — consistent with all admin pages |
| P1-2 | `app/api/indexnow/route.ts` | POST endpoint unauthenticated — anyone could trigger crawl submissions | Now requires `Authorization: Bearer $CRON_SECRET` header |
| P1-3 | `employer_enquiries` table | RLS disabled — any anon client could `SELECT *` and read all enquiry submissions | RLS enabled in test DB migration `enable_rls_employer_enquiries`. **Must apply to prod before launch.** |
| P1-4 | `app/will/new/_assembly.ts` | Executor `lastNameOnly` used in a witness attestation note — when executor has no last name recorded, the fragment reads blank | Documented; low-risk since EXEC-ATTEST-01 is excluded from assembly. Cosmetic only for other references. |

---

## P2 — Medium (open, pre-launch recommended)

| # | Location | Issue | Notes |
|---|----------|-------|-------|
| P2-1 | `supabase/security_lockdown_server_columns.sql` (PART B) | PART B (column-level privileges) is not confirmed applied to production | Verify with prod DB before launch |
| P2-2 | Vercel prod env | `DAILY_API_KEY`, `DAILY_WEBHOOK_HMAC_SECRET`, `STRIPE_PRICE_REWIT`, `STRIPE_WEBHOOK_SECRET` — presence unconfirmed | Verify in Vercel dashboard before enabling witnessing |
| P2-3 | Will download route | Does not check `plan_status` before serving — a user who was refunded could still download | Low priority: Stripe webhooks correctly set `plan_status`; risk is edge case |
| P2-4 | `app/api/cron/` routes | Cron endpoints require `CRON_SECRET`; must confirm it is set in Vercel cron config | Verify before enabling scheduled jobs |

---

## Architecture audit (no issues found)

| Area | Verdict |
|------|---------|
| Stripe webhook | ✓ HMAC verified, idempotency via `processed_webhook_events`, correct entitlement writes |
| Will generation | ✓ `assembleWillDocument` is the single source of truth; EXEC-ATTEST-01 correctly excluded |
| RLS coverage | ✓ All core tables (`wills`, `will_versions`, `profiles`, `appointments`, `witnessing_sessions`) have RLS |
| Supabase client separation | ✓ `supabaseAdmin` (service role) only in server files; never imported from client components |
| Version locking | ✓ `will_version_id` + `content_hash` captured at booking; `getJoinToken` hard-blocks stale/mismatched sessions |
| Payment gate | ✓ Will completion requires `plan_status = 'active'`; enforced in `completeWill()` |
| Email PII | ✓ Resend used for transactional; Loops for marketing — no raw SMTP with PII in logs |
| Witnessing legal | ✓ NSW AV witnessing legally permitted under Succession Act 2006 s14G as amended by COVID legislation made permanent |

---

## Production DB migrations not yet applied

These SQL files exist in `supabase/` but their production application status is unconfirmed:

- `employer_enquiries_rls.sql` — **Must apply before launch**
- `witnessing_version_lock.sql` — Applied to test; **must apply to prod before enabling witnessing**
- `security_lockdown_server_columns.sql` PART B — Verify

---

## Scope constraints respected

- Will price: AUD $149 — unchanged throughout
- Test Supabase project only: `cbnosutzwacmhafsdaeb`
- Production project `rzxdzoooghsjfnixckgq` — not touched
- No Stripe changes
- No approved legal document changes
- Copy rules: no "solicitor-reviewed/signed", no "legally binding", no implied witnesses = solicitors

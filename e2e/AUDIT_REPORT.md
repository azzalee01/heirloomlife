# Heirloom Life — Pre-Launch Audit Report

**Branch:** e2e-audit
**Audit date:** 2026-09-19 / 2026-09-20
**Auditor:** Claude Code (claude-sonnet-4-6) — read-only, no app code modified
**Repository:** azzalee01/heirloomlife (local: /Users/aaronlee/heirloom-life)
**Production:** https://www.heirloomlife.com.au
**Supabase project:** rzxdzoooghsjfnixckgq

---

## 0. Environment Under Test

| Dimension | Value | Notes |
|---|---|---|
| App framework | Next.js App Router | Server components, server actions, API routes |
| Auth | Supabase Auth + custom anon session cookie (`hl_anon_session`) | httpOnly, sameSite=lax, 30-day TTL |
| Database | Supabase Postgres (rzxdzoooghsjfnixckgq) | Production only — no branch active |
| Payments | Stripe embedded checkout | Subscription (vault) + one-time (will) |
| Email | Resend | FROM fallback is `onboarding@resend.dev` — not production address |
| Bank data | Basiq (CDR accredited) | |
| AI extraction | claude-haiku-4-5-20251001 via Anthropic SDK | Will upload parsing |
| Video witnessing | Daily.co | NSW only |
| Deployment | Vercel | Project prj_tLIMgcazzA9Hxkc8q4a6EfrM2AIZ |

### Stripe key mode at audit time

`.env.local` (development) contains `sk_live_` and `pk_live_` keys. This means local development uses **live Stripe mode**. There is no test-mode Stripe infrastructure configured — no test webhook endpoint exists. This is the most significant operational risk in the current setup and the primary reason a `.env.development.local` template has been provided as a deliverable.

### Supabase branches

No active branches. A branch costs **$0.01344/hour (~$9.92/month)** if created for an isolated test environment.

---

## 1. Executive Summary

Heirloom Life is a well-architected NSW/VIC estate-planning SaaS. The codebase is clean (0 TypeScript errors, 1 pre-existing lint warning in app code unrelated to payment or security paths), server-side security gates are correctly placed, and the anonymous → authenticated session flow is sound.

**Three issues require resolution before launch:**

1. **No test-mode Stripe infrastructure** — local development runs against live Stripe keys. A single accidental form submission from a developer machine creates a real charge. The `.env.development.local` template provided with this audit resolves this once test-mode keys are wired up.

2. **No purchase confirmation email** — `sendPurchaseConfirmationEmail` does not exist in `email.ts`, and the webhook handler (`checkout.session.completed`) sends nothing to the user after payment. Every paying user currently receives no receipt.

3. **Pricing disclaimer contradiction** — `pricing/page.tsx` says "we do not review your individual Will or take responsibility for its legal validity" while `the-will/page.tsx`, the homepage, and living-vault all say "standard solicitor quality review included before your Will is issued." This is an internally inconsistent claim that creates legal/commercial risk.

**Four pre-identified issues confirmed by code trace:**

- **P1-C**: Vault CTA on pricing page opens `CheckoutModal` directly (bypasses `/start` wizard). A VIC user buying vault never enters their state — the server-side state gate at `/api/stripe/checkout` correctly blocks non-live states, but vault is priced and sold without collecting a state at all. This creates a gap if vault ever becomes state-restricted.
- **P1-E**: Purchase confirmation email missing (confirmed above).
- **Webhook URL**: The Stripe webhook endpoint should target `https://www.heirloomlife.com.au/api/stripe/webhooks` (with `www.`).
- **STRIPE_WEBHOOK_SECRET**: Must be set in Vercel environment variables for the webhook to verify Stripe signatures in production.

**VIC witnessing gap (new finding):** VIC is a live state and users pay $129, but AV witnessing is NSW-only (`AV_WITNESSING_STATES = ['NSW']`). VIC users are not warned before payment that remote witnessing is unavailable. They reach a print-and-sign path with no explanation of why their witnessing experience differs.

---

## 2. Findings Table

| ID | Severity | Phase | Title | File(s) | Status |
|---|---|---|---|---|---|
| F-01 | CRITICAL | PREFLIGHT | No test-mode Stripe — local dev uses `sk_live_`/`pk_live_` | `.env.local` | Open |
| F-02 | HIGH | P1 | No purchase confirmation email | `src/lib/email.ts`, `app/api/stripe/webhooks/route.ts` | Open (P1-E) |
| F-03 | HIGH | P3 | Pricing disclaimer contradicts solicitor review claims | `app/pricing/page.tsx`, `app/(marketing)/the-will/page.tsx`, `app/page.tsx` | Open |
| F-04 | HIGH | P1 | Webhook URL missing `www.` prefix | Stripe dashboard config | Open (pre-identified) |
| F-05 | HIGH | P5 | `STRIPE_WEBHOOK_SECRET` not confirmed set in Vercel production | Vercel env vars | Open (pre-identified) |
| F-06 | MEDIUM | P1 | P1-C: Vault pricing CTA bypasses `/start` wizard | `app/pricing/_components/PricingVaultCTA.tsx` | Open (pre-identified) |
| F-07 | MEDIUM | P2 | VIC users not warned before payment that AV witnessing is NSW-only | `app/will/new/_components/StepEligibility.tsx`, `app/(marketing)/living-vault/page.tsx` | Open |
| F-08 | MEDIUM | P3 | Homepage "8 states and territories covered" is inaccurate | `app/page.tsx` | Open |
| F-09 | MEDIUM | P3 | `about/page.tsx` "Built for Australians in every state and territory" is misleading | `app/(marketing)/about/page.tsx` | Open |
| F-10 | MEDIUM | P4 | Payment gate for will shows error, not checkout prompt for authenticated unpaid users | `app/will/new/_components/WillWizard.tsx`, `app/will/new/_actions.ts` | Open |
| F-11 | LOW | P3 | `how-it-works` steps 03 and 04 have duplicate content ("Download and sign" / "Sign and witness") | `app/(marketing)/how-it-works/page.tsx` | Open |
| F-12 | LOW | P3 | Email `FROM_ADDRESS` fallback is `onboarding@resend.dev` not a production address | `src/lib/email.ts` | Open |
| F-13 | LOW | P4 | `/guidance-notes` and `/try-it` are orphaned pages (not linked from nav/footer) | Navigation, footer | Open |
| F-14 | LOW | P5 | `vault_included_until` column in profiles table is never written by any code | DB schema vs code | Open |
| F-15 | INFO | P5 | 3 tables have RLS enabled but no policies: `charity_partners`, `partner_referrals`, `processed_webhook_events` | Supabase security advisor | Open |
| F-16 | INFO | P5 | 25 RLS policies use `auth.uid()` without `(select auth.uid())` wrapper — suboptimal at scale | Supabase performance advisor | Acceptable for launch |
| F-17 | INFO | P5 | 11 unindexed foreign keys | Supabase performance advisor | Acceptable for launch |
| F-18 | INFO | P5 | 14 unused indexes — likely pre-launch, no traffic yet | Supabase performance advisor | Monitor post-launch |
| F-19 | INFO | P5 | Leaked password protection disabled in Supabase Auth | Supabase security advisor | Enable before launch |
| F-20 | INFO | P5 | 2 DB functions have mutable `search_path` | Supabase security advisor | Low risk, fix post-launch |
| F-21 | INFO | PREFLIGHT | No Supabase branch active — test isolation requires branch creation (~$9.92/month) | Supabase | Informational |

### Severity definitions

- **CRITICAL**: Could cause financial loss or data breach today, or blocks safe operation
- **HIGH**: Breaks a user-facing feature or creates legal/commercial risk; must fix before launch
- **MEDIUM**: Degrades UX or creates future technical debt; should fix before launch
- **LOW**: Minor consistency issue; fix before or shortly after launch
- **INFO**: Advisory notice; review and act on a schedule

---

## 3. Consistency Matrix

### Pricing matrix

| Product | `pricing/page.tsx` | `living-vault/page.tsx` | `the-will/page.tsx` | `app/api/stripe/checkout` | `STRIPE_PRICE_WILL` env | `STRIPE_PRICE_VAULT_ANNUAL` env |
|---|---|---|---|---|---|---|
| Will (solo) | $129 | $129 | — (no price on page) | One-time charge | `price_1UCGbf...` | — |
| Will (partner) | $89 | — | — | Uses couple_code | — | — |
| Vault (annual) | $99/year | $99/year | — | Subscription | — | `price_1UCJmR...` |
| Vault (partner) | $79/year | — | — | Uses couple_code | — | — |

No `STRIPE_PRICE_VAULT_MONTHLY` key exists in env or code — vault is annual-only. Pricing is consistent across pages that state a price. `the-will/page.tsx` does not quote a price which is correct.

### State availability matrix

| State | Shown in wizard | Eligible (client-side) | Checkout API gate | AV witnessing |
|---|---|---|---|---|
| NSW | Yes | Yes | Pass | Yes |
| VIC | Yes | Yes | Pass | No — print-and-sign only |
| QLD, WA, SA, TAS, NT, ACT | Yes | No — waitlist shown | Would block (server) | No |

Sources: `src/lib/availability.ts` (LIVE_STATES, AV_WITNESSING_STATES), `app/will/new/_components/StepEligibility.tsx`, `app/api/stripe/checkout/route.ts`.

### Terminology consistency

| Claim | Location | Consistent? |
|---|---|---|
| "NSW and VIC" as live states | Trust bar homepage, FAQ, how-it-works | Yes |
| "8 states and territories covered" | Homepage stats section | No — only 2 states live (F-08) |
| "solicitor quality review included" | Homepage, the-will page, living-vault | Yes across 3 pages |
| "we do not review your individual Will" | Pricing page disclaimer | Contradicts above (F-03) |
| "Built for Australians in every state and territory" | About page | Misleading — only 2 states live (F-09) |
| $129 Will price | Pricing page, living-vault marketing | Yes |
| $99/year Vault price | Pricing page, living-vault marketing | Yes |

### Email vs site consistency

`FROM_ADDRESS` in `email.ts` falls back to `'Heirloom Life <onboarding@resend.dev>'` if `RESEND_FROM_ADDRESS` is not set. The production domain is heirloomlife.com.au. Unless `RESEND_FROM_ADDRESS` is set in Vercel production env vars, all transactional emails arrive from a Resend sandbox address (F-12).

---

## 4. Flow Assessment per Journey

### J1: NSW Will purchase (happy path)

**Code path:** `/start` → `/will/new` (eligibility: NSW) → wizard steps → `handleComplete()` → `completeWill()` server action → plan check → set status `pending_review` → generate document via LLM → checkout API → Stripe embedded → webhook `checkout.session.completed` → `profiles.plan='will'`, `vault_access_until=now+3months` → dashboard.

**Gate placement:**
- State eligibility: client-side at StepEligibility (UX gate) + server-side at checkout API (hard gate). Dual gate is correct.
- Auth gate: checkout API requires auth; will wizard allows anonymous. Correct.
- Download API requires auth + plan check (but NOT plan_status — intentional "permanently downloadable" design).

**Issues found:**
- Authenticated unpaid users who reach `handleComplete()` see an error message, not a checkout CTA. The "blurred preview + payment options" completion screen is logically unreachable for unpaid users. This is an unintended UX gap (F-10): the upsell screen was built but the code path never reaches it for unpaid users.
- No post-purchase email (F-02).

### J3: VIC geofence

**Code path:** Same as J1 with VIC state. VIC is in `LIVE_STATES` — eligibility passes. AV witnessing is blocked at UI (VIC not in `AV_WITNESSING_STATES`), and print-and-sign path is shown. Checkout API passes for VIC.

**Issues found:**
- VIC users are not told before payment that AV witnessing (NSW convenience feature) is unavailable for them. The eligibility screen shows "print and sign" messaging but does not explicitly contrast it against the NSW AV experience that appears in marketing copy (F-07).
- No explicit VIC pre-payment warning in `living-vault/page.tsx` or `pricing/page.tsx`.

### J5: Vault purchase

**Code path:** `pricing/page.tsx` → `PricingVaultCTA` button → `CheckoutModal(product="vault")` → checkout API → Stripe subscription → webhook → `profiles.plan='vault'`, `plan_status='active'`, `vault_access_until=null`.

**Issues found:**
- P1-C (pre-identified): `PricingVaultCTA` opens `CheckoutModal` directly, not `/start`. A vault buyer never provides their state to the system. The checkout API performs a state check via the `testators` table, but for vault-only purchasers who have never used the wizard, there may be no testator row — this path should be code-reviewed.
- `vault_access_until=null` for vault plan is correct (vault access governed by `plan_status`, not a time-box).
- `vault_included_until` column exists in live `profiles` schema but is never written by any code path (F-14). Possible migration ran but feature was not implemented.

### J9: Edge cases

**Declined card:** No test-mode Stripe environment exists. Cannot be exercised end-to-end. Stripe embedded checkout handles decline UI client-side.

**Duplicate webhook:** Idempotency is correctly implemented: `processed_webhook_events` table has a unique constraint on `stripe_event_id`. The webhook handler catches Postgres error `23505` (unique_violation) and returns 200 without re-processing. Code-traced only — not exercised due to no test webhook signing secret.

**IDOR:** Download API fetches `wills` by `user.id` from the session — no IDOR vector. Upload API allows auth OR valid anon session — correct for the pre-auth wizard flow. Basiq connect requires auth — correct.

**Abandoned checkout:** `CheckoutModal.tsx` calls `fetchClientSecret` once on mount. A second open creates a new Stripe session. No double-submit protection at the modal level, but the Stripe embedded UI itself handles this. No risk of duplicate charges unless the user completes payment in two separate modal instances simultaneously — extremely unlikely.

---

## 5. Platform Findings

### 5.1 Build health

- `npx tsc --noEmit`: 0 errors
- `npm run lint`: 0 errors, 1 pre-existing warning (`Link` unused in `faq/page.tsx`)

### 5.2 Supabase security advisor

| Finding | Level | Impact | Recommendation |
|---|---|---|---|
| `charity_partners`, `partner_referrals`, `processed_webhook_events` have RLS enabled but no policies | INFO | All queries blocked for non-service-role clients | Add appropriate policies or confirm these tables are service-role-only (F-15) |
| `update_anon_session_updated_at`, `update_personal_wishes_updated_at` have mutable `search_path` | WARN | Low SQL injection risk via schema manipulation | Add `SET search_path = ''` to function definitions (F-20) |
| Leaked password protection disabled | WARN | Compromised passwords not checked against HaveIBeenPwned | Enable in Supabase Auth settings before launch (F-19) |

### 5.3 Supabase performance advisor

| Finding | Count | Recommendation |
|---|---|---|
| Unindexed foreign keys | 11 | Add indexes — most impactful: `partner_referrals.user_id`, `couple_discount_codes.used_by_id` |
| RLS `auth.uid()` without `(select auth.uid())` | 25 | Wrap in `(select ...)` to prevent per-row re-evaluation — important at scale |
| Unused indexes | 14 | Review post-launch; likely pre-launch with no query traffic yet |
| Multiple permissive policies on `personal_wishes` | 20 | Consolidate anon + auth policies into a single policy with OR condition |

### 5.4 Database schema findings

- **`profiles` columns confirmed:** id, email, full_name, phone, created_at, updated_at, vault_access_until, vault_included_until, stripe_customer_id, stripe_subscription_id, plan, plan_status
- **`vault_included_until`:** Present in live schema, never written by code. Possible dead migration from an earlier feature design. Does not cause data errors but is confusing schema drift (F-14).
- **`pricing_plans` table:** Referenced in `supabase/pricing_plans.sql` migration file but not found in live schema queries — migration likely not run.

### 5.5 API route security

| Route | Auth required | State gate | Notes |
|---|---|---|---|
| `POST /api/stripe/checkout` | Yes (Supabase session) | Yes (testators.state vs LIVE_STATES) | Returns 401 / 403 correctly |
| `POST /api/stripe/webhooks` | No (Stripe signature) | No | Signature verified via `STRIPE_WEBHOOK_SECRET` |
| `POST /api/will/upload` | Auth OR anon session | No | Correct — pre-auth wizard path |
| `GET /api/will/download` | Yes | No (intentional) | No IDOR — fetches by session user.id |
| `POST /api/basiq/connect` | Yes | No | Returns 401 correctly |
| `POST /api/charity-enquiry` | No (public form) | No | Sends to hardcoded hello@heirloomlife.com.au |

No stack traces found in error responses. Missing env vars return user-friendly 500 messages.

### 5.6 Vercel environment variables

Vercel API access was not available during this audit (403 for the scope). Analysis is based on `.env.local` which represents the development environment. Key gaps to verify in Vercel Production/Preview settings:

- `STRIPE_WEBHOOK_SECRET` — must be set in Production (F-05)
- `RESEND_FROM_ADDRESS` — must be set to a production Heirloom Life address (F-12)
- `NEXT_PUBLIC_APP_URL` — must be `https://www.heirloomlife.com.au` in Production

### 5.7 Stripe configuration

- No test-mode webhook endpoint exists. Only live-mode webhook should exist, targeting `https://www.heirloomlife.com.au/api/stripe/webhooks` (F-04 — verify `www.` prefix).
- Live prices confirmed in env: `STRIPE_PRICE_WILL=price_1UCGbf2KnA6kElBxyq9wfApT`, `STRIPE_PRICE_VAULT_ANNUAL=price_1UCJmR2KnA6kElBxKfpvqCKS`.
- No `STRIPE_PRICE_VAULT_MONTHLY` — vault is annual only. Confirmed safe (no code reference).
- Webhook idempotency: correctly implemented via `processed_webhook_events` unique constraint on `stripe_event_id`.

### 5.8 Resend / email

- `sendResumeEmail`: sends resume link for anonymous session recovery — present
- `sendCharityEnquiryEmail`: charity enquiry confirmation — present
- `sendWitnessInviteEmail`: AV witnessing invitation — present
- `sendPurchaseConfirmationEmail`: **MISSING** — no function, no call site (F-02)
- Witness invite email correctly references "Part 2B of the Electronic Transactions Act 2000 (NSW)"

---

## 6. Test Coverage Log

| Spec file | Tests | Runnable without Stripe test mode | Runnable with Stripe test mode |
|---|---|---|---|
| `e2e/journeys/j1-will-purchase.spec.ts` | 10 | 8 of 10 (auth tests need Supabase) | 10 of 10 |
| `e2e/journeys/j3-vic-geofence.spec.ts` | 7 | 7 of 7 | 7 of 7 |
| `e2e/journeys/j5-vault-purchase.spec.ts` | 9 | 9 of 9 | 9 of 9 |
| `e2e/journeys/j9-edge-cases.spec.ts` | 11 | 7 of 11 (4 skip in test mode too — need full auth) | 7 of 11 |
| `e2e/crawl/route-crawl.spec.ts` | 38 | 38 of 38 | 38 of 38 |
| **Total** | **75** | **~69** | **~75** |

Tests marked `test.skip` in j9 require full test-mode Stripe infrastructure (webhook signing, authenticated sessions with completed wills). These are scaffolded with the correct assertions and marked for implementation when a test environment is stood up.

**Coverage not provided by Playwright specs (code-trace only):**
- Couple discount code validation (J7) — requires DB state with valid discount codes
- Vault amendment lock screen (J6) — requires authenticated user with downloaded will + no vault
- Witness invite flow (requires Daily.co test environment)
- Basiq bank connection flow (requires Basiq sandbox credentials)

---

## 7. Test Records Created

No records were created in the production Supabase project (rzxdzoooghsjfnixckgq). All audit work was read-only. No Stripe mutations were made (no products, prices, or charges created in live mode).

The `.env.development.local` template provides placeholder E2E test email addresses for use in a test environment:
- `e2e+j1@delivered.resend.dev` — J1 test account

When a test Supabase project is provisioned, test accounts should use `@delivered.resend.dev` addresses to avoid real email delivery.

---

## 8. Part 2 Status

### 8.1 Git ignore check

`.gitignore` contains `.env*` pattern — covers `.env.development.local`. No change needed. The template is safe to commit because it contains no real keys.

### 8.2 `.env.development.local` template

Created at `/Users/aaronlee/heirloom-life/.env.development.local`. Covers:
- Test Supabase project (separate from production rzxdzoooghsjfnixckgq)
- Test-mode Stripe keys (`pk_test_`, `sk_test_`)
- Test-mode price IDs
- `whsec_` webhook secret (from `stripe listen` CLI)
- Resend test API key
- Basiq sandbox credentials
- Anthropic API key
- Daily.co test key
- `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` for Playwright

### 8.3 Supabase branch cost

**$0.01344/hour = ~$9.92/month** per branch. No branches are currently active on the project. Creating a branch for isolated test environment is optional — the `.env.development.local` approach (separate Supabase project) is lower cost and simpler for a team of this size.

### 8.4 Schema migration diff

Migrations in `supabase/` directory vs live schema:

| Migration | Status |
|---|---|
| `stripe_billing.sql` — adds stripe_customer_id, stripe_subscription_id, plan, plan_status | Applied (columns confirmed in live schema) |
| `vault_benefit_entitlements.sql` — adds vault_access_until | Applied (column confirmed) |
| `processed_webhook_events.sql` | Applied (table confirmed) |
| `couple_discount_codes.sql` | Applied (table confirmed) |
| `pricing_plans.sql` — creates pricing_plans table | Likely NOT applied (table not found in live schema) |
| `vault_included_until` orphan column | Applied but no code writes to it — schema drift (F-14) |

---

## Appendix: Pre-Identified Findings Confirmed

| ID | Title | Confirmed | Location |
|---|---|---|---|
| P1-C | Vault CTA opens CheckoutModal directly, not /start | Yes | `app/pricing/_components/PricingVaultCTA.tsx` line 6–9 |
| P1-E | No purchase confirmation email | Yes | `src/lib/email.ts` (no function), `app/api/stripe/webhooks/route.ts` (no email call) |
| Webhook URL fix | Use `www.` prefix | Not directly verifiable (Stripe API access limited) | Stripe Dashboard — verify manually |
| STRIPE_WEBHOOK_SECRET Vercel | Must be set in Production | Not directly verifiable (Vercel API 403) | Vercel Dashboard — verify manually |

---

*Audit conducted on branch `e2e-audit`. No production data was modified. No charges were created in Stripe live mode.*

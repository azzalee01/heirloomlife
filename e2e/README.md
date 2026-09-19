# Heirloom Life — E2E Test Suite

Playwright tests covering the key user journeys and a full route crawl.

---

## Prerequisites

1. **Node.js 20+** and `npm install` already run in the repo root.
2. **Playwright browsers installed:**
   ```bash
   npx playwright install chromium
   ```
3. **A running local server** (dev mode):
   ```bash
   npm run dev
   ```
4. **Test-mode environment variables** — copy `.env.development.local` from the template:
   ```bash
   cp .env.development.local.example .env.development.local
   # Fill in test-mode Stripe keys, test Supabase project, etc.
   ```
   See `.env.development.local` in the repo root for the full template.

> **CRITICAL:** These tests MUST NOT be run with live Stripe keys (`pk_live_` / `sk_live_`).
> Every spec checks `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` at startup and aborts if it finds `pk_live_`.

---

## Stripe test cards

| Card number | Outcome |
|---|---|
| `4242 4242 4242 4242` | Visa — success |
| `4000 0000 0000 0002` | Always declined |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Insufficient funds |

All test cards: expiry `12/34`, CVC `123`, any postcode.

---

## Running tests

```bash
# Run all tests (requires npm run dev running separately)
npx playwright test

# Run a specific journey
npx playwright test e2e/journeys/j1-will-purchase.spec.ts

# Run the route crawl
npx playwright test e2e/crawl/route-crawl.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run against a different environment
BASE_URL=https://your-preview-url.vercel.app npx playwright test
```

---

## Environment variables

| Variable | Purpose | Required for |
|---|---|---|
| `BASE_URL` | Target URL for tests | All tests (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Safety guard — must start with `pk_test_` | All journey tests |
| `E2E_TEST_EMAIL` | Test user email for auth flows | J1 signup/login tests |
| `E2E_TEST_PASSWORD` | Test user password | J1 signup/login tests |

---

## Spec files

### `e2e/journeys/j1-will-purchase.spec.ts`
**J1 — NSW Will purchase happy path**

Code-trace + API guard tests for the primary purchase journey. Covers:
- Homepage CTA links to `/start`
- Pricing page shows correct amounts ($129 Will, $99 Vault)
- Unauthenticated access to `/will/new` (anonymous session)
- Non-live state (WA) blocked at eligibility with waitlist link
- NSW + DOB eligibility passes
- Signup → dashboard redirect
- Login → dashboard
- Authenticated wizard access
- Checkout API 401 for unauthenticated
- Download API 401 for unauthenticated
- VIC shows print-and-sign (not AV witnessing)

**Requires for full pass:** test-mode Stripe + test Supabase project.

---

### `e2e/journeys/j3-vic-geofence.spec.ts`
**J3 — VIC geofence**

Tests that VIC is correctly treated as a live state while non-live states are blocked. Covers:
- VIC eligibility passes ("You're good to go")
- WA eligibility blocked with waitlist link
- QLD eligibility blocked
- VIC users see print-and-sign (not AV witnessing)
- NSW users see AV witnessing mention
- Checkout API 401 for unauthenticated (confirms first auth gate)
- Deep-link to wizard step does not crash

---

### `e2e/journeys/j5-vault-purchase.spec.ts`
**J5 — Vault purchase from pricing page**

Tests the Vault ($99/year) checkout flow. Covers:
- Pricing page shows $99/year and $79/year partner discount
- Vault CTA is a `<button>` (not a link to /start) — **known finding P1-C**
- Unauthenticated vault checkout → 401
- Invalid product → 400 or 401
- `/living-vault` marketing page exists and has CTAs
- Dashboard and dashboard/vault require auth → redirect to login
- Webhook endpoint rejects requests without Stripe signature
- Marketing vault page shows $129 Will and $99 Vault pricing

---

### `e2e/journeys/j9-edge-cases.spec.ts`
**J9 — Edge cases: declined card, abandoned checkout, duplicate webhook**

API-contract and boundary tests. Covers:
- Webhook rejects missing/invalid Stripe-Signature header
- Upload API 401 for unauthenticated
- Upload API 400/401 for wrong file type
- Upload API 400/401/413 for oversized file (>10MB)
- Download API 401 for unauthenticated
- Basiq connect API 401 for unauthenticated
- Charity enquiry API accepts unauthenticated requests (public form)
- `/will/new` accessible without auth

**Placeholder tests** (marked `test.skip`; require test-mode Stripe):
- Declined card (4000 0000 0000 0002)
- Abandoned checkout modal
- Duplicate webhook idempotency (requires test-mode webhook secret)
- Auth expiry during checkout

---

### `e2e/crawl/route-crawl.spec.ts`
**Route crawl**

GETs every known public URL and asserts expected status codes. Covers:
- All marketing pages (200)
- All 8 life-changes article pages (200)
- Auth pages (200)
- `/will/new` accessible without auth (200)
- Orphaned pages (`/guidance-notes`, `/try-it`) — 200 or 404
- Dashboard routes redirect to `/auth/login` when unauthenticated
- API routes return 401/400/405 for unauthenticated requests
- No console errors on key public pages

---

## Key findings this suite was written to detect

| ID | Finding | Spec | Assertion |
|---|---|---|---|
| P1-C | Vault CTA opens checkout modal directly, bypassing `/start` wizard | j5 | Button is `<button>` not `<a href="/start">` |
| P1-E | No purchase confirmation email sent | _(code trace only)_ | No `sendPurchaseConfirmationEmail` in `email.ts` |
| VIC-WIT | VIC users not warned before payment that AV witnessing is NSW-only | j1, j3 | VIC eligibility page shows print-and-sign only |
| ORPHAN | `/guidance-notes` and `/try-it` not linked from nav/footer | crawl | Pages return 200 but are unreachable via navigation |
| STATS | Homepage claims "8 states covered" — only NSW + VIC live | _(audit report)_ | Copy inconsistency — not testable in Playwright |

---

## Configuration reference

See `e2e/playwright.config.ts` for full Playwright configuration. Key defaults:
- `testDir`: `./e2e`
- `fullyParallel`: false (journey tests are stateful)
- `workers`: 1
- `reporter`: list + HTML
- No automatic dev server — caller must provide a running server

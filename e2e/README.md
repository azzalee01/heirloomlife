# Wizard E2E + safety net

## What runs where

| Check | Where | Needs |
|---|---|---|
| UI→DB contract (`db-contract.test.ts`) | `npm test`, every PR | nothing (offline) |
| Generation invariants over 384 combos (`generation-invariants.test.ts`) | `npm test` | nothing |
| needs_review gate wiring (`review-reasons.test.ts`) | `npm test` | nothing |
| Error-logging util (`wizard-errors.test.ts`) | `npm test` | nothing |
| `/api/health/wizard` dry-run | `npm run smoke` post-deploy | `WIZARD_HEALTH_SECRET` |
| Full wizard walk (this folder) | manual / nightly | setup below |

## Running the Playwright matrix (not wired by default)

1. `npm i -D @playwright/test && npx playwright install`
2. Deploy a preview on a **TEST Supabase branch** (never prod), Stripe in test mode or the
   payment step stubbed. Seed a test account with a paid plan.
3. Env: `E2E_BASE_URL`, `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`.
4. Confirm the `SELECTORS` block in `wizard.spec.ts` against the live components.
5. `npx playwright test` (smoke subset) or `E2E_FULL_MATRIX=1 npx playwright test` (nightly).

## Refreshing the DB contract after a constraint migration

`SUPABASE_DB_URL=postgres://… npm run sync:db-contract` (needs `npm i -D pg`; point at a
branch/local/read-only role). Commit the regenerated `db-contract.generated.ts`.

## Deliberately NOT covered

- **Payments** (Stripe) — stub or test-mode only.
- **Remote AV witnessing** — separate flow.
- **Real email delivery** — the abandonment cron is exercised in dry-run; actual sends
  are not asserted.
- The authenticated wizard **walk** and the **DB-level** section-4 assertions
  (clause status = `production`, `minor_vesting_age` matches the Will text, needs_review
  flags) run only in Playwright against the test branch, not in the offline suite.
- The cron dry-run needs a `?dryRun=1` guard added to `/api/cron/will-abandonment` (TODO)
  so the smoke can ping it without sending email.

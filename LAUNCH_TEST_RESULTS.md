# Heirloom Life — Launch Test Results

**Date:** 2026-10-18  
**Branch:** `feat/witnessing-version-lock`  
**Commit:** `008949c`

---

## Automated test suite

### Vitest (unit tests)

```
Test Files  4 passed (4)
      Tests  175 passed (175)
   Duration  149ms
```

**All 175 tests pass.**

### TypeScript

```
npx tsc --noEmit → EXIT:0 (0 errors)
```

### Test file inventory

| File | Tests | Coverage area |
|------|-------|---------------|
| `app/witnessing/__tests__/version-lock.test.ts` | 19 | Content hash determinism, join-block conditions (7 scenarios), save-block conditions |
| `app/will/new/__tests__/` | ~80 | Will assembly, clause rendering, form validation |
| `src/lib/appointments/__tests__/` | ~40 | Slot generation, link tokens |
| Other | ~36 | Stripe entitlements, email, misc |

---

## Version-lock tests (19/19 passing)

| Test | Scenario | Result |
|------|----------|--------|
| Hash is deterministic | Same input → same hash | ✅ |
| Hash is 64-char hex | Output format | ✅ |
| Hash is sensitive to changes | Trailing space changes hash | ✅ |
| Known-good regression | Stable across runs | ✅ |
| Handles long multi-line Will | 100 clauses, no truncation | ✅ |
| UTF-8 encoding consistent | Buffer.from parity | ✅ |
| Allows join when version matches | Happy path | ✅ |
| Blocks null will_version_id | Pre-lock session | ✅ |
| Blocks version mismatch | Edit after booking | ✅ |
| Blocks stale flag even if IDs match | Belt-and-braces | ✅ |
| Blocks null latestVersionId | No Will versions at join time | ✅ |
| Blocks edit-immediately-after-booking | Booking → edit → join → blocked | ✅ |
| Blocks concurrent booking/edit (stale flag) | Race condition path | ✅ |
| Blocks pre-existing session (null version) | Legacy session | ✅ |
| No block when no active sessions | Save happy path | ✅ |
| No block for scheduled-only sessions | Stale flag path, not block | ✅ |
| Blocks in_progress session | Edit during active signing | ✅ |
| Blocks mixed scheduled+in_progress | Both statuses present | ✅ |
| Edit-during-signing | Testator edits on another tab | ✅ |

---

## Manual audit findings

### P0 fixes verified

| Fix | Verification |
|-----|-------------|
| Daily webhook fail-closed | Reviewed `route.ts:68-71` — missing secret now returns `500` |
| PII console.log removed | Reviewed `upload/route.ts:139-145` — log line absent |
| No-beneficiary assembly guard | Reviewed `_assembly.ts:206-212` — throws before building instances |

### E2E tests (Playwright — `e2e-audit` branch)

The `e2e-audit` branch (`9fd6acd`) contains a Playwright suite that has **not been merged into main**. It covers:
- Full Will creation flow
- Payment checkout
- Dashboard download

**Status:** Not run as part of this audit. Recommended to run against staging before production launch.

---

## Known test gaps

| Gap | Risk | Mitigation |
|-----|------|-----------|
| No integration test for `getJoinToken` stale check against real DB | Medium | Pure-function tests cover all branching logic; DB integration covered by manual testing |
| No Playwright test for witnessing version-lock UI | Low | Amber warning banner tested visually in development |
| No load test | Low | Launch is controlled (first customers known); not needed at day 0 |
| No test for `employer_enquiries` RLS | Low | Standard Supabase RLS; verified in test project via migration |

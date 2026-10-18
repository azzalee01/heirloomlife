# Heirloom Life — First Customers Plan

**Date:** 2026-10-18  
**Goal:** First 10 paying customers, primarily AV witnessing, NSW

---

## Readiness gate

Before any customer is invited:

1. `feat/witnessing-version-lock` merged into `main`
2. Pending DB migrations applied to production
3. All Vercel env vars confirmed
4. Aaron completes the full flow himself (draft → pay → witness → executed Will)
5. At least one dry-run witnessing session with a friend/family as testator

---

## Target customer profile (first 10)

- NSW residents (jurisdiction supported)
- Single, married, or de facto (no complex structures)
- Simple Will: spouse/partner + children as beneficiaries
- No business succession, no foreign assets, no testamentary trusts
- Comfortable with video call

These customers will NOT trigger escalation clauses. Keep the first cohort clean.

---

## Acquisition channels

| Channel | Action |
|---------|--------|
| Personal network | Direct outreach — 5–10 people Aaron knows who need a Will |
| LinkedIn | One post framing "I built this for my own family" — no paid ads yet |
| Life event pages | `/just-married`, `/new-baby`, `/new-home` are live and indexable |
| Organic SEO | IndexNow endpoint pings search engines on deploy — no further action needed |

**Do not run paid ads** until 10 organic customers have completed the full flow and confirmed quality.

---

## Onboarding flow

1. Customer arrives → lands on homepage or life-event page
2. Clicks "Start your Will" → directed to `/will/new`
3. Completes multi-step form (~15 min)
4. Pays $149 → redirected to dashboard
5. Downloads draft Will (`.txt`) to review
6. Books witnessing session via `/witnessing`
7. Session: Aaron hosts a 30-min Daily.co call; customer signs on camera with 2 witnesses
8. Aaron countersigns + uploads executed Will
9. Customer downloads executed Will from dashboard

**For print-and-sign customers (no video):** same flow, skip step 6–8. Customer prints, signs with 2 witnesses, scans and uploads via `/dashboard/will/witnessing?appt=...`.

---

## What to watch for

| Signal | Action |
|--------|--------|
| Customer abandons at beneficiaries step | May hit the "no active beneficiaries" guard — check error display |
| Customer edits Will after booking witnessing | Version-lock amber warning shown — contact them before session |
| Witnessing session join blocked | Check `version_stale` flag — may need to rebook |
| Amendment submitted | Appears in `/admin/wills` — review within 24h |
| Escalation trigger in Will | `needs_review = true` appears in will_versions — do NOT approve without solicitor review |

---

## Pricing reminder

- Will: AUD $149 (incl. GST)
- Annual updates add-on: AUD $25/yr (optional, at checkout)
- Re-witnessing credit: available separately
- B2B employer bulk: AUD $129/Will (via `/for-employers` enquiry — not self-serve at launch)

**Do not offer discounts** to first customers unless explicitly decided — it sets pricing expectations.

---

## Support SLA (first cohort)

- Response time: same business day (Aaron handling personally)
- Escalation (legal questions): acknowledge same day, route to solicitor within 48h
- Executed Will delivery: within 24h of witnessing session

---

## Success metrics for first 10 customers

| Metric | Target |
|--------|--------|
| Will completion rate (paid → executed Will) | ≥ 80% |
| Witnessing session no-shows | ≤ 1 |
| Customer support tickets per Will | < 1 |
| NPS (optional post-session survey) | ≥ 8/10 |
| Time from sign-up to executed Will | < 7 days |

---

## What NOT to do yet

- No B2B / employer deals until direct channel is validated
- No couples Wills (mirror Wills) — product only supports single testator
- No interstate customers (NSW only for now)
- No complex Wills (business, trusts, foreign assets) — decline politely, refer to solicitor
- No paid advertising
- Do not market witnessing as "the easy way out" — position as genuine legal execution, not a shortcut

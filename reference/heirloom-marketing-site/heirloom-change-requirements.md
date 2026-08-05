# Heirloom Life — Change Requirements
Derived from the Safewill scrape verification. Organized as build-ready items: what changes, where, and what's blocking it.

---

## A. WEBSITE — Information Architecture changes

| # | Change | Priority | Blocked by |
|---|---|---|---|
| A1 | Add **Guidance Notes** page — formal plain-language legal reference, distinct from FAQ | Pre-launch | Needs counsel drafting, not marketing copy |
| A2 | Add **Complaints Handling Policy** page | Pre-launch | None — can draft now, standard structure (overview, how to lodge, response timeframes, escalation) |
| A3 | Decide: **Financial Services Guide** page — only if Heirloom conducts AFS-licensed activity | Pre-launch decision | Needs counsel confirmation |
| A4 | Decide: **Power of Attorney** as a page/product — standalone, Living Vault feature, or explicitly out of scope | Pre-launch decision | Product scope call, not content |
| A5 | Add **Sitemap** page | Post-launch, low effort | None |

**Not adding:** For Charities page (not aligned to current product/audience — revisit if charitable bequests become a Living Vault feature).

---

## B. WEBSITE — Page copy changes (by page)

### B1. Home
- Rewrite hero and section copy to lead with the **two-layer distinction** (instant dashboard vs. compliant execution) — this is the single clearest differentiator against Safewill's document-only model and should be the first thing stated, not buried.
- Add a stated, specific SLA for Lane 2 and Lane 3 turnaround (see D1) — vague "same-day" language undersells against Safewill's explicit "3 business days / 1 day expedited" claim.

### B2. The Will
- Add a section explicitly covering **what happens after signing** — bridges into Living Vault. Safewill's flow ends at delivery; yours shouldn't read like it does either.
- Add a witnessing section stating your process plainly, positioned as closing the gap Safewill leaves open (customer handles their own witnesses after receiving the document).

### B3. Living Vault
- Section headings drafted in prior content plan: readiness score, Memorandum of Wishes, three-lane system, included lawyer review. Ready for copywriting now — no blockers.

### B4. How It Works
- Add explicit, stated SLAs per lane (see D1).
- Add a state-specific execution callout (NSW vs. VIC) — Safewill has no equivalent state-by-state clarity on their how-it-works page; this is a differentiation opportunity, not just a compliance requirement.

### B5. Pricing
- **Blocked entirely** until pricing structure is set. When ready: match Safewill's transparency pattern — fixed figure, GST-inclusive, any recurring fee stated as an explicit dollar amount, not a vague tier name.

### B6. For Advisers
- **Blocked entirely** until referral/commission structure is set. When ready: lead with the adviser's problem, not Heirloom's features (see prior plan).

### B7. Security & Trust
- Copy needs sign-off against what's actually true today — engineering to confirm exact encryption-at-rest/in-transit implementation, and confirm no certification (e.g. ISO 27001) is claimed unless actually held. Safewill states ISO 27001 explicitly; do not mirror that claim without an actual certification.

### B8. FAQ
- Structure around real objections (list in prior plan) rather than generic Q&A.

---

## C. WEBSITE — Learn / content production

Three-pillar plan from prior document stands as the production brief:
- **Pillar 1** — legal fundamentals (curated subset of Safewill's Cluster B topics, Australian-law-specific, NSW/VIC-first)
- **Pillar 2** — life-stage/readiness content (Cluster C topics, reframed to identity-alignment, not fear)
- **Pillar 3** — NSW/VIC execution specifics (unique to you, no direct competitor equivalent found in the scrape)

**Explicitly excluded from the content calendar:** funeral logistics, grief support, memorialisation, obituary/eulogy writing — Safewill's largest content cluster by volume, and the direct death-forward framing your positioning rejects. Do not staff or budget for this cluster.

---

## D. PLATFORM — functional changes

| # | Change | Priority | Component/area (best guess from known repo structure) |
|---|---|---|---|
| D1 | **State explicit SLA commitments** for Lane 2 (same-day AI draft + AV witnessing) and Lane 3 (solicitor review) — needs an actual day-bound number, not "same-day"/"complex changes reviewed." This has to be a real operational commitment before it's a marketing claim. | High — blocks B1/B4 copy | Dashboard update-flow components; likely a config value alongside `jurisdictions.ts` rather than hardcoded copy, so both product UI and marketing site pull from one source of truth |
| D2 | Decide and, if scoped in, build **Power of Attorney** as a Living Vault module (enduring guardianship, medical decisions) — currently no equivalent in the 13-table schema or three-lane system | Decision first, engineering after | New schema/table if scoped in |
| D3 | Confirm actual security implementation (encryption at rest/in transit, access controls) matches what B7 copy will claim — engineering to provide a factual list before copy is written, not after | Pre-launch | Supabase config, auth layer |
| D4 | If Guidance Notes (A1) references live product mechanics (e.g. how Lane 1 vs Lane 2 is triggered), that logic needs to be documented accurately from the actual codebase, not drafted independently by marketing | Pre-launch | Three-lane system logic |

---

## E. Decisions blocking multiple items (resolve these first)

1. **Pricing structure** — blocks B5, partially blocks B1/B4 messaging
2. **Adviser/referral structure** — blocks B6
3. **Power of Attorney scope** (A4/D2) — blocks nothing immediately, but the longer it's undecided, the more content and platform work has to be redone if you scope it in later
4. **Counsel confirmation on Financial Services Guide** (A3) — blocks nothing on critical path, but needs an answer before launch checklist closes
5. **Actual SLA numbers for Lane 2/3** (D1) — blocks strongest differentiation copy on Home and How It Works; this is the highest-leverage item to resolve first since it's pure operational decision-making, no legal review needed

---

## F. Suggested sequencing

1. Resolve D1 (SLA numbers) and A2 (Complaints Handling Policy draft) — no external dependency, unblocks the most copy
2. Get counsel moving on A1 (Guidance Notes) and A3 (FSG applicability) in parallel — these have lead time
3. Decide A4/D2 (Power of Attorney scope) — affects both IA and schema, cheaper to decide now than retrofit
4. Once pricing and adviser structure land, B5/B6 unblock
5. Engineering confirms D3 before B7 copy is finalized
6. Content production (Section C) can start immediately — it has no dependency on any of the above

This is ready to hand to Claude Code as an implementation backlog once you've made the calls in Section E — happy to turn any single row into a full build prompt.

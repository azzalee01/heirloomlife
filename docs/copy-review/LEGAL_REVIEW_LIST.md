# Legal Review List

Items requiring founder or legal-practitioner sign-off before copy is finalised.
Generated: 2026-09-21 · Branch: copy/site-accuracy-sweep (LR-01–LR-05) / copy/trust-sweep (LR-06+)

---

## LR-01 — Executor access: remaining references

**Status:** Partially fixed on copy/site-accuracy-sweep. Requires founder decision on full resolution.

**Background:** The security page (`security-trust/page.tsx`) correctly states executor access is on the build roadmap. Three locations previously described it as a live, operational feature. Two have been removed on this branch; one requires legal framing decision:

**Removed on this branch:**
- `app/(marketing)/about/page.tsx:39` — "verified path from death certificate to access" sentence removed
- `app/(marketing)/faq/page.tsx:35` — executor access claim replaced with roadmap language (reusing security-page wording verbatim)
- `app/page.tsx:107` — "executor-ready" label replaced with "securely stored"

**Requires founder review before adding executor access back to any marketing page:**
- The FAQ answer for "What happens to my Will if I die?" now says: *"Your Will is stored in your Vault. Executor access to the Vault is on our build roadmap — we will publish details of the process before it is released."* — confirm this is the correct holding copy, or supply replacement wording.
- When executor access is built and launched, all three locations will need updating with accurate, legally reviewed copy.

---

## LR-02 — Vault partner pricing: dollar amount unknown

**Status:** Partially fixed on copy/site-accuracy-sweep. Partner rate confirmed at $89 for the Will tier; Vault rate not yet specified.

**Background:** Vault moved from $99/yr (retired) to $12/month billed annually. Pricing page shows `$89` for Will partner discount. Vault tier shows "Partner discount available" without a dollar amount.

**Requires founder confirmation:**
- What is the correct Vault partner discount price at $12/month billing? Once confirmed, update `app/pricing/page.tsx` (partner discount line under the Living Vault tier).

---

## LR-03 — Charity stats: JBWere verification

**Status:** Updated on copy/trust-sweep. Flagging for record.

**Previous figures (removed):** "1 in 12", "$2.5B+", "200x" — sourced from FIA and Philanthropy Australia, unverified.

**New figures (applied):** ~6.5% of Australian Wills include a gift to charity; ~$1.3B estimated annual charitable bequests. Source: JBWere Bequest Report, 2024.

**Verification note:** JBWere PDF could not be downloaded (URL returned HTML). Figures cross-verified from a 2024 Treasury speech by the Minister for Financial Services explicitly citing JBWere Bequest Report 2024. Third figure (1% of inheritances) could not be confirmed from accessible sources and was dropped per instruction.

**Action required (founder):** Confirm the JBWere PDF is accessible and the two published figures are accurate. If 1% figure is confirmed from the PDF, it may be added as a third stat.

---

## LR-04 — SafeWill competitor pricing: verified 2026-09-21

**Status:** Updated on copy/trust-sweep. SafeWill standard price confirmed at $160 (founder confirmation). Promotion noted.

**Evidence logged:** see `docs/competitor-evidence.md`.

---

## LR-05 — Stripe VAULT_ANNUAL price ID

**Status:** Resolved. Founder confirmed annual membership is $99/year. Stripe price object "Living Vault Annual AUD" verified at unit_amount 9900 ($99 AUD). All copy updated to $99/year.

---

## LR-06 — Terms of Service: stale product name updated

**Status:** Applied. "The $99 Heirloom Membership" → "The $99/year annual membership". Price ($99) was already correct; only the product name was stale.

---

## LR-07 — Statutory references removed from witnessing copy

**Status:** Removed on copy/trust-sweep. Original wording logged here for record.

**Removed from `app/witnessing/page.tsx:129–130`:**
> "Schedule a remote witnessing session for signing your will over audio-visual link, in line with Part 2B of the Electronic Transactions Act 2000 (NSW). Your witness must see you sign in real time."

**Replaced with:**
> "Schedule a remote witnessing session for signing your Will over audio-visual link. Your witness must see you sign in real time."

**Removed from `app/witnessing/page.tsx:58`:**
> "Remote AV witnessing is currently available for NSW addresses only, consistent with NSW's statutory AV witnessing scheme."

**Replaced with:**
> "Remote AV witnessing is currently available for NSW addresses only."

**Note:** The underlying compliance code (NSW gate, 2-witness enforcement, real-time requirement) is unchanged in `_actions.ts`. These were copy-only changes.

---

## LR-08 — ScheduleSessionForm witnessing requirement callout

**Status:** Changed on copy/trust-sweep. Original wording logged here per instruction.

**Location:** `app/witnessing/_components/ScheduleSessionForm.tsx:88`

**Original wording:**
> "NSW law requires a minimum of 2 witnesses for a will signing."

**Changed to:**
> "You'll need two independent witnesses on the call."

**Action required (founder):** Confirm the new wording is acceptable, or supply preferred alternative if the original's legal attribution is preferred.

---

## LR-09 — Pricing page: Will "included in the first year"

**Status:** Fixed. Changed to "Your Will included throughout membership".

---

## LR-10 — Bespoke solicitor review price ~$150

**Status:** Not yet changed. Flagging for founder verification.

**Locations:**
- `app/will/new/_components/TriageFlag.tsx:10` — "for around $150"
- `app/dashboard/notifications/page.tsx:119` — "Request solicitor review  -  ~$150"

**Issue:** The ~$150 figure for bespoke partner lawyer review appears in two user-facing locations. Is $150 still the current price for the bespoke engagement via partner lawyers?

**Action required (founder):** Confirm whether $150 is correct, and whether to continue showing a price estimate in these locations or remove the price entirely.

---

## LR-11 — Annual membership price confirmed

**Status:** Resolved. Founder confirmed $99/year. All copy updated. Stripe object verified at $99 AUD/year.

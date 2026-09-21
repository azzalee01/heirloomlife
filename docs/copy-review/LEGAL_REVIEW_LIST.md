# Legal Review List

Items requiring founder or legal-practitioner sign-off before copy is finalised.
Generated: 2026-09-21 · Branch: copy/site-accuracy-sweep

---

## LR-01 — Executor access: remaining references

**Status:** Partially fixed on this branch. Requires founder decision on full resolution.

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

**Status:** Partially fixed on this branch. Partner rate not specified in locked facts.

**Background:** Vault moved from $99/yr (retired) to $12/month billed annually. The previous partner discount was $79/year on the $99/yr plan.

**Changed on this branch:**
- `app/pricing/page.tsx` — partner discount line changed from "$79/year when your partner shares their link with you" to "Partner discount available when your partner shares their link with you" (dollar amount removed pending confirmation).

**Requires founder confirmation:**
- What is the correct Vault partner discount price at $12/month billing? Once confirmed, update `app/pricing/page.tsx` (partner discount line under the Living Vault tier).

---

## LR-03 — Charity stats: source citation

**Status:** Unverified on this branch. Figures appear in code but source is not cited on the page.

**Location:** `app/(marketing)/for-charities/page.tsx:16–18`

**Figures:** "1 in 12", "$2.5B+", "200x"

**Action required:** Confirm figures against JBWere Australian Bequest Research Report 2024 (URL on file). Add a citation line to the charity page once confirmed. The JBWere PDF could not be parsed during the Stage 1 sweep (no `pdfplumber` installed).

---

## LR-04 — SafeWill competitor pricing: unverified

**Status:** Cells left unchanged. Live verification was not possible (SafeWill HTML minified/unreadable).

**Location:** `app/(marketing)/why-heirloom/page.tsx` — SafeWill column

**Cells to verify against live safewill.com:**
- Upfront price: table shows `$160` — verify
- Ongoing cost: table shows `$15/yr` — verify
- Solicitor review: table shows `Standard, included` — verify

If SafeWill pricing has changed, update the relevant ROWS entries. The table footnote correctly uses `—` for unconfirmed features, but explicitly stated prices should be accurate.

---

## LR-05 — Stripe VAULT_ANNUAL price ID

**Status:** Out of scope for copy branch. Flagging for founder.

**Background:** `src/lib/stripe.ts:18` references `process.env.STRIPE_PRICE_VAULT_ANNUAL`. If the Vault has moved to $12/month billing, the Stripe product and price ID may need updating in the Stripe dashboard and in `.env.local` (production) to match. The copy has been updated to show $12/month; the underlying Stripe checkout must match or users will be charged the old rate.

**Action required (founder):** Confirm `STRIPE_PRICE_VAULT_ANNUAL` points to the correct $12/month annual price ID in the Stripe dashboard. This is a billing-critical check — do not enable Vault checkout until confirmed.

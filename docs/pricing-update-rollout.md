# Pricing change: $129 Will + optional $25/yr unlimited updates

Branch: `feat/pricing-updates-addon` (local, uncommitted). Written 2026-09-25.

## The model

| | |
|---|---|
| **The Will** | A$129 one-off, GST inclusive. Complete Will, standard solicitor quality review, permanent download, guided signing. One remote (AV) signing session included for NSW addresses; print-and-sign elsewhere. |
| **Unlimited updates** | A$25/year, GST inclusive, optional. Offered **unticked** at checkout with the Will (charged then: A$154 total), or later from the dashboard. Renews yearly until cancelled. Change the Will as often as needed and download each version. |
| **Coming soon** | Video re-witnessing of an updated Will. Until then updates are printed and signed. Not sold, not promised. |
| **Partner discount** | Will only: A$40 off (A$89). Never on the add-on. |
| **Lapse** | Lapsed updates keep view + download of the Will and all versions. Editing needs reactivation at A$25. No unlock fee. |
| **Estate Assistant (AI amendments)** | Behind unlimited updates (per-use AI cost). |

## Before merging: sync with GitHub

My sandbox could not fetch, and no local branch contains the live "$12/month" copy, so this clone is behind
GitHub (probably web-editor commits). Run `git fetch origin && git rebase origin/main` on this branch first.
Expect conflicts in any file that was also edited on GitHub. `components/marketing/LifeStageSnake.tsx` has
your own uncommitted work: do not `git add -A`; add only the files listed at the bottom.

## Rollout order

1. **Database, additive** (safe any time): run `supabase/updates_addon_entitlements.sql`.
2. **Stripe, test mode first**
   - Price for the Will: one-time A$129, tax behaviour inclusive -> `STRIPE_PRICE_WILL` (check it already is).
   - New product "Unlimited updates": recurring A$25 / year, tax behaviour inclusive -> `STRIPE_PRICE_UPDATES_ANNUAL`.
   - `STRIPE_COUPON_WILL_PARTNER`: A$40 off, **restricted to the Will product** (`applies_to.products`). Unrestricted, it would also discount the add-on line when both are bought together.
   - Delete `STRIPE_COUPON_VAULT_PARTNER` and stop using `STRIPE_PRICE_VAULT_ANNUAL` (after deploy).
   - Settings > Billing: turn on renewal reminder emails (we promise "we will remind you"), and configure the Customer portal with **subscription cancellation enabled** (the new `/api/stripe/portal` route needs a default portal configuration).
   - Webhook events needed (unchanged): `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
3. **Vercel env**: add `STRIPE_PRICE_UPDATES_ANNUAL`; keep `STRIPE_PRICE_WILL`.
4. **Deploy the code.**
5. **Database, security**: run `supabase/security_lockdown_server_columns.sql` PART B (PART A can go now; PART B needs the new code live: it removes user write access to plan, status and download columns, and the new code no longer writes them as the user). Then smoke test: sign up, start a Will, complete a step, unlock, download.
6. **Stripe test-mode end-to-end**: Will only; Will + add-on; add-on later from the dashboard; partner code on Will only; cancel via portal (Will and download must still work); failed renewal (`invoice.payment_failed` -> access continues until period end); refund handling (no `charge.refunded` handler yet: manual).
7. Go live in Stripe live mode with the same objects.

## Marketing copy to apply after the rebase

Canonical strings (use `src/lib/pricing.ts` constants where the page is a component):

- Will: "$129 one payment, includes GST"
- Add-on: "Unlimited updates, $25/year (optional)"
- Coming soon: "Video re-witnessing of updated Wills: coming soon"

After rebasing, find every occurrence with:
`grep -rnE '\$99|\$12|12/month|per month|billed annually|three months|3 months|three-month|Vault benefits|membership|Membership' app`
Every "$99/year", "$12/month billed annually", "annual membership", "3 months of Vault" becomes the add-on wording above.
Do not add claims about unlimited re-witnessing, and leave the solicitor-review wording as agreed separately.

| Page | Replace with |
|---|---|
| `app/pricing/page.tsx` hero | "Free to start. Draft your whole Will at your own pace, then pay $129 to download and sign it. Add unlimited updates for $25/year if you want to keep it current as life changes." |
| pricing: Will card | Remove "3 months Living Vault membership included". Add "One remote signing session included (NSW)". |
| pricing: second card | Title "Unlimited updates", "$25 / year, optional". Bullets: change your Will as often as life changes; add or remove beneficiaries, gifts and executors; download every new version; cancel any time. Note: "Video re-witnessing of updated Wills: coming soon." CTA: "Start your Will" (remove `PricingVaultCTA`'s "$99/year" text). |
| `app/page.tsx` "Membership" section | Eyebrow "Pricing". Sub: "Pay $129 once for your Will. Add unlimited updates for $25 a year to keep it current as life changes. No other fees." |
| `app/(marketing)/faq/page.tsx` | Q "Can I update my Will after signing it?" A "Yes. Add unlimited updates for $25 a year, when you buy your Will or any time after. Every changed Will must be signed and witnessed again. Video re-witnessing of updated Wills is coming soon; until then you print and sign updates."<br>Q "Do I have to subscribe?" A "No. The Will is a one-off $129 and it is yours to keep and download. Unlimited updates ($25/year, optional) only matters if you want to change your Will later."<br>Q "What is the Living Vault?" A "Living Vault is where your Will, assets and people live, from the day you buy your Will. Unlimited updates keeps your Will current as life changes." |
| `living-vault/page.tsx` | Hero: "Your Will is in your Vault from day one. Add unlimited updates for $25 a year to change it as life changes." CTA "Compare pricing" -> /pricing. |
| `life-changes/[slug]/page.tsx` CTA | "Pay $129 once for your Will. Add unlimited updates for $25 a year to keep it current as life changes." |
| `why-heirloom/page.tsx` price cell | `['$25', 'per year, optional']` (check the row label reads "yearly cost" or adjust) |
| Terms s9 | see below |

### Terms s9 (draft for your legal read)

> **9. Prices, subscriptions and cancellation**
> Prices, billing periods and included features are shown before purchase and are in Australian dollars, including GST, unless stated otherwise. Payments are processed by Stripe.
> The Will is a one-off payment of $129. It includes your completed Will, permanent access to download it, guided signing and, for NSW addresses, one remote witnessing session. You keep and can download your Will whether or not you buy anything else.
> Unlimited updates is an optional add-on at $25 per year. You can add it when you buy your Will or later. While it is active you can change your Will as many times as you need and download each new version. It renews automatically each year at the price then shown until you cancel, and we will remind you before each renewal. You can cancel at any time from your dashboard. Cancelling stops future renewals, your access continues to the end of the paid period, and you keep your completed Will and its versions.
> Remote witnessing of an updated Will is not yet available. Features described as coming soon are not part of the service until we make them available.
> Nothing in these terms excludes rights or remedies that cannot lawfully be excluded, including under the Australian Consumer Law. Any refund policy is subject to those rights. Contact hello@heirloomlife.com.au about billing, cancellation or a service that was not supplied as promised.

## Files on this branch (add these, not `-A`)

Code: `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhooks/route.ts`, `app/api/stripe/portal/route.ts` (new),
`app/dashboard/_actions.ts`, `app/dashboard/page.tsx`, `app/dashboard/vault/page.tsx`,
`app/dashboard/_components/{AiChat,PlanCTA,ManageUpdatesButton}.tsx`,
`app/dashboard/will/_actions.ts`, `app/dashboard/will/_components/{DownloadWillButton,UnlockWillBanner}.tsx`,
`app/start/page.tsx`, `app/will/new/{_actions.ts,page.tsx}`, `app/will/new/_components/WillWizard.tsx`,
`app/witnessing/{_actions.ts,page.tsx}`, `components/CheckoutModal.tsx`, `components/checkout/WillOffer.tsx` (new),
`src/lib/{email,entitlements,stripe,pricing}.ts`, `src/lib/entitlements.test.mjs` (new).
SQL: `supabase/updates_addon_entitlements.sql`, `supabase/security_lockdown_server_columns.sql`. Docs: this file.

## Open items

- Follow-up security audit of other user-writable tables (`witnessing_sessions`, `bank connections`, etc.) and of `wills.needs_review*` / `triage_flags`, which the wizard still writes as the user.
- Webhook has no `charge.refunded` handling.
- `supabase/pricing_plans.sql` is dead (no such table in production, nothing reads it); delete or update.
- Production `wills.document_text` was missing; the lockdown migration adds it.

/**
 * J5: Vault Purchase Tests
 *
 * Tests the Heirloom Vault ($99/year) checkout flow from the pricing page.
 *
 * Key findings from code trace:
 * - P1-C (pre-identified): PricingVaultCTA on pricing page opens CheckoutModal directly,
 *   bypassing the /start wizard. This is documented as a known issue.
 * - Vault is a Stripe subscription (annual), not a one-time charge.
 * - Post-purchase: profile.plan='vault', plan_status='active', vault_access_until=null
 *   (vault access governed by subscription status, not a time-box).
 * - hasVaultBenefits() returns true when plan='vault' && plan_status IN ('active','trialing').
 * - Dashboard vault page shows "Benefits period ended" when !benefitsActive.
 *
 * Code paths traced:
 * - app/pricing/_components/PricingVaultCTA.tsx → CheckoutModal (product="vault")
 * - app/api/stripe/checkout/route.ts → validates auth, state (live), then creates session
 * - app/api/stripe/webhooks/route.ts → checkout.session.completed sets plan='vault'
 * - src/lib/entitlements.ts → hasVaultBenefits()
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

test.beforeAll(async () => {
  if (PUBLISHABLE_KEY.startsWith('pk_live_')) {
    throw new Error('[SAFETY] Live Stripe keys detected. Aborting J5 tests.')
  }
})

test.describe('J5: Vault purchase from pricing page', () => {
  test('pricing page shows Vault at $99/year', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)

    await expect(page.locator('text=$99')).toBeVisible()
    await expect(page.locator('text=/per year/i')).toBeVisible()
  })

  test('pricing page shows partner/couple discount at $79/year for vault', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)

    await expect(page.locator('text=$79')).toBeVisible()
    // The $79 should be labeled as a partner discount
    await expect(page.locator('text=/partner/i').first()).toBeVisible()
  })

  test('vault CTA on pricing page is present (P1-C: opens modal not /start)', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)

    // The PricingVaultCTA button opens CheckoutModal directly — known finding P1-C
    const vaultCTA = page.locator('button').filter({ hasText: /Join Heirloom|99\/year/i }).first()
    await expect(vaultCTA).toBeVisible()

    // Note: clicking this for an unauthenticated user will trigger CheckoutModal,
    // which will then fail at the API (401) and redirect to /auth/signup.
    // We assert the button exists and is clickable (not a link to /start).
    const tagName = await vaultCTA.evaluate(el => el.tagName.toLowerCase())
    expect(tagName).toBe('button') // NOT an anchor tag — direct modal trigger
  })

  test('unauthenticated vault checkout returns 401 from API', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/stripe/checkout`, {
      data: { product: 'vault', embedded: true },
    })
    expect(resp.status()).toBe(401)
    const body = await resp.json() as { error: string }
    expect(body.error).toMatch(/unauthorized/i)
  })

  test('vault checkout API rejects invalid/missing product', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/stripe/checkout`, {
      data: { product: 'unknown', embedded: true },
    })
    // 401 (no auth) or 400 (bad product)
    expect([400, 401]).toContain(resp.status())
  })

  test('living-vault marketing page links to /pricing#living-vault or /start', async ({ page }) => {
    await page.goto(`${BASE_URL}/living-vault`)
    await expect(page).not.toHaveURL(/404/)

    // The page should exist and have vault CTAs
    const cta = page.locator('a[href*="/start"], a[href*="/pricing"], a[href*="/dashboard"]').first()
    await expect(cta).toBeVisible({ timeout: 10_000 })
  })

  test('dashboard vault page requires auth — unauthenticated redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/vault`)
    // Should redirect to login
    await page.waitForURL(/\/auth\/login|\/auth\/signup/, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/auth\/(login|signup)/)
  })

  test('dashboard page requires auth — unauthenticated redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForURL(/\/auth\/login|\/auth\/signup/, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/auth\/(login|signup)/)
  })

  test('webhook endpoint rejects requests without Stripe signature', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/stripe/webhooks`, {
      data: '{"type":"checkout.session.completed"}',
      headers: { 'Content-Type': 'application/json' },
    })
    // Should reject: 400 (bad webhook signature) — NOT 200 or 500
    expect([400, 401]).toContain(resp.status())
  })

  test('vault page (marketing) shows $129 Will and $99 Vault pricing', async ({ page }) => {
    await page.goto(`${BASE_URL}/living-vault`)
    await expect(page.locator('text=/\\$129/i').first()).toBeVisible()
    await expect(page.locator('text=/\\$99/i').first()).toBeVisible()
  })
})

/**
 * J5 Supplementary: Vault entitlement logic (code-trace, not live)
 *
 * hasVaultBenefits() returns true when:
 *   - plan='vault' AND plan_status IN ('active','trialing')
 *   - plan='will' AND plan_status='active' AND vault_access_until IS NOT NULL AND future
 *
 * Post vault purchase (from webhook):
 *   - plan='vault', plan_status='active', vault_access_until=null
 *
 * "Benefits period ended" shown when !hasVaultBenefits() — i.e.:
 *   - plan='vault' but plan_status='canceled'/'past_due' etc.
 *
 * Will purchaser gets 3 months vault included (vault_access_until = now + 3 months).
 * vault_included_until column exists in live schema but is NEVER written by code — schema drift.
 */

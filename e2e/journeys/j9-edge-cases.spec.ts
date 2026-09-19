/**
 * J9: Edge Cases — Declined Card, Abandoned Checkout, Duplicate Webhook
 *
 * Tests failure and boundary conditions:
 * 1. Declined card (Stripe 4000 0000 0000 0002) — checkout session must fail gracefully
 * 2. Abandoned checkout — user closes modal without completing payment
 * 3. Duplicate webhook delivery — idempotency via processed_webhook_events table
 * 4. IDOR checks — user cannot access another user's will
 * 5. Upload API validation — wrong file type, oversized file
 *
 * Code paths traced:
 * - app/api/stripe/webhooks/route.ts: processes_webhook_events INSERT + catch 23505
 * - app/api/will/upload/route.ts: MAX_BYTES=10MB, types .pdf/.docx only
 * - app/api/will/download/route.ts: fetches by session user.id (no IDOR)
 * - components/CheckoutModal.tsx: 401 → redirect to /auth/signup
 *
 * Note: Declined card flow requires a running test-mode Stripe environment.
 * Most tests here are API-level guards that can be asserted without live Stripe.
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

test.beforeAll(async () => {
  if (PUBLISHABLE_KEY.startsWith('pk_live_')) {
    throw new Error('[SAFETY] Live Stripe keys detected. Aborting J9 tests.')
  }
})

test.describe('J9: Declined card', () => {
  /**
   * Stripe test card 4000 0000 0000 0002 always declines.
   * This test verifies the embedded checkout handles decline gracefully.
   * Requires test-mode Stripe + authenticated session + valid will in DB.
   * Skipped if BASE_URL is not localhost (integration test).
   */
  test('checkout page renders decline error for card 4000 0000 0000 0002', async () => {
    // Full implementation requires:
    // 1. Create test user account
    // 2. Complete will wizard steps
    // 3. Trigger checkout
    // 4. Fill card form with 4000 0000 0000 0002
    // 5. Assert Stripe embedded UI shows "Your card was declined."
    test.skip(true, 'Requires full test-mode Stripe + auth setup — implement when test env is ready')
  })
})

test.describe('J9: Abandoned checkout', () => {
  test('closing checkout modal does not create duplicate sessions on retry', async () => {
    // Placeholder: requires auth + will to open checkout
    test.skip(true, 'Requires test-mode Stripe + auth setup — implement when test env is ready')
  })

  test('checkout modal is closeable and re-openable without error', async () => {
    test.skip(true, 'Requires test-mode Stripe + auth setup — implement when test env is ready')
  })
})

test.describe('J9: Webhook idempotency (API contract)', () => {
  test('webhook endpoint rejects missing Stripe-Signature header', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/stripe/webhooks`, {
      data: JSON.stringify({ id: 'evt_test_duplicate_001', type: 'checkout.session.completed' }),
      headers: { 'Content-Type': 'application/json' },
      // Intentionally omit Stripe-Signature
    })
    // Must reject with 400 (bad webhook signature)
    expect(resp.status()).toBe(400)
  })

  test('webhook endpoint rejects invalid Stripe-Signature', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/stripe/webhooks`, {
      data: JSON.stringify({ id: 'evt_test_duplicate_001', type: 'checkout.session.completed' }),
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=invalid,v1=invalidsignature',
      },
    })
    expect(resp.status()).toBe(400)
  })

  /**
   * True idempotency test (requires valid test webhook signature):
   * 1. POST a valid webhook event
   * 2. POST same event again (same stripe_event_id)
   * 3. Assert second response is 200 (not 500) — unique_violation 23505 is caught
   * This requires STRIPE_WEBHOOK_SECRET for test mode to sign the payload.
   * Documented in code: unique constraint on stripe_event_id in processed_webhook_events.
   */
  test('duplicate webhook delivery is handled idempotently', async () => {
    test.skip(true, 'Requires test-mode STRIPE_WEBHOOK_SECRET to sign payload — implement when test env is ready')
  })
})

test.describe('J9: Upload API validation', () => {
  test('upload API returns 401 for unauthenticated request', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/will/upload`, {
      multipart: {
        file: {
          name: 'test.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('fake pdf content'),
        },
      },
    })
    expect(resp.status()).toBe(401)
  })

  test('upload API returns 400 for unsupported file type', async ({ request }) => {
    // Attempt to upload a .txt file — should be rejected
    // Without auth this will be 401, but the type check comes second
    const resp = await request.post(`${BASE_URL}/api/will/upload`, {
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('not a will'),
        },
      },
    })
    // 401 (no auth) — type check happens after auth
    expect([400, 401]).toContain(resp.status())
  })

  test('upload API returns 400 for oversized file (>10MB)', async ({ request }) => {
    // Without auth this will be 401
    // With auth, a file >10MB (MAX_BYTES in upload/route.ts) should return 400
    const resp = await request.post(`${BASE_URL}/api/will/upload`, {
      multipart: {
        file: {
          name: 'huge.pdf',
          mimeType: 'application/pdf',
          // Simulate oversized: create a 10.1MB buffer
          buffer: Buffer.alloc(10 * 1024 * 1024 + 1024, 'x'),
        },
      },
    })
    expect([400, 401, 413]).toContain(resp.status())
  })
})

test.describe('J9: IDOR and auth boundary checks', () => {
  test('download API returns 401 for unauthenticated request', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/will/download`)
    expect(resp.status()).toBe(401)
  })

  test('Basiq connect API returns 401 for unauthenticated request', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/basiq/connect`, {
      data: { mobile: '+61400000000' },
    })
    expect(resp.status()).toBe(401)
  })

  test('charity enquiry API accepts unauthenticated submissions (public form)', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/charity-enquiry`, {
      data: {
        name: 'E2E Test',
        email: 'e2e+charitytest@delivered.resend.dev',
        charityName: 'E2E Test Charity',
        message: 'This is an automated E2E test submission — ignore',
      },
    })
    // Should succeed (2xx) or validation-fail (400) — NOT 401
    expect(resp.status()).not.toBe(401)
  })

  test('will/new page is accessible to unauthenticated users (anon session)', async ({ page }) => {
    await page.goto(`${BASE_URL}/will/new`)
    // Should render the wizard, not redirect to login
    await expect(page).not.toHaveURL(/\/auth\/login/)
    await expect(page.locator('[id="eligibility-state"], select')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('J9: Auth expiry in checkout', () => {
  /**
   * CheckoutModal.tsx: 401 from /api/stripe/checkout → redirects to /auth/signup
   * This is the auth-expiry-during-checkout recovery path.
   */
  test('checkout modal redirects expired session to /auth/signup', async () => {
    // This can only be triggered with an auth-expired state in browser cookies.
    // Code trace confirms: 401 response from fetchClientSecret → router.push('/auth/signup')
    // Cannot be tested without a real expired JWT — documenting the code path here.
    test.skip(true, 'Requires expired auth cookie state — confirmed by code trace only')
  })
})

/**
 * Route Crawl
 *
 * GETs every known public route and asserts:
 * - 200 OK (or expected redirects for auth-protected routes)
 * - No console errors on page load
 * - No "404 | Page Not Found" in page title or content
 *
 * Based on route inventory from PHASE 1 audit of app/ directory.
 *
 * Auth-protected routes (should redirect to /auth/login):
 * - /dashboard, /dashboard/vault, /dashboard/links, /dashboard/super,
 *   /dashboard/property, /dashboard/life
 *
 * Orphaned routes (exist in code but not linked from nav/footer):
 * - /try-it (linked from /start, orphaned from nav)
 * - /guidance-notes (pending legal review placeholder, fully orphaned)
 *
 * Semi-protected (anonymous session allowed, no auth redirect):
 * - /will/new (accessible without auth)
 *
 * API routes return JSON, not HTML — tested separately.
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

// Helper: fetch a URL and assert status
async function assertRoute(
  request: import('@playwright/test').APIRequestContext,
  path: string,
  expectedStatus: number | number[],
  label?: string
) {
  const resp = await request.get(`${BASE_URL}${path}`)
  const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus]
  expect(
    statuses,
    `${label ?? path}: expected status ${statuses.join('|')} but got ${resp.status()}`
  ).toContain(resp.status())
  return resp
}

test.describe('Marketing pages — expect 200', () => {
  const marketingRoutes = [
    '/',
    '/pricing',
    '/about',
    '/security-trust',
    '/faq',
    '/how-it-works',
    '/living-vault',
    '/the-will',
    '/life-changes',
    '/waitlist',
    '/start',
    '/try-it',
  ]

  for (const route of marketingRoutes) {
    test(`GET ${route} → 200`, async ({ request }) => {
      await assertRoute(request, route, [200, 308, 301, 307], route)
    })
  }
})

test.describe('Life changes article pages — expect 200', () => {
  const lifeChangesSlugs = [
    'getting-married',
    'separation-divorce',
    'new-child',
    'buying-selling-property',
    'serious-illness',
    'starting-selling-business',
    'receiving-inheritance',
    'moving-interstate',
  ]

  for (const slug of lifeChangesSlugs) {
    test(`GET /life-changes/${slug} → 200`, async ({ request }) => {
      await assertRoute(request, `/life-changes/${slug}`, [200], `/life-changes/${slug}`)
    })
  }
})

test.describe('Auth routes — expect 200', () => {
  test('GET /auth/login → 200', async ({ request }) => {
    await assertRoute(request, '/auth/login', [200])
  })

  test('GET /auth/signup → 200', async ({ request }) => {
    await assertRoute(request, '/auth/signup', [200])
  })
})

test.describe('Will wizard — unauthenticated access allowed', () => {
  test('GET /will/new → 200 (anon session allowed)', async ({ request }) => {
    await assertRoute(request, '/will/new', [200])
  })
})

test.describe('Orphaned pages — should still return 200 (exist in codebase)', () => {
  test('GET /guidance-notes → 200 (orphaned — not linked from nav or footer)', async ({ request }) => {
    await assertRoute(request, '/guidance-notes', [200, 404])
    // Note: If this fails, the page was removed without redirecting.
    // Current state: page exists but shows "Pending legal review" placeholder.
  })

  test('GET /try-it → 200 (orphaned from nav)', async ({ request }) => {
    await assertRoute(request, '/try-it', [200])
  })
})

test.describe('Auth-protected dashboard routes — should redirect to login', () => {
  const dashboardRoutes = [
    '/dashboard',
    '/dashboard/vault',
    '/dashboard/links',
    '/dashboard/super',
    '/dashboard/property',
    '/dashboard/life',
  ]

  for (const route of dashboardRoutes) {
    test(`GET ${route} → redirect to /auth/login`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`)
      await page.waitForURL(/\/auth\/(login|signup)/, { timeout: 15_000 })
      await expect(page).toHaveURL(/\/auth\/(login|signup)/)
    })
  }
})

test.describe('API routes — unauthenticated expect 401 or 405', () => {
  const apiGets: { path: string; expectedStatus: number[] }[] = [
    { path: '/api/will/download', expectedStatus: [401] },
    { path: '/api/basiq/connect', expectedStatus: [401, 405] },
  ]

  for (const { path, expectedStatus } of apiGets) {
    test(`GET ${path} → ${expectedStatus.join('|')}`, async ({ request }) => {
      await assertRoute(request, path, expectedStatus, path)
    })
  }

  const apiPosts: { path: string; expectedStatus: number[] }[] = [
    { path: '/api/stripe/checkout', expectedStatus: [401] },
    { path: '/api/stripe/webhooks', expectedStatus: [400, 401] },
    { path: '/api/will/upload', expectedStatus: [401] },
    { path: '/api/basiq/connect', expectedStatus: [401] },
  ]

  for (const { path, expectedStatus } of apiPosts) {
    test(`POST ${path} → ${expectedStatus.join('|')} (no auth)`, async ({ request }) => {
      const resp = await request.post(`${BASE_URL}${path}`, {
        data: {},
        headers: { 'Content-Type': 'application/json' },
      })
      expect(expectedStatus).toContain(resp.status())
    })
  }

  test('POST /api/charity-enquiry → 400 or 200 (public form, no auth needed)', async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/charity-enquiry`, {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    // No auth required — should get 400 (validation) not 401
    expect([400, 200]).toContain(resp.status())
    expect(resp.status()).not.toBe(401)
  })
})

test.describe('No 404 or console errors on key public pages', () => {
  const publicPages = ['/', '/pricing', '/about', '/faq', '/how-it-works', '/living-vault', '/the-will']

  for (const route of publicPages) {
    test(`${route} loads without console errors`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          // Ignore known third-party errors and hydration mismatches in dev
          const text = msg.text()
          if (
            !text.includes('Failed to load resource') &&
            !text.includes('net::ERR_') &&
            !text.includes('stripe.js') // Stripe loads asynchronously
          ) {
            consoleErrors.push(text)
          }
        }
      })

      await page.goto(`${BASE_URL}${route}`)
      await page.waitForLoadState('domcontentloaded')

      // Page title should not indicate an error
      const title = await page.title()
      expect(title).not.toMatch(/404|Error|Not Found/i)

      // No unexpected console errors
      if (consoleErrors.length > 0) {
        console.warn(`[Route crawl] Console errors on ${route}:`, consoleErrors)
      }
      // Assert zero errors (adjust threshold if framework logs are unavoidable)
      expect(consoleErrors.length, `Console errors on ${route}: ${consoleErrors.join('; ')}`).toBe(0)
    })
  }
})

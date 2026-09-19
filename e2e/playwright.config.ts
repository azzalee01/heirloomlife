import { defineConfig, devices } from '@playwright/test'

/**
 * Heirloom Life E2E Test Configuration
 *
 * IMPORTANT: Never run these tests against an environment with live Stripe keys
 * (pk_live_ / sk_live_). The STRIPE_MODE_GUARD in each spec enforces this.
 *
 * Set BASE_URL env var to target a specific environment. Defaults to localhost.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Journey tests are stateful; keep sequential by default
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Allow sufficient time for Stripe embedded checkout to load
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Do NOT automatically start a dev server — require the caller to provide a running server.
  // To test locally: npm run dev (in a separate terminal), then npx playwright test
  // webServer: { ... } intentionally omitted
})

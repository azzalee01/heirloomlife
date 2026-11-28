// Playwright E2E config for the Will wizard path matrix.
//
// NOT runnable out of the box — requires setup (see e2e/README.md):
//   npm i -D @playwright/test && npx playwright install
//   env: E2E_BASE_URL, E2E_TEST_EMAIL, E2E_TEST_PASSWORD, pointing at a preview/staging
//        build backed by a TEST Supabase branch (never prod) with Stripe in test mode
//        or the payment step stubbed.
//
// Set E2E_FULL_MATRIX=1 to run the full combination matrix (nightly); otherwise only the
// ~10-combo smoke subset runs (per PR).
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})

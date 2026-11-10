import { describe, expect, it } from 'vitest'
import { renderAuthEmail } from '@/src/lib/auth-email'

const URL = 'https://heirloomlife.com.au/auth/confirm?token_hash=abc&type=magiclink&next=%2Fdashboard'

describe('renderAuthEmail', () => {
  it('uses Heirloom branding, not Supabase', () => {
    const { html } = renderAuthEmail('signup', URL)
    expect(html).toContain('Heirloom')
    expect(html).toContain('#2AB4AE') // teal wordmark + button
    expect(html).not.toMatch(/supabase/i)
  })

  it('embeds the confirm link in both button and fallback', () => {
    const { html } = renderAuthEmail('magiclink', URL)
    // href appears at least twice (CTA button + copy-paste fallback)
    expect(html.split(URL).length - 1).toBeGreaterThanOrEqual(2)
  })

  it('gives each action its own subject + CTA', () => {
    expect(renderAuthEmail('signup', URL).subject).toMatch(/confirm your email/i)
    expect(renderAuthEmail('magiclink', URL).subject).toMatch(/sign-in link/i)
    expect(renderAuthEmail('recovery', URL).subject).toMatch(/reset/i)
    expect(renderAuthEmail('signup', URL).html).toMatch(/Confirm email address/)
    expect(renderAuthEmail('magiclink', URL).html).toMatch(/Sign in to Heirloom/)
  })

  it('falls back gracefully for unknown actions', () => {
    const { subject, html } = renderAuthEmail('something_new', URL)
    expect(subject).toBe('Heirloom Life')
    expect(html).toContain(URL)
  })
})

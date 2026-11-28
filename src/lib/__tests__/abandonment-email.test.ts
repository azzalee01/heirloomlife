import { describe, it, expect } from 'vitest'
import { renderWillAbandonmentEmail } from '../abandonment-email'

const URLS = {
  dashboardUrl: 'https://heirloomlife.com.au/dashboard',
  unsubscribeUrl: 'https://heirloomlife.com.au/api/unsubscribe?u=u1&t=abc123',
}

describe('renderWillAbandonmentEmail', () => {
  it('nudge: "continue" copy, no reply line, compliant footer', () => {
    const { subject, html } = renderWillAbandonmentEmail({ firstName: 'Jane', kind: 'nudge', ...URLS })
    expect(subject).toMatch(/still waiting/i)
    expect(html).toContain('Continue your Will')
    expect(html).not.toMatch(/reply to this email/i) // the removed line
    // Spam Act: sender identity + working unsubscribe.
    expect(html).toContain('Heirloom Life Pty Ltd')
    expect(html).toContain(URLS.unsubscribeUrl)
    expect(html).toMatch(/Unsubscribe/)
  })

  it('ready: "unlock" copy, not "haven\'t finished"', () => {
    const { subject, html } = renderWillAbandonmentEmail({ firstName: 'Jane', kind: 'ready', ...URLS })
    expect(subject).toMatch(/ready/i)
    expect(html).toContain('Unlock your Will')
    expect(html).toContain('completed every step')
    expect(html).not.toMatch(/still waiting|haven.t finished/i)
    expect(html).toContain(URLS.unsubscribeUrl)
  })

  it('handles a missing first name', () => {
    const { html } = renderWillAbandonmentEmail({ firstName: null, kind: 'nudge', ...URLS })
    expect(html).toContain('Hi,')
  })
})

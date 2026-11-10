import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Webhook } from 'standardwebhooks'
import { NextRequest } from 'next/server'

// Mock the actual Resend send so the test is deterministic and nothing goes out.
vi.mock('@/src/lib/auth-email', () => ({ sendAuthEmail: vi.fn().mockResolvedValue(undefined) }))
import { sendAuthEmail } from '@/src/lib/auth-email'
import { POST } from '@/app/api/auth/email-hook/route'

const B64 = Buffer.from('heirloom-test-hook-secret-0123456').toString('base64')

function signedRequest(bodyObj: unknown, opts: { tamper?: boolean } = {}): NextRequest {
  const body = JSON.stringify(bodyObj)
  const wh = new Webhook(B64)
  const msgId = 'msg_test_1'
  const ts = new Date()
  let sig = wh.sign(msgId, ts, body)
  if (opts.tamper) sig = sig.slice(0, -2) + (sig.endsWith('A') ? 'BB' : 'AA')
  return new NextRequest('http://localhost:3000/api/auth/email-hook', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      'webhook-id': msgId,
      'webhook-timestamp': Math.floor(ts.getTime() / 1000).toString(),
      'webhook-signature': sig,
    },
  })
}

const PAYLOAD = {
  user: { email: 'delivered@resend.dev' },
  email_data: {
    token_hash: 'pkce_abc123',
    email_action_type: 'magiclink',
    redirect_to: 'http://localhost:3000/auth/callback?next=/will/new',
    site_url: 'https://heirloomlife.com.au',
  },
}

describe('auth email hook', () => {
  beforeEach(() => {
    process.env.SEND_EMAIL_HOOK_SECRET = `v1,whsec_${B64}`
    vi.clearAllMocks()
  })
  afterEach(() => { delete process.env.SEND_EMAIL_HOOK_SECRET })

  it('accepts a correctly-signed payload and sends a branded email with the right confirm link', async () => {
    const res = await POST(signedRequest(PAYLOAD))
    expect(res.status).toBe(200)
    expect(sendAuthEmail).toHaveBeenCalledTimes(1)
    const arg = (sendAuthEmail as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(arg.to).toBe('delivered@resend.dev')
    expect(arg.action).toBe('magiclink')
    // Points at our cross-device confirm route, carries token_hash + type, and
    // preserves the original ?next=/will/new so the anon-will migration lands right.
    expect(arg.confirmUrl).toContain('https://heirloomlife.com.au/auth/confirm')
    expect(arg.confirmUrl).toContain('token_hash=pkce_abc123')
    expect(arg.confirmUrl).toContain('type=magiclink')
    expect(arg.confirmUrl).toContain('next=%2Fwill%2Fnew')
  })

  it('rejects a tampered signature (401) and sends nothing', async () => {
    const res = await POST(signedRequest(PAYLOAD, { tamper: true }))
    expect(res.status).toBe(401)
    expect(sendAuthEmail).not.toHaveBeenCalled()
  })

  it('fails closed when the hook secret is not configured (500)', async () => {
    delete process.env.SEND_EMAIL_HOOK_SECRET
    const res = await POST(signedRequest(PAYLOAD))
    expect(res.status).toBe(500)
    expect(sendAuthEmail).not.toHaveBeenCalled()
  })

  it('defaults next to /dashboard when redirect_to has none', async () => {
    const res = await POST(signedRequest({
      ...PAYLOAD,
      email_data: { ...PAYLOAD.email_data, email_action_type: 'signup', redirect_to: 'http://localhost:3000/auth/callback' },
    }))
    expect(res.status).toBe(200)
    const arg = (sendAuthEmail as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(arg.action).toBe('signup')
    expect(arg.confirmUrl).toContain('next=%2Fdashboard')
    expect(arg.confirmUrl).toContain('type=signup')
  })
})

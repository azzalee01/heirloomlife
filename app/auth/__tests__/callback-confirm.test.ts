import { beforeEach, describe, expect, it, vi } from 'vitest'

// Drive verify/exchange outcomes without a live project. redirect() is mocked to
// throw a sentinel so we can read the destination (the real one throws too).
// vi.hoisted so the mock factories (hoisted above imports) can reference them.
const { mockExchange, mockVerify, mockGetUser, mockUpsert, mockRedirect } = vi.hoisted(() => ({
  mockExchange: vi.fn(),
  mockVerify: vi.fn(),
  mockGetUser: vi.fn(),
  mockUpsert: vi.fn(),
  mockRedirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))

vi.mock('@/src/lib/supabase-ssr', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchange,
      verifyOtp: mockVerify,
      getUser: mockGetUser,
    },
    from: () => ({ upsert: mockUpsert }),
  })),
}))

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))

import { confirmOtpAction, exchangeCodeAction } from '@/app/auth/_actions'
import ConfirmPage from '@/app/auth/confirm/page'
import CallbackPage from '@/app/auth/callback/page'

const USER = { data: { user: { id: 'u1', email: 'a@b.com', user_metadata: { full_name: 'A B' } } } }

function fd(obj: Record<string, string>): FormData {
  const f = new FormData()
  for (const k of Object.keys(obj)) f.set(k, obj[k])
  return f
}
// Run an action; return the redirect destination (actions always redirect).
async function dest(run: Promise<void>): Promise<string> {
  try { await run; return '' } catch (e) { return (e as Error).message.replace('REDIRECT:', '') }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUpsert.mockResolvedValue({})
})

// ── The core scanner fix: a GET (page render) must NOT consume the token ──────

describe('GET does not verify the token (link-scanner safety)', () => {
  it('rendering /auth/confirm does not call verifyOtp', async () => {
    await ConfirmPage({ searchParams: Promise.resolve({ token_hash: 't', type: 'magiclink', next: '/dashboard' }) })
    expect(mockVerify).not.toHaveBeenCalled()
  })

  it('rendering /auth/callback does not call exchangeCodeForSession', async () => {
    await CallbackPage({ searchParams: Promise.resolve({ code: 'c', next: '/dashboard' }) })
    expect(mockExchange).not.toHaveBeenCalled()
  })
})

// ── The POST actions (button click) do the verification ──────────────────────

describe('confirmOtpAction (token_hash, POST)', () => {
  it('missing token → login?error=link, never calls verifyOtp', async () => {
    expect(await dest(confirmOtpAction(fd({})))).toContain('/auth/login?error=link')
    expect(mockVerify).not.toHaveBeenCalled()
  })

  it('bad token → login?error=expired', async () => {
    mockVerify.mockResolvedValue({ error: { message: 'expired' } })
    expect(await dest(confirmOtpAction(fd({ token_hash: 't', type: 'magiclink' })))).toContain('/auth/login?error=expired')
  })

  it('valid token → dashboard + welcome; verifyOtp called with the type; profile upserted', async () => {
    mockVerify.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const d = await dest(confirmOtpAction(fd({ token_hash: 't', type: 'signup', next: '/dashboard' })))
    expect(d).toContain('/dashboard?welcome=1')
    expect(mockVerify).toHaveBeenCalledWith({ type: 'signup', token_hash: 't' })
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })

  it('next=/will/new → returns there, no welcome flag', async () => {
    mockVerify.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const d = await dest(confirmOtpAction(fd({ token_hash: 't', type: 'magiclink', next: '/will/new' })))
    expect(d).toMatch(/\/will\/new$/)
    expect(d).not.toContain('welcome')
  })

  it('rejects an open-redirect next (//evil.com) → /dashboard', async () => {
    mockVerify.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const d = await dest(confirmOtpAction(fd({ token_hash: 't', type: 'magiclink', next: '//evil.com' })))
    expect(d).toContain('/dashboard?welcome=1')
    expect(d).not.toContain('evil.com')
  })
})

describe('exchangeCodeAction (PKCE code, POST)', () => {
  it('no code → login?error=link, never exchanges', async () => {
    expect(await dest(exchangeCodeAction(fd({})))).toContain('/auth/login?error=link')
    expect(mockExchange).not.toHaveBeenCalled()
  })

  it('bad code → login?error=expired', async () => {
    mockExchange.mockResolvedValue({ error: { message: 'bad code' } })
    expect(await dest(exchangeCodeAction(fd({ code: 'x' })))).toContain('/auth/login?error=expired')
  })

  it('good code → dashboard + welcome, upserts profile', async () => {
    mockExchange.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const d = await dest(exchangeCodeAction(fd({ code: 'x', next: '/dashboard' })))
    expect(d).toContain('/dashboard?welcome=1')
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })
})

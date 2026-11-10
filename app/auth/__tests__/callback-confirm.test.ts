import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the server Supabase client so we can drive exchange/verify outcomes without
// a live project or Next request context.
const mockExchange = vi.fn()
const mockVerify = vi.fn()
const mockGetUser = vi.fn()
const mockUpsert = vi.fn().mockResolvedValue({})

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

import { GET as callbackGET } from '@/app/auth/callback/route'
import { GET as confirmGET } from '@/app/auth/confirm/route'

const USER = { data: { user: { id: 'u1', email: 'a@b.com', user_metadata: { full_name: 'A B' } } } }
const loc = (res: Response) => res.headers.get('location') ?? ''

beforeEach(() => {
  vi.clearAllMocks()
  mockUpsert.mockResolvedValue({})
})

describe('/auth/callback (PKCE code exchange)', () => {
  it('no code → redirect to login (error=link), never touches Supabase', async () => {
    const res = await callbackGET(new NextRequest('http://localhost:3000/auth/callback'))
    expect(res.status).toBe(307)
    expect(loc(res)).toContain('/auth/login?error=link')
    expect(mockExchange).not.toHaveBeenCalled()
  })

  it('bad/expired code → login (error=expired), not a silent bounce', async () => {
    mockExchange.mockResolvedValue({ error: { message: 'bad code' } })
    const res = await callbackGET(new NextRequest('http://localhost:3000/auth/callback?code=x'))
    expect(res.status).toBe(307)
    expect(loc(res)).toContain('/auth/login?error=expired')
  })

  it('good code → dashboard + welcome flag, upserts profile', async () => {
    mockExchange.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const res = await callbackGET(new NextRequest('http://localhost:3000/auth/callback?code=x&next=%2Fdashboard'))
    expect(res.status).toBe(307)
    expect(loc(res)).toContain('/dashboard?welcome=1')
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })

  it('good code with next=/will/new → returns there (so anon-will migration runs), no welcome flag', async () => {
    mockExchange.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const res = await callbackGET(new NextRequest('http://localhost:3000/auth/callback?code=x&next=%2Fwill%2Fnew'))
    expect(loc(res)).toMatch(/\/will\/new$/)
    expect(loc(res)).not.toContain('welcome')
  })

  it('rejects an open-redirect next (//evil.com) → falls back to /dashboard', async () => {
    mockExchange.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const res = await callbackGET(new NextRequest('http://localhost:3000/auth/callback?code=x&next=%2F%2Fevil.com'))
    expect(loc(res)).toContain('/dashboard?welcome=1')
    expect(loc(res)).not.toContain('evil.com')
  })
})

describe('/auth/confirm (token_hash, cross-device)', () => {
  it('missing token → login (error=link)', async () => {
    const res = await confirmGET(new NextRequest('http://localhost:3000/auth/confirm'))
    expect(res.status).toBe(307)
    expect(loc(res)).toContain('/auth/login?error=link')
    expect(mockVerify).not.toHaveBeenCalled()
  })

  it('bad token → login (error=expired)', async () => {
    mockVerify.mockResolvedValue({ error: { message: 'expired' } })
    const res = await confirmGET(new NextRequest('http://localhost:3000/auth/confirm?token_hash=t&type=magiclink'))
    expect(loc(res)).toContain('/auth/login?error=expired')
  })

  it('valid token → dashboard + welcome, verifyOtp called with the type', async () => {
    mockVerify.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue(USER)
    const res = await confirmGET(new NextRequest('http://localhost:3000/auth/confirm?token_hash=t&type=signup&next=%2Fdashboard'))
    expect(loc(res)).toContain('/dashboard?welcome=1')
    expect(mockVerify).toHaveBeenCalledWith({ type: 'signup', token_hash: 't' })
  })
})

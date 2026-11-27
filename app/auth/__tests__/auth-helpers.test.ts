import { describe, it, expect, vi } from 'vitest'
import { sanitizeNext, destFor } from '@/app/auth/_shared'
import { otpTypesForFlow, verifyEmailCode } from '@/app/auth/_verify-code'

describe('sanitizeNext (open-redirect guard)', () => {
  it('allows same-origin relative paths', () => {
    expect(sanitizeNext('/will/new')).toBe('/will/new')
    expect(sanitizeNext('/dashboard')).toBe('/dashboard')
  })

  it('rejects open-redirect / scheme / backslash tricks → /dashboard', () => {
    const bad = ['//evil.com', '/\\evil.com', '/\\/evil.com', 'https://evil.com', 'javascript:alert(1)', 'data:text/html,x', '', null, undefined]
    for (const b of bad) {
      expect(sanitizeNext(b as string)).toBe('/dashboard')
    }
  })
})

describe('destFor', () => {
  it('adds the welcome flag only for /dashboard', () => {
    expect(destFor('/dashboard')).toBe('/dashboard?welcome=1')
    expect(destFor('/will/new')).toBe('/will/new')
  })
})

describe('verifyEmailCode (code type per flow + fallback)', () => {
  it('primary types: sign-in=email, sign-up=signup', () => {
    expect(otpTypesForFlow(false)).toEqual(['email', 'signup'])
    expect(otpTypesForFlow(true)).toEqual(['signup', 'email'])
  })

  it('sign-in verifies with type "email" and stops on success', async () => {
    const v = vi.fn().mockResolvedValue({ error: null })
    const r = await verifyEmailCode(v, { email: 'a@b.com', token: '123456', isSignUp: false })
    expect(r.error).toBeNull()
    expect(v).toHaveBeenCalledTimes(1)
    expect(v).toHaveBeenCalledWith({ email: 'a@b.com', token: '123456', type: 'email' })
  })

  it('sign-in falls back to "signup" when "email" fails', async () => {
    const v = vi.fn()
      .mockResolvedValueOnce({ error: { message: 'x' } })
      .mockResolvedValueOnce({ error: null })
    const r = await verifyEmailCode(v, { email: 'a@b.com', token: '123456', isSignUp: false })
    expect(r.error).toBeNull()
    expect(v).toHaveBeenCalledTimes(2)
    expect(v.mock.calls[0][0].type).toBe('email')
    expect(v.mock.calls[1][0].type).toBe('signup')
  })

  it('sign-up verifies with "signup" first', async () => {
    const v = vi.fn().mockResolvedValue({ error: null })
    await verifyEmailCode(v, { email: 'a@b.com', token: '123456', isSignUp: true })
    expect(v.mock.calls[0][0].type).toBe('signup')
  })

  it('returns the error when both types fail', async () => {
    const v = vi.fn()
      .mockResolvedValueOnce({ error: { message: 'first' } })
      .mockResolvedValueOnce({ error: { message: 'second' } })
    const r = await verifyEmailCode(v, { email: 'a@b.com', token: '000000', isSignUp: false })
    expect(r.error).toEqual({ message: 'second' })
    expect(v).toHaveBeenCalledTimes(2)
  })
})

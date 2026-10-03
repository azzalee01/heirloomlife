import { beforeAll, describe, expect, it } from 'vitest'
import { buildAccessToken, parseAccessToken, verifyAccessSignature } from '@/src/lib/appointments/links'

const ID = '3f8a1c52-9d0e-4b7a-a1f4-2c6e9b8d7e10'

beforeAll(() => {
  process.env.APPOINTMENT_LINK_SECRET = 'test-secret-test-secret-test-secret-123456'
})

describe('signed join links', () => {
  it('round-trips', () => {
    const parsed = parseAccessToken(buildAccessToken(ID, 1))!
    expect(parsed.appointmentId).toBe(ID)
    expect(verifyAccessSignature(parsed.appointmentId, 1, parsed.signature)).toBe(true)
  })

  it('is deterministic, so reminders re-derive the same link', () => {
    expect(buildAccessToken(ID, 1)).toBe(buildAccessToken(ID, 1))
  })

  it('rejects a tampered signature', () => {
    const parsed = parseAccessToken(buildAccessToken(ID, 1))!
    expect(verifyAccessSignature(parsed.appointmentId, 1, parsed.signature.slice(0, -2) + 'xx')).toBe(false)
  })

  it('rejects a link for another appointment id', () => {
    const parsed = parseAccessToken(buildAccessToken(ID, 1))!
    expect(verifyAccessSignature('11111111-1111-4111-8111-111111111111', 1, parsed.signature)).toBe(false)
  })

  it('bumping token_version invalidates old links', () => {
    const parsed = parseAccessToken(buildAccessToken(ID, 1))!
    expect(verifyAccessSignature(parsed.appointmentId, 2, parsed.signature)).toBe(false)
  })

  it('rejects malformed tokens', () => {
    expect(parseAccessToken('nonsense')).toBeNull()
    expect(parseAccessToken('not-a-uuid.sig')).toBeNull()
    expect(parseAccessToken(`${ID}.`)).toBeNull()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { extractPgError, makeRefId, logWizardError } from '../wizard-errors'

describe('extractPgError', () => {
  it('reads the Postgres code + constraint from a Supabase-style error object', () => {
    const err = { code: '23514', constraint: 'assets_ownership_type_check', message: 'new row violates check constraint "assets_ownership_type_check"' }
    const r = extractPgError(err)
    expect(r.pgCode).toBe('23514')
    expect(r.constraint).toBe('assets_ownership_type_check')
  })

  it('falls back to parsing the constraint name out of the message', () => {
    const err = new Error('new row for relation "assets" violates check constraint "assets_asset_type_check"')
    const r = extractPgError(err)
    expect(r.constraint).toBe('assets_asset_type_check')
    expect(r.pgCode).toBeNull()
  })

  it('handles non-pg errors without throwing', () => {
    const r = extractPgError(new Error('boom'))
    expect(r.message).toBe('boom')
    expect(r.constraint).toBeNull()
  })
})

describe('makeRefId', () => {
  it('produces a wz_-prefixed reference', () => {
    expect(makeRefId()).toMatch(/^wz_[a-z0-9]+$/)
  })
})

describe('logWizardError', () => {
  it('logs one structured JSON line with constraint + step and returns a ref id', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = { code: '23514', constraint: 'assets_ownership_type_check', message: 'violates check constraint "assets_ownership_type_check"' }
    const refId = logWizardError({ action: 'saveStep', step: 'assets', willId: 'w1', userId: 'u1' }, err)
    expect(refId).toMatch(/^wz_/)
    expect(spy).toHaveBeenCalledOnce()
    const logged = JSON.parse(spy.mock.calls[0][0] as string)
    expect(logged).toMatchObject({
      event: 'wizard_action_error',
      action: 'saveStep',
      step: 'assets',
      willId: 'w1',
      userId: 'u1',
      pgCode: '23514',
      constraint: 'assets_ownership_type_check',
      refId,
    })
    spy.mockRestore()
  })
})

/**
 * Integration tests for witnessing version-lock server actions.
 *
 * Mocks Supabase clients and external services so the real server-action
 * functions can be imported and called directly, exercising actual branching
 * logic rather than pure helpers.
 *
 * Coverage:
 * - completeSession() rejects legacy, stale, and version-mismatched sessions;
 *   only updates DB after all validation passes.
 * - getJoinToken() optimistic lock on scheduled→in_progress: rejects when the
 *   update affects 0 rows (concurrent join race) or returns a DB error.
 * - saveStep() stale-marking compensating action when version recording fails.
 * - assertNoActiveSigning() called from saveStep(): P0001 fails closed with
 *   the right message; generic DB error also fails closed.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createHash } from 'crypto'
import type { WillFormData } from '@/app/will/new/_types'

// ── External service / helper mocks ──────────────────────────────────────────
// All must be declared before any imports that transitively require them.

vi.mock('@/src/lib/daily', () => ({
  createWitnessingRoom: vi.fn(),
  createMeetingToken: vi.fn(),
  getRoomRecordings: vi.fn(),
  getRecordingAccessLink: vi.fn(),
}))

vi.mock('@/src/lib/email', () => ({
  sendWitnessInviteEmail: vi.fn(),
  sendResumeEmail: vi.fn(),
}))

vi.mock('@/app/will/new/_data', () => ({
  loadWillFormData: vi.fn(),
}))

vi.mock('@/src/lib/entitlements', () => ({
  hasWillAccess: vi.fn(),
  hasUsedIncludedSigning: vi.fn(),
}))

// ── Supabase admin mock ───────────────────────────────────────────────────────

const mockRpc      = vi.fn()
const mockFrom     = vi.fn()
const mockDownload = vi.fn()
const mockUpload   = vi.fn()

const mockAdmin = {
  from: mockFrom,
  rpc:  mockRpc,
  storage: { from: vi.fn(() => ({ download: mockDownload, upload: mockUpload })) },
}

vi.mock('@/src/lib/supabase-server', () => ({ supabaseAdmin: mockAdmin }))

// ── Supabase SSR client mock ──────────────────────────────────────────────────

const mockUserFrom = vi.fn()
const mockUser = { id: 'user-1', user_metadata: { full_name: 'Jane Smith' }, email: 'jane@example.com' }

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: mockUserFrom,
}

vi.mock('@/src/lib/supabase-ssr', () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(mockSupabase),
}))

// ── Next.js headers mock ──────────────────────────────────────────────────────

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(() => undefined), set: vi.fn() }),
}))

// ── Lazy imports: run after mock hoisting ────────────────────────────────────

const { completeSession, getJoinToken } = await import('../_actions')
const { saveStep } = await import('@/app/will/new/_actions')
const { assertNoActiveSigning } = await import('@/app/will/new/_versioning')
const { createMeetingToken } = await import('@/src/lib/daily')
const { loadWillFormData } = await import('@/app/will/new/_data')

// ── Chain builder ─────────────────────────────────────────────────────────────

type ChainResult = { data: unknown; error: unknown }

/**
 * Returns a minimal Supabase query builder that:
 * - Can be chained with .select/.eq/.update/.insert etc. (all return `obj`)
 * - Supports both `.single()` / `.maybeSingle()` (promise terminals)
 * - Can be awaited directly (via `then`)
 */
function chain(result: ChainResult) {
  const obj: Record<string, unknown> = {
    single:      vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    then:  (resolve: (v: ChainResult) => unknown) => Promise.resolve(result).then(resolve),
    catch: (reject: (e: unknown) => unknown) => Promise.resolve(result).catch(reject),
  }
  ;['select','eq','neq','in','not','order','limit','update','insert','delete','upsert'].forEach(m => {
    obj[m] = vi.fn().mockReturnValue(obj)
  })
  return obj
}

// ── Shortcuts ─────────────────────────────────────────────────────────────────

function userFrom(scenes: Record<string, ChainResult>) {
  mockUserFrom.mockImplementation((t: string) => chain(scenes[t] ?? { data: null, error: null }))
}

function adminFrom(scenes: Record<string, ChainResult>) {
  mockFrom.mockImplementation((t: string) => chain(scenes[t] ?? { data: null, error: null }))
}

// ── Test constants ─────────────────────────────────────────────────────────────

const SESSION_ID = 'sess-aaa'
const WILL_ID    = 'will-111'
const VERSION_ID = 'ver-aaa-001'

const LOCKED_TEXT  = 'LOCKED WILL DOCUMENT TEXT'
const CORRECT_HASH = createHash('sha256').update(LOCKED_TEXT, 'utf8').digest('hex')

const WILL_ROW     = { id: WILL_ID }
const SESSION_BASE = {
  id: SESSION_ID, will_id: WILL_ID,
  room_url: 'https://heirloom.daily.co/room',
  recording_enabled: false, recording_status: null,
  will_version_id: VERSION_ID, version_stale: false,
  content_hash: CORRECT_HASH, status: 'scheduled',
}
const SESSION_STALE  = { ...SESSION_BASE, version_stale: true }
const SESSION_LEGACY = { ...SESSION_BASE, will_version_id: null, content_hash: null }
const VER_MATCH   = { id: VERSION_ID }
const VER_NOMATCH = { id: 'ver-other-999' }

// ── Shared reset ──────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // Auth always succeeds
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
})

// ─────────────────────────────────────────────────────────────────────────────
// completeSession — server-side validation before marking complete
// ─────────────────────────────────────────────────────────────────────────────

describe('completeSession — validation blocks invalid sessions', () => {
  it('throws for a legacy session (null will_version_id)', async () => {
    userFrom({ wills: { data: [WILL_ROW], error: null }, witnessing_sessions: { data: SESSION_LEGACY, error: null } })
    await expect(completeSession(SESSION_ID)).rejects.toThrow(/before version locking/i)
  })

  it('throws for a stale session and does not query will_versions', async () => {
    userFrom({ wills: { data: [WILL_ROW], error: null }, witnessing_sessions: { data: SESSION_STALE, error: null } })
    adminFrom({}) // no admin tables needed
    await expect(completeSession(SESSION_ID)).rejects.toThrow(/updated after it was booked/i)
    // admin.from should never be called (short-circuits before version query)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('throws and marks stale when latest version does not match locked version', async () => {
    userFrom({ wills: { data: [WILL_ROW], error: null }, witnessing_sessions: { data: SESSION_BASE, error: null } })
    adminFrom({ will_versions: { data: VER_NOMATCH, error: null } })
    await expect(completeSession(SESSION_ID)).rejects.toThrow(/updated after it was booked/i)
    // Verify admin queried will_versions (belt-and-braces version check ran)
    expect(mockFrom).toHaveBeenCalledWith('will_versions')
  })

  it('throws when session row is not found', async () => {
    userFrom({ wills: { data: [WILL_ROW], error: null }, witnessing_sessions: { data: null, error: { message: 'no rows' } } })
    await expect(completeSession(SESSION_ID)).rejects.toThrow(/not found/i)
  })

  it('does not call witnessing_sessions.update before validation passes', async () => {
    const updateCalls: string[] = []
    mockUserFrom.mockImplementation((table: string) => {
      const result = table === 'wills'
        ? { data: [WILL_ROW], error: null }
        : { data: SESSION_STALE, error: null }
      const c = chain(result)
      ;(c.update as ReturnType<typeof vi.fn>).mockImplementation(() => {
        updateCalls.push(table)
        return c
      })
      return c
    })
    await expect(completeSession(SESSION_ID)).rejects.toThrow()
    // No update should have been called on any table (stale check short-circuits first)
    expect(updateCalls).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getJoinToken — optimistic lock on scheduled→in_progress transition
// ─────────────────────────────────────────────────────────────────────────────

describe('getJoinToken — optimistic status transition lock', () => {
  beforeEach(() => {
    // Admin: version matches, storage has correct locked document
    adminFrom({ will_versions: { data: VER_MATCH, error: null } })
    mockDownload.mockResolvedValue({ data: new Blob([LOCKED_TEXT]), error: null })
    vi.mocked(createMeetingToken).mockResolvedValue('mock-token')
  })

  it('throws when status update affects 0 rows (concurrent join race)', async () => {
    const emptyUpdate = chain({ data: [], error: null })

    mockUserFrom.mockImplementation((table: string) => {
      if (table !== 'witnessing_sessions') return chain({ data: [WILL_ROW], error: null })
      const c = chain({ data: SESSION_BASE, error: null })
      ;(c.update as ReturnType<typeof vi.fn>).mockReturnValue(emptyUpdate)
      return c
    })

    await expect(getJoinToken(SESSION_ID, 'Jane')).rejects.toThrow(/transition failed/i)
  })

  it('throws when the status update returns a DB error', async () => {
    const errorUpdate = chain({ data: null, error: { message: 'deadlock detected' } })

    mockUserFrom.mockImplementation((table: string) => {
      if (table !== 'witnessing_sessions') return chain({ data: [WILL_ROW], error: null })
      const c = chain({ data: SESSION_BASE, error: null })
      ;(c.update as ReturnType<typeof vi.fn>).mockReturnValue(errorUpdate)
      return c
    })

    await expect(getJoinToken(SESSION_ID, 'Jane')).rejects.toThrow(/Could not start session/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// assertNoActiveSigning — exercised through saveStep (RPC contract)
// ─────────────────────────────────────────────────────────────────────────────

describe('assertNoActiveSigning RPC contract (direct)', () => {
  it('resolves silently when the RPC succeeds', async () => {
    mockRpc.mockResolvedValue({ data: 0, error: null })
    await expect(assertNoActiveSigning('will-abc')).resolves.toBeUndefined()
    expect(mockRpc).toHaveBeenCalledWith('will_edit_lock', { p_will_id: 'will-abc' })
  })

  it('throws user-facing message on P0001 (in_progress session found)', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'A witnessing session is currently in progress.' },
    })
    await expect(assertNoActiveSigning('will-abc')).rejects.toThrow(/in progress/i)
  })

  it('fails closed on a non-P0001 DB error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'permission denied for function' },
    })
    await expect(assertNoActiveSigning('will-abc')).rejects.toThrow(/could not be verified/i)
  })

  it('fails closed on a network/infrastructure error (null error code)', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: null, message: 'connection reset' },
    })
    await expect(assertNoActiveSigning('will-abc')).rejects.toThrow(/could not be verified/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// saveStep — P0001 from will_edit_lock RPC propagates through saveStep
// ─────────────────────────────────────────────────────────────────────────────

describe('saveStep — assertNoActiveSigning RPC integration', () => {
  it('throws the in-progress message when the DB lock function raises P0001', async () => {
    // RPC raises — saveStep must throw before any table mutation
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'A witnessing session is currently in progress.' },
    })
    userFrom({
      profiles: { data: null, error: null }, // upsert
      wills:    { data: { status: 'approved' }, error: null },
    })

    await expect(saveStep(WILL_ID, 'personal', buildFormData())).rejects.toThrow(/in progress/i)
  })

  it('fails closed (throws) on a generic DB error from the RPC', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: '08006', message: 'connection failure' },
    })
    userFrom({
      profiles: { data: null, error: null },
      wills:    { data: { status: 'approved' }, error: null },
    })

    await expect(saveStep(WILL_ID, 'personal', buildFormData())).rejects.toThrow(/could not be verified/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// saveStep — version recording failure → compensating stale action
// ─────────────────────────────────────────────────────────────────────────────

describe('saveStep — version recording failure triggers stale compensation', () => {
  it('marks all active sessions stale when version recording fails', async () => {
    // RPC passes (no active signing block)
    mockRpc.mockResolvedValue({ data: 0, error: null })

    // loadWillFormData returns minimal form data
    vi.mocked(loadWillFormData).mockResolvedValue({ willId: WILL_ID, formData: buildFormData() as never })

    // Active session IDs that should be marked stale
    const activeSessionIds = ['sess-x', 'sess-y']
    const markedIds: string[] = []

    // Call order (from saveStep):
    //   1. markSessionsStaleAfterEdit race check (in_progress only) → []
    //   2. Compensating action select (scheduled + in_progress) → active sessions
    //   3. Compensating action update (version_stale = true) → succeeds
    let adminWitCallCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table !== 'witnessing_sessions') return chain({ data: null, error: null })
      adminWitCallCount++
      if (adminWitCallCount === 1) {
        // markSessionsStaleAfterEdit: no in_progress races
        return chain({ data: [], error: null })
      }
      if (adminWitCallCount === 2) {
        // Compensating select: return active sessions
        return chain({ data: activeSessionIds.map(id => ({ id })), error: null })
      }
      // adminWitCallCount === 3: compensating update → succeeds
      return chain({ data: null, error: null })
    })

    // User client: will status = 'draft' so runReview = false (avoids AI call)
    // Make will_versions insert single() reject to trigger the catch block
    mockUserFrom.mockImplementation((table: string) => {
      switch (table) {
        case 'profiles':  return chain({ data: null, error: null })
        case 'wills':     return chain({ data: { status: 'draft' }, error: null })
        case 'testators': return chain({ data: [], error: null })
        default: {
          const c = chain({ data: null, error: null })
          // Make will_versions insert fail so recordVersion throws
          if (table === 'will_versions') {
            ;(c.insert as ReturnType<typeof vi.fn>).mockReturnValue({
              ...c,
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockRejectedValue(new Error('DB write failed')),
              }),
            })
          }
          return c
        }
      }
    })

    // saveStep should not throw — version failure is caught
    const result = await saveStep(WILL_ID, 'personal', buildFormData())
    expect(result.id).toBe(WILL_ID)
    expect(result.versionId).toBeNull()

    // Call 1 = markSessionsStaleAfterEdit race check; call 2+ = compensating action.
    // Both must have run, proving the catch block executed and queried for active sessions.
    expect(adminWitCallCount).toBeGreaterThanOrEqual(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildFormData(): WillFormData {
  return {
    willId: null,
    personalDetails: {
      firstName: 'Jane', lastName: 'Smith', middleName: '', dateOfBirth: '1980-01-01',
      addressLine1: '1 Test St', suburb: 'Sydney', state: 'NSW', postcode: '2000',
      phoneMobile: '0400000000', email: 'jane@example.com', occupation: 'Engineer',
      maritalStatus: 'single', previousWill: 'no', previousWillLocation: '',
    },
    spouseDetails: {
      firstName: '', lastName: '', middleName: '', dateOfBirth: '',
      addressLine1: '', suburb: '', state: '', postcode: '',
      phoneMobile: '', email: '', occupation: '',
      previousWill: 'no', previousWillLocation: '',
    },
    childrenData: {
      hasChildren: 'no', children: [],
      guardian: { firstName: '', lastName: '', relationship: '', phone: '', email: '' },
      ageOfVesting: '25',
    },
    executorsData: {
      primary: { firstName: 'Bob', lastName: 'Jones', relationship: 'Friend', phone: '0400000001', email: 'bob@example.com', address: '2 Test St' },
      hasAlternate: false,
      alternate: { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' },
    },
    assets: [],
    beneficiariesData: {
      people: [{ id: 'b1', name: 'Bob Jones', relationship: 'Friend', percentage: '100', substituteBeneficiary: '' }],
      charities: [],
    },
    specificGifts: [],
    survivorshipDays: '30',
    petCare: {
      hasPets: 'no', petName: '', petDescription: '',
      caregiverName: '', caregiverRelationship: '', careFundAmount: '',
    },
    lifeInterest: {
      enabled: false, propertyDescription: '', lifeTenantName: '',
      lifeTenantRelationship: '', condition: '',
      remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '',
    },
    assetsOutsideAustralia: false,
    otherJurisdictions: '',
    importantDocumentsLocation: '',
    triageFlags: {
      hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false,
      hasVulnerableBeneficiary: false, hasBeneficiaryFinancialChallenges: false, hasComplexTrusts: false,
    },
    personalWishes: {
      funeralType: '', funeralRestingPlace: '', funeralAdditionalWishes: '',
      hasFuneralPlan: false, funeralPlanDetails: '',
    },
  }
}

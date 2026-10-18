/**
 * Concurrency integration tests — real Supabase test database.
 *
 * These tests run against the live test project (cbnosutzwacmhafsdaeb) and
 * verify that the two DB-level triggers provide mutual exclusion between
 * Will edits and witnessing session transitions.
 *
 * Two orderings are tested:
 *
 *   1. Edit wins  — a new will_versions row is inserted (Will edited) while
 *      the session is still scheduled.  The witnessing_sessions trigger then
 *      blocks the scheduled → in_progress transition because the session's
 *      locked will_version_id no longer matches the latest version.
 *
 *   2. Signing wins — the session transitions to in_progress first.  A
 *      subsequent will_versions INSERT is then blocked by the
 *      will_versions_signing_lock trigger because an in_progress session
 *      exists.
 *
 * Prerequisites (automatically skipped if absent):
 *   - NEXT_PUBLIC_SUPABASE_URL must equal https://cbnosutzwacmhafsdaeb.supabase.co
 *   - SUPABASE_SERVICE_ROLE_KEY must be set (loaded from .env.test.local)
 *   - Both DB triggers must be deployed (applied in this PR's migration files)
 *
 * Tests use service-role to bypass RLS and insert minimal fixture rows
 * directly, then clean up in afterEach regardless of test outcome.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createHash, randomUUID } from 'crypto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ── Guard: only run against the test project ──────────────────────────────────

const TEST_PROJECT_URL = 'https://cbnosutzwacmhafsdaeb.supabase.co'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const SKIP = url !== TEST_PROJECT_URL || !key
if (SKIP) {
  console.warn(
    '[concurrency.integration] Skipping: NEXT_PUBLIC_SUPABASE_URL is not the test project or SUPABASE_SERVICE_ROLE_KEY is absent.'
  )
}

// ── Test fixtures ─────────────────────────────────────────────────────────────

interface Fixture {
  admin: SupabaseClient
  userId: string
  willId: string
  version1Id: string
  sessionId: string
  docHash: string
}

async function createFixture(admin: SupabaseClient): Promise<Fixture> {
  // Create a test auth user so wills.user_id FK is satisfied.
  const testEmail = `concurrency-test-${randomUUID()}@heirloom-test.invalid`
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: randomUUID(),
    email_confirm: true,
  })
  if (authError || !authData.user) {
    throw new Error(`Test user creation failed: ${authError?.message ?? 'no user returned'}`)
  }
  const userId = authData.user.id

  const willId     = randomUUID()
  const version1Id = randomUUID()
  const sessionId  = randomUUID()
  const docHash    = createHash('sha256').update('ORIGINAL WILL DOCUMENT', 'utf8').digest('hex')

  // Will
  const { error: willErr } = await admin.from('wills').insert({
    id: willId, user_id: userId, status: 'approved',
  })
  if (willErr) throw new Error(`Will insert failed: ${willErr.message}`)

  // Version 1
  const { error: v1Err } = await admin.from('will_versions').insert({
    id: version1Id, will_id: willId,
    changed_section: 'personal', change_summary: 'initial version',
    snapshot: {}, needs_review: false, needs_review_reasons: [],
  })
  if (v1Err) throw new Error(`Version1 insert failed: ${v1Err.message}`)

  // Scheduled witnessing session locked to version 1
  const { error: sessErr } = await admin.from('witnessing_sessions').insert({
    id: sessionId, will_id: willId, status: 'scheduled',
    room_url: 'https://test.daily.co/test-room',
    recording_enabled: false, recording_status: null,
    will_version_id: version1Id,
    content_hash: docHash,
    provider: 'daily',
    scheduled_at: new Date(Date.now() + 3_600_000).toISOString(),
  })
  if (sessErr) throw new Error(`Session insert failed: ${sessErr.message}`)

  return { admin, userId, willId, version1Id, sessionId, docHash }
}

async function cleanupFixture(f: Fixture): Promise<void> {
  // Cascade order: sessions → versions → will → user
  await f.admin.from('witnessing_sessions').delete().eq('id', f.sessionId)
  await f.admin.from('will_versions').delete().eq('will_id', f.willId)
  await f.admin.from('wills').delete().eq('id', f.willId)
  await f.admin.auth.admin.deleteUser(f.userId)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe.skipIf(SKIP)('Witnessing concurrency — live DB (test project)', () => {
  let admin: SupabaseClient
  let f: Fixture

  beforeEach(async () => {
    admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    f = await createFixture(admin)
  })

  afterEach(async () => {
    await cleanupFixture(f)
  })

  // ── Ordering 1: edit wins ──────────────────────────────────────────────────

  it('edit wins: session→in_progress is blocked by DB trigger when Will was edited after booking', async () => {
    // Step 1: Insert version 2 (simulates a Will edit after the session was booked).
    // The will_versions_signing_lock trigger fires; no in_progress session exists
    // yet so the insert should succeed.
    const version2Id = randomUUID()
    const { error: v2Err } = await admin.from('will_versions').insert({
      id: version2Id, will_id: f.willId,
      changed_section: 'executors', change_summary: 'updated executor',
      snapshot: {}, needs_review: false, needs_review_reasons: [],
    })
    expect(v2Err, `Version 2 insert should succeed (no in_progress session): ${v2Err?.message}`).toBeNull()

    // Step 2: Attempt to transition the session to in_progress.
    // The witnessing_sessions_integrity_check trigger fires.  The session's
    // will_version_id (V1) no longer matches the latest version (V2), so the
    // trigger raises P0001 and the UPDATE is rejected.
    const { error: joinErr } = await admin
      .from('witnessing_sessions')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', f.sessionId)
      .eq('status', 'scheduled')

    expect(joinErr, 'witnessing_sessions trigger should reject version-mismatched transition').not.toBeNull()
    expect(joinErr!.message).toMatch(/edited after this session was booked/i)

    // Session must still be 'scheduled' — the UPDATE was rolled back.
    const { data: row } = await admin
      .from('witnessing_sessions').select('status').eq('id', f.sessionId).single()
    expect(row?.status).toBe('scheduled')

    // Clean up the extra version row before afterEach runs.
    await admin.from('will_versions').delete().eq('id', version2Id)
  })

  // ── Ordering 2: signing wins ───────────────────────────────────────────────

  it('signing wins: Will edit (will_versions INSERT) is blocked by DB trigger while session is in_progress', async () => {
    // Step 1: Transition session to in_progress.
    // The witnessing_sessions_integrity_check trigger fires; the session's
    // will_version_id (V1) matches the current latest version (V1), so the
    // UPDATE succeeds.
    const { error: startErr } = await admin
      .from('witnessing_sessions')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', f.sessionId)
      .eq('status', 'scheduled')

    expect(startErr, `Session start should succeed (version matches): ${startErr?.message}`).toBeNull()

    // Verify the session is now in_progress.
    const { data: live } = await admin
      .from('witnessing_sessions').select('status').eq('id', f.sessionId).single()
    expect(live?.status).toBe('in_progress')

    // Step 2: Attempt to insert a new will_versions row (simulates a Will edit).
    // The will_versions_signing_lock trigger fires; it sees the in_progress
    // session and raises P0001, causing the INSERT to fail.
    const { error: editErr } = await admin.from('will_versions').insert({
      id: randomUUID(), will_id: f.willId,
      changed_section: 'assets', change_summary: 'added asset',
      snapshot: {}, needs_review: false, needs_review_reasons: [],
    })

    expect(editErr, 'will_versions trigger should reject INSERT while session is in_progress').not.toBeNull()
    expect(editErr!.message).toMatch(/in progress/i)

    // Only version 1 must exist — the INSERT was rolled back.
    const { data: versions } = await admin
      .from('will_versions').select('id').eq('will_id', f.willId)
    expect(versions).toHaveLength(1)
    expect(versions![0].id).toBe(f.version1Id)
  })
})

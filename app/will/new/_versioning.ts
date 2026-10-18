import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { assessLegalReviewNeed } from './_legal-review'
import type { WillFormData } from './_types'

// Pure decision functions live in _lock-guard.ts (no Supabase import) so tests
// can import them without triggering supabaseAdmin initialisation.
export { _evaluateLockGuard, verifyDocumentIntegrity } from './_lock-guard'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

// ─── DB-backed lock functions ────────────────────────────────────────────────

/**
 * Pre-mutation witnessing lock. Call at the START of any write path before
 * touching normalized tables.
 *
 * Delegates to the will_edit_lock(uuid) Postgres function which, in a single
 * transaction protected by a per-will advisory lock:
 *   1. Checks for in_progress sessions → raises P0001 if any exist.
 *   2. Marks all scheduled sessions stale.
 *
 * This eliminates the TOCTOU window between the session check and the stale
 * marking that existed when both were separate application-level queries.
 *
 * - Throws without changing session state if an in_progress session exists.
 * - Fails closed on any DB error (infrastructure failure → caller must not proceed).
 */
export async function assertNoActiveSigning(willId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc('will_edit_lock', { p_will_id: willId })
  if (!error) return

  const pgError = error as { code?: string; message?: string }
  if (pgError.code === 'P0001') {
    // Business-rule exception from the DB function (in_progress session found).
    throw new Error(
      pgError.message ??
        'A witnessing session is currently in progress. Your Will is locked until the session completes.'
    )
  }
  // Any other error is an infrastructure failure — fail closed.
  throw new Error(
    'Cannot save: witnessing session status could not be verified. Please try again.'
  )
}

/**
 * Post-mutation race check. Call AFTER a successful Will mutation.
 *
 * The pre-mutation RPC (will_edit_lock) already marked any scheduled sessions
 * stale. This function handles only the residual race window: a session that
 * transitioned from scheduled → in_progress DURING the mutation writes
 * (after the RPC committed but before the mutations completed).
 *
 * DB failures are logged but do not throw — the Will mutation already
 * succeeded. The independent version-ID and hash checks in getJoinToken
 * are the authoritative final guard.
 */
export async function markSessionsStaleAfterEdit(willId: string): Promise<void> {
  const { data: raceConflicts, error } = await supabaseAdmin
    .from('witnessing_sessions')
    .select('id')
    .eq('will_id', willId)
    .eq('status', 'in_progress')

  if (error) {
    console.error('[markSessionsStaleAfterEdit] race check query failed for will', willId, error)
    return
  }

  const raceIds = (raceConflicts ?? []).map((s) => (s as { id: string }).id)
  if (raceIds.length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('witnessing_sessions')
      .update({ version_stale: true })
      .in('id', raceIds)
    if (updateError) {
      console.error('[markSessionsStaleAfterEdit] race stale update failed for will', willId, updateError)
    }
  }
}

// ─── Version snapshot ────────────────────────────────────────────────────────

/**
 * Snapshots the current will state into version history. Session-locking is
 * the caller's responsibility via assertNoActiveSigning (before mutations).
 */
export async function recordVersion(
  supabase: SupabaseClient,
  willId: string,
  changedSection: string | null,
  changeSummary: string,
  formData: WillFormData,
  runReview: boolean
): Promise<{ versionId: string | null }> {
  const { needsReview, reasons } = runReview
    ? await assessLegalReviewNeed(formData)
    : { needsReview: false, reasons: [] as string[] }

  const { data } = await supabase.from('will_versions').insert({
    will_id: willId,
    changed_section: changedSection,
    change_summary: changeSummary,
    snapshot: formData,
    needs_review: needsReview,
    needs_review_reasons: reasons,
  }).select('id').single()

  if (runReview) {
    await supabase
      .from('wills')
      .update({ needs_review: needsReview, needs_review_reasons: reasons })
      .eq('id', willId)
  }

  return { versionId: (data?.id as string) ?? null }
}

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { assessLegalReviewNeed } from './_legal-review'
import type { WillFormData } from './_types'

// Pure decision functions live in _lock-guard.ts (no Supabase import) so tests
// can import them without triggering supabaseAdmin initialisation.
export { _evaluateLockGuard, verifyDocumentIntegrity } from './_lock-guard'
import { _evaluateLockGuard } from './_lock-guard'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

const ACTIVE_STATUSES = ['scheduled', 'in_progress'] as const

// ─── DB-backed lock functions ────────────────────────────────────────────────

/**
 * Pre-mutation witnessing lock. Call at the START of any write path that
 * mutates Will data, BEFORE touching normalized tables.
 *
 * - Fails closed if the DB query errors.
 * - Throws without changing any session state if an in_progress session exists.
 * - Returns scheduledIds: IDs of sessions that were 'scheduled' at check time.
 *   Pass these to markSessionsStaleAfterEdit once the mutation succeeds.
 */
export async function assertNoActiveSigning(willId: string): Promise<{ scheduledIds: string[] }> {
  const { data: sessions, error } = await supabaseAdmin
    .from('witnessing_sessions')
    .select('id, status')
    .eq('will_id', willId)
    .in('status', ACTIVE_STATUSES)

  return _evaluateLockGuard(
    (sessions ?? null) as { id: string; status: string }[] | null,
    error
  )
}

/**
 * Post-mutation stale marking. Call AFTER a successful Will mutation with the
 * scheduledIds returned by assertNoActiveSigning.
 *
 * Also performs a post-write race check: if any session went in_progress
 * during the write window, it is marked stale here as belt-and-braces.
 * getJoinToken independently blocks stale sessions via version-ID mismatch.
 *
 * DB failures are logged and do not throw — the Will mutation already
 * succeeded and cannot be rolled back from here.
 */
export async function markSessionsStaleAfterEdit(
  willId: string,
  scheduledIds: string[]
): Promise<void> {
  if (scheduledIds.length > 0) {
    const { error } = await supabaseAdmin
      .from('witnessing_sessions')
      .update({ version_stale: true })
      .in('id', scheduledIds)
    if (error) {
      console.error('[markSessionsStaleAfterEdit] stale update failed for will', willId, error)
    }
  }

  // Race check: catch any session that transitioned to in_progress during the
  // write window between assertNoActiveSigning and the end of the mutation.
  const { data: raceConflicts } = await supabaseAdmin
    .from('witnessing_sessions')
    .select('id')
    .eq('will_id', willId)
    .eq('status', 'in_progress')

  const raceIds = (raceConflicts ?? []).map((s) => (s as { id: string }).id)
  if (raceIds.length > 0) {
    const { error } = await supabaseAdmin
      .from('witnessing_sessions')
      .update({ version_stale: true })
      .in('id', raceIds)
    if (error) {
      console.error('[markSessionsStaleAfterEdit] race stale update failed for will', willId, error)
    }
  }
}

// ─── Version snapshot ────────────────────────────────────────────────────────

/**
 * Snapshots the current will state into version history. No longer checks for
 * active signing sessions — that is the caller's responsibility via
 * assertNoActiveSigning (which must run before any table mutation).
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

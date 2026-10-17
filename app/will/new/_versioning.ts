import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { assessLegalReviewNeed } from './_legal-review'
import type { WillFormData } from './_types'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

const ACTIVE_STATUSES = ['scheduled', 'in_progress'] as const

/**
 * Snapshots the current will state into version history. The AI legal-review
 * check only runs when `runReview` is true  -  during the initial 7-step
 * intake wizard the data is incomplete at every step, so review is deferred
 * until the will is first completed (see completeWill). Post-completion
 * amendments (wizard edits or applied chat proposals) always run it, since
 * those are meaningful changes to an otherwise-complete document.
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

  // Block saves while a signing session is live — the witnesses and testator
  // must be working from the same document throughout the call.
  const { data: activeSessions } = await supabaseAdmin
    .from('witnessing_sessions')
    .select('id, status')
    .eq('will_id', willId)
    .in('status', ACTIVE_STATUSES)

  const inProgress = (activeSessions ?? []).filter((s) => s.status === 'in_progress')
  if (inProgress.length > 0) {
    // Mark stale so getJoinToken hard-blocks even if this error is swallowed upstream.
    await supabaseAdmin
      .from('witnessing_sessions')
      .update({ version_stale: true })
      .in('id', inProgress.map((s) => s.id))
    throw new Error(
      'A witnessing session is currently in progress. Your Will is locked until the session completes.'
    )
  }

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

  // Mark any scheduled sessions stale now that a newer version exists.
  const scheduled = (activeSessions ?? []).filter((s) => s.status === 'scheduled')
  if (scheduled.length > 0) {
    const { error: staleErr } = await supabaseAdmin
      .from('witnessing_sessions')
      .update({ version_stale: true })
      .in('id', scheduled.map((s) => s.id))
    if (staleErr) {
      console.error('[recordVersion] Failed to mark sessions stale for will', willId, staleErr)
    }
  }

  return { versionId: (data?.id as string) ?? null }
}

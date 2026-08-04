import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { assessLegalReviewNeed } from './_legal-review'
import type { WillFormData } from './_types'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

/**
 * Snapshots the current will state into version history. The AI legal-review
 * check only runs when `runReview` is true — during the initial 7-step
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
): Promise<void> {
  const { needsReview, reasons } = runReview
    ? await assessLegalReviewNeed(formData)
    : { needsReview: false, reasons: [] as string[] }

  await supabase.from('will_versions').insert({
    will_id: willId,
    changed_section: changedSection,
    change_summary: changeSummary,
    snapshot: formData,
    needs_review: needsReview,
    needs_review_reasons: reasons,
  })

  if (runReview) {
    await supabase
      .from('wills')
      .update({ needs_review: needsReview, needs_review_reasons: reasons })
      .eq('id', willId)
  }
}

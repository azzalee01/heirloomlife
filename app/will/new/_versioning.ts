import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { assessLegalReviewNeed } from './_legal-review'
import type { WillFormData } from './_types'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

/**
 * Snapshots the current will state into version history and refreshes the
 * AI legal-review flag. Called after every confirmed change (wizard step
 * save or applied chat amendment) so history stays complete automatically.
 */
export async function recordVersion(
  supabase: SupabaseClient,
  willId: string,
  changedSection: string | null,
  changeSummary: string,
  formData: WillFormData
): Promise<void> {
  const { needsReview, reasons } = await assessLegalReviewNeed(formData)

  await supabase.from('will_versions').insert({
    will_id: willId,
    changed_section: changedSection,
    change_summary: changeSummary,
    snapshot: formData,
    needs_review: needsReview,
    needs_review_reasons: reasons,
  })

  await supabase
    .from('wills')
    .update({ needs_review: needsReview, needs_review_reasons: reasons })
    .eq('id', willId)
}

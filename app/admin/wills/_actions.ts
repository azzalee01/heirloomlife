'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { sendAmendmentApprovedEmail, sendAmendmentRejectedEmail } from '@/src/lib/email'

async function requireStaffAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role?: string } | null)?.role !== 'staff') {
    throw new Error('Forbidden')
  }

  return user
}

/**
 * Atomically promote a pending amendment to the live Will.
 *
 * Calls the promote_will_amendment() Postgres function which, in a single
 * transaction:
 *   - Verifies the version is still pending_review and has document_text
 *   - Copies document_text → wills.document_text
 *   - Sets wills.status = 'approved', records reviewer + timestamp
 *   - Marks the version row as 'approved' (historical record preserved)
 */
export async function promoteAmendment(versionId: string): Promise<void> {
  const user = await requireStaffAuth()

  const { error } = await supabaseAdmin.rpc('promote_will_amendment', {
    p_version_id: versionId,
    p_reviewed_by: user.id,
  })

  if (error) throw new Error(error.message)

  // Look up the customer and notify them (best-effort)
  const { data: version } = await supabaseAdmin
    .from('will_versions')
    .select('will_id')
    .eq('id', versionId)
    .maybeSingle()

  if (version) {
    const { data: will } = await supabaseAdmin
      .from('wills')
      .select('profiles(email, full_name)')
      .eq('id', (version as { will_id: string }).will_id)
      .maybeSingle()

    const profile = (will as unknown as { profiles: { email: string; full_name: string | null } | null } | null)?.profiles
    if (profile?.email) {
      sendAmendmentApprovedEmail({ to: profile.email, name: profile.full_name }).catch(() => {})
    }
  }
}

export async function rejectAmendment(versionId: string, reason: string): Promise<void> {
  await requireStaffAuth()

  // Mark the version as rejected
  const { data: version, error: vErr } = await supabaseAdmin
    .from('will_versions')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', versionId)
    .eq('status', 'pending_review')
    .select('will_id')
    .single()

  if (vErr || !version) throw new Error(vErr?.message ?? 'Version not found or already actioned')

  const willId = (version as { will_id: string }).will_id

  // Return the Will to approved so the customer can still download their last valid version
  const { error: wErr } = await supabaseAdmin
    .from('wills')
    .update({ status: 'approved', needs_review: true, needs_review_reasons: [reason] })
    .eq('id', willId)

  if (wErr) throw new Error(wErr.message)

  // Notify the customer (best-effort)
  const { data: will } = await supabaseAdmin
    .from('wills')
    .select('profiles(email, full_name)')
    .eq('id', willId)
    .maybeSingle()

  const profile = (will as unknown as { profiles: { email: string; full_name: string | null } | null } | null)?.profiles
  if (profile?.email) {
    sendAmendmentRejectedEmail({ to: profile.email, name: profile.full_name, reason }).catch(() => {})
  }
}

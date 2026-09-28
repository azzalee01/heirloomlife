'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

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
}

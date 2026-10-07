'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

async function requireStaffAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as { role?: string } | null)?.role !== 'staff') throw new Error('Forbidden')
  return user
}

export async function promoteClause(clauseVersionId: string): Promise<void> {
  await requireStaffAuth()
  const { error } = await supabaseAdmin
    .from('clause_versions')
    .update({ status: 'production' })
    .eq('id', clauseVersionId)
    .eq('status', 'draft')
  if (error) throw new Error(error.message)
}

export async function retireClause(clauseVersionId: string): Promise<void> {
  await requireStaffAuth()
  const { error } = await supabaseAdmin
    .from('clause_versions')
    .update({ status: 'retired' })
    .eq('id', clauseVersionId)
  if (error) throw new Error(error.message)
}

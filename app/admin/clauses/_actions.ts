'use server'

import { supabaseAdmin } from '@/src/lib/supabase-server'
import { requireHost } from '@/src/lib/appointments/server'

export async function promoteClause(clauseVersionId: string): Promise<void> {
  await requireHost()
  const { error } = await supabaseAdmin
    .from('clause_versions')
    .update({ status: 'production' })
    .eq('id', clauseVersionId)
    .eq('status', 'draft')
  if (error) throw new Error(error.message)
}

export async function retireClause(clauseVersionId: string): Promise<void> {
  await requireHost()
  const { error } = await supabaseAdmin
    .from('clause_versions')
    .update({ status: 'retired' })
    .eq('id', clauseVersionId)
  if (error) throw new Error(error.message)
}

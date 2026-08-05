'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { renderWillText } from '@/app/will/new/_render'
import type { WillFormData } from '@/app/will/new/_types'

async function getOwnedWill() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id, subscription_status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
  const will = willRows?.[0] as { id: string; subscription_status: string } | undefined
  if (!will) throw new Error('No will found')

  return { supabase, willId: will.id, subscriptionStatus: will.subscription_status }
}

export async function requestLawyerReview(): Promise<{ paymentStatus: 'free' | 'unpaid' }> {
  const { supabase, willId, subscriptionStatus } = await getOwnedWill()
  const paymentStatus = subscriptionStatus === 'active' ? ('free' as const) : ('unpaid' as const)

  const { error } = await supabase.from('lawyer_review_requests').insert({
    will_id: willId,
    status: 'pending',
    payment_status: paymentStatus,
  })
  if (error) throw new Error(error.message)

  return { paymentStatus }
}

export async function getVersionSnapshotText(versionId: string): Promise<{ text: string; createdAt: string; changeSummary: string }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Row-level security on will_versions already restricts this to versions
  // belonging to a will the current user owns.
  const { data, error } = await supabase
    .from('will_versions')
    .select('snapshot, created_at, change_summary')
    .eq('id', versionId)
    .single()
  if (error || !data) throw new Error('Version not found')

  return {
    text: renderWillText(data.snapshot as WillFormData),
    createdAt: data.created_at as string,
    changeSummary: data.change_summary as string,
  }
}

'use server'

import { supabaseAdmin } from '@/src/lib/supabase-server'

export interface ActivePartner {
  id: string
  name: string
  abn: string
  logoUrl: string | null
}

// Active charity partners for the premium picker in StepBeneficiaries.
// Read via service role (charity_partners has no user-facing RLS); only the
// public-safe fields are returned. ABN comes straight from the verified record —
// it is never hardcoded or typed by the customer for a partner gift.
export async function listActivePartners(): Promise<ActivePartner[]> {
  const { data, error } = await supabaseAdmin
    .from('charity_partners')
    .select('id, name, abn, logo_url')
    .eq('active', true)
    .order('name')
  if (error) {
    console.error('[listActivePartners] failed', error.message)
    return []
  }
  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    abn: p.abn as string,
    logoUrl: (p.logo_url as string | null) ?? null,
  }))
}

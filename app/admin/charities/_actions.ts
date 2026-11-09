'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { requireHost } from '@/src/lib/appointments/server'

// Derive a referral code from a charity name when the admin doesn't supply one.
// e.g. "Royal Flying Doctor Service" → "ROYALFLYINGDOCTOR".
function slugCode(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24) || 'PARTNER'
}

export async function createPartner(formData: FormData): Promise<void> {
  await requireHost()

  const name = String(formData.get('name') ?? '').trim()
  // ABN is the admin's responsibility to verify against ACNC before creating —
  // it flows straight into the legal document, so it is never machine-generated.
  const abn = String(formData.get('abn') ?? '').trim()
  const contactEmail = String(formData.get('contact_email') ?? '').trim() || null
  const logoUrl = String(formData.get('logo_url') ?? '').trim() || null
  const rawCode = String(formData.get('referral_code') ?? '').trim()
  const active = formData.get('active') === 'on'

  if (!name) throw new Error('Charity name is required')
  if (!abn) throw new Error('A verified ABN is required')

  const referralCode = (rawCode || slugCode(name)).toUpperCase().replace(/\s+/g, '')

  const { error } = await supabaseAdmin.from('charity_partners').insert({
    name,
    abn,
    contact_email: contactEmail,
    logo_url: logoUrl,
    referral_code: referralCode,
    active,
    // No-fee model: billing columns are legacy. fee defaults to 0.
    billing_model: null,
  })

  if (error) {
    if (error.code === '23505') throw new Error(`Referral code "${referralCode}" is already in use`)
    throw new Error(error.message)
  }

  revalidatePath('/admin/charities')
}

export async function setPartnerActive(partnerId: string, active: boolean): Promise<void> {
  if (!partnerId || typeof partnerId !== 'string') return
  await requireHost()
  const { error } = await supabaseAdmin
    .from('charity_partners')
    .update({ active })
    .eq('id', partnerId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/charities')
}

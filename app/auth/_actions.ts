'use server'

import { redirect } from 'next/navigation'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { sanitizeNext, destFor } from './_shared'

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function ensureProfile(supabase: SupabaseServer): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').upsert(
    { id: user.id, email: user.email ?? '', full_name: user.user_metadata?.full_name ?? '' },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}

// POST-only. Invoked ONLY by the "Continue to Heirloom Life" button on the
// /auth/confirm interstitial — never on GET. This is the fix for corporate email
// link scanners (Microsoft Safe Links / Defender) that pre-fetch the URL: a GET
// renders the interstitial without touching the token, so the one-time token
// survives until the real user clicks.
export async function confirmOtpAction(formData: FormData): Promise<void> {
  const tokenHash = String(formData.get('token_hash') ?? '')
  const type = String(formData.get('type') ?? '') as EmailOtpType
  const next = sanitizeNext(String(formData.get('next') ?? ''))
  if (!tokenHash || !type) redirect('/auth/login?error=link')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error) redirect('/auth/login?error=expired')

  await ensureProfile(supabase)
  redirect(destFor(next))
}

// POST-only PKCE exchange for the /auth/callback ?code flow. Same rationale:
// the exchange happens on the user's button click, not on a scanner's GET.
export async function exchangeCodeAction(formData: FormData): Promise<void> {
  const code = String(formData.get('code') ?? '')
  const next = sanitizeNext(String(formData.get('next') ?? ''))
  if (!code) redirect('/auth/login?error=link')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) redirect('/auth/login?error=expired')

  await ensureProfile(supabase)
  redirect(destFor(next))
}

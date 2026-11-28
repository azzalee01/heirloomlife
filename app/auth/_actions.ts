'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { sanitizeNext, destFor } from './_shared'

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>

// Short-lived, httpOnly, Secure, SameSite=Lax, scoped to /auth. Holds the email a
// magic link was last sent to, so the expired-link screen can one-click resend.
const AUTH_EMAIL_COOKIE = 'hl_auth_email'
const AUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/auth',
}

export async function rememberAuthEmail(email: string): Promise<void> {
  if (!email) return
  const c = await cookies()
  c.set(AUTH_EMAIL_COOKIE, email, { ...AUTH_COOKIE_OPTS, maxAge: 3600 })
}

async function clearAuthEmailCookie(): Promise<void> {
  const c = await cookies()
  c.set(AUTH_EMAIL_COOKIE, '', { ...AUTH_COOKIE_OPTS, maxAge: 0 })
}

// Called by the client after a successful 6-digit-code sign-in (that path sets
// the session on the client, so it clears the remembered email via this action).
export async function clearAuthEmail(): Promise<void> {
  await clearAuthEmailCookie()
}

// One-click resend from the expired/invalid-link screen. Reads the remembered
// email server-side (the cookie is httpOnly, so the client can't), resends, and
// returns to a "we re-sent it" state.
export async function resendAuthLink(): Promise<void> {
  const c = await cookies()
  const email = c.get(AUTH_EMAIL_COOKIE)?.value
  if (!email) redirect('/auth/login?error=link')

  const supabase = await createSupabaseServerClient()
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? '').replace(/\/$/, '')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard` },
  })
  if (error) redirect('/auth/login?error=link')
  redirect('/auth/login?resent=1')
}

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
  await clearAuthEmailCookie()
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
  await clearAuthEmailCookie()
  redirect(destFor(next))
}

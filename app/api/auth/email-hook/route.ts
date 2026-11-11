import { NextResponse, type NextRequest } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { sendAuthEmail } from '@/src/lib/auth-email'

export const dynamic = 'force-dynamic'

// Supabase "Send Email" auth hook.
// When enabled, Supabase stops sending its own (unbranded) auth emails and POSTs
// here instead. We verify the Standard Webhooks signature, then send a branded
// Heirloom email via Resend. The link points at /auth/confirm (token_hash flow)
// which is cross-device safe — see app/auth/confirm/route.ts.
//
// Required env: SEND_EMAIL_HOOK_SECRET (the "v1,whsec_..." secret Supabase shows
// when you enable the hook). RESEND_API_KEY + RESEND_FROM_ADDRESS are reused.

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

// Only allow internal, single-slash paths through to the confirm redirect.
function sanitizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

// Supabase email_action_type -> verifyOtp type (EmailOtpType). The /auth/confirm
// route passes this straight to supabase.auth.verifyOtp({ type }).
function otpType(action: string): string {
  switch (action) {
    case 'signup': return 'signup'
    case 'invite': return 'invite'
    case 'magiclink': return 'magiclink'
    case 'recovery': return 'recovery'
    case 'email_change':
    case 'email_change_new':
    case 'email_change_current': return 'email_change'
    default: return 'email'
  }
}

interface EmailHookPayload {
  user: { email?: string }
  email_data: {
    token_hash: string
    token_hash_new?: string
    redirect_to?: string
    email_action_type: string
    site_url?: string
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET
  if (!secret) {
    console.error('SEND_EMAIL_HOOK_SECRET is not set — rejecting auth email hook')
    return NextResponse.json({ error: { http_code: 500, message: 'Email hook not configured' } }, { status: 500 })
  }

  const raw = await request.text()

  // Verify the Standard Webhooks signature over the raw body. The lib strips the
  // "whsec_" prefix itself; strip Supabase's leading "v1," wrapper first.
  let payload: EmailHookPayload
  try {
    const wh = new Webhook(secret.replace(/^v1,/, ''))
    payload = wh.verify(raw, {
      'webhook-id': request.headers.get('webhook-id') ?? '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
      'webhook-signature': request.headers.get('webhook-signature') ?? '',
    }) as EmailHookPayload
  } catch (err) {
    console.error('Auth email hook signature verification failed:', err)
    return NextResponse.json({ error: { http_code: 401, message: 'Invalid signature' } }, { status: 401 })
  }

  const to = payload.user?.email
  const { email_action_type: action, token_hash, token_hash_new, redirect_to } = payload.email_data
  if (!to || !token_hash) {
    return NextResponse.json({ error: { http_code: 400, message: 'Malformed payload' } }, { status: 400 })
  }

  // Carry the post-auth destination from the original signInWithOtp emailRedirectTo
  // (e.g. /auth/callback?next=/will/new) through to the confirm redirect.
  let next = '/dashboard'
  if (redirect_to) {
    try {
      next = sanitizeNext(new URL(redirect_to).searchParams.get('next'))
    } catch {}
  }

  // Always build the link on OUR domain — /auth/confirm is our route. Never use
  // the payload's site_url (it resolves to the Supabase API URL, which would leak
  // a *.supabase.co link into the email).
  const base = APP_URL
  const hash = action === 'email_change_new' && token_hash_new ? token_hash_new : token_hash
  const confirmUrl =
    `${base}/auth/confirm?token_hash=${encodeURIComponent(hash)}` +
    `&type=${encodeURIComponent(otpType(action))}` +
    `&next=${encodeURIComponent(next)}`

  try {
    await sendAuthEmail({ to, action, confirmUrl })
  } catch (err) {
    console.error(`Auth email hook: failed to send ${action} email to ${to}:`, err)
    return NextResponse.json({ error: { http_code: 500, message: 'Failed to send email' } }, { status: 500 })
  }

  // Empty 200 tells Supabase the email was handled.
  return NextResponse.json({})
}

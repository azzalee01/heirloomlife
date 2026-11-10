import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'

// Only allow internal, single-slash paths as a redirect target (no open redirects).
function sanitizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

// Magic-link / OTP callback (same-device PKCE flow).
// Supabase redirects here with ?code=... after the user clicks the email link.
// We exchange the code for a session server-side, which is far more reliable than
// the previous client-only getSession() (that silently bounced failures to the
// password login page). The cross-device path lives in /auth/confirm.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=link`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Expired or already-used link, or the verifier cookie isn't on this device.
    return NextResponse.redirect(`${origin}/auth/login?error=expired`)
  }

  // Belt-and-suspenders: ensure a profiles row exists (a DB trigger normally does
  // this, but this covers accounts that predate it).
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? '',
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }

  // The intro animation flag can't be set in sessionStorage from the server, so
  // carry it as a query param the dashboard reads once (see IntroAnimation).
  const dest = next === '/dashboard' ? '/dashboard?welcome=1' : next
  return NextResponse.redirect(`${origin}${dest}`)
}

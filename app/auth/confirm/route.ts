import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'

// Only allow internal, single-slash paths as a redirect target (no open redirects).
function sanitizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

// Cross-device-safe magic-link verification.
// Unlike the PKCE ?code flow (which needs the verifier cookie on the SAME device),
// verifyOtp({ token_hash }) works when the link is opened on a different device or
// webview — i.e. the common "tapped the link in my phone's email app" case.
// The branded Supabase email template points here:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = sanitizeNext(searchParams.get('next'))

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/auth/login?error=link`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=expired`)
  }

  // Ensure a profiles row exists (covers accounts predating the DB trigger).
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

  const dest = next === '/dashboard' ? '/dashboard?welcome=1' : next
  return NextResponse.redirect(`${origin}${dest}`)
}

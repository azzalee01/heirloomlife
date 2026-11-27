import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { confirmOtpAction } from '../_actions'
import { sanitizeNext, destFor } from '../_shared'
import AuthCard from '../_components/AuthCard'
import ContinueButton from '../_components/ContinueButton'

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Cross-device magic-link confirmation. This page NEVER verifies the token on
// GET — it only renders an interstitial. verifyOtp runs in confirmOtpAction,
// triggered by the "Continue" button (a user POST), so corporate link scanners
// that pre-fetch the URL can't burn the one-time token. See ../_actions.ts.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>
}) {
  const sp = await searchParams
  const tokenHash = sp.token_hash ?? ''
  const type = sp.type ?? ''
  const next = sanitizeNext(sp.next)

  // Already signed in? Skip the interstitial — just go where they were headed.
  // This is a session lookup, NOT token verification, so it never consumes the
  // one-time token (and scanners have no session, so they still see the page).
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(destFor(next))

  const valid = Boolean(tokenHash && type)

  if (!valid) {
    return (
      <AuthCard heading="This link isn’t valid" sub="The sign-in link is missing information or has already been used.">
        <Link
          href="/auth/login?error=link"
          className="inline-block w-full py-3 px-4 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--teal)' }}
        >
          Get a new sign-in link
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard heading="Confirm it’s you" sub="For your security, confirm this is you to finish signing in.">
      <form action={confirmOtpAction} className="space-y-3">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next} />
        <ContinueButton label="Continue to Heirloom Life" />
      </form>
      <p className="mt-4 text-xs text-[var(--neutral)]">
        Trouble? <Link href="/auth/login?error=link" className="font-medium text-[var(--teal)]">Get a new link</Link>
      </p>
    </AuthCard>
  )
}

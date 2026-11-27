import type { Metadata } from 'next'
import Link from 'next/link'
import { exchangeCodeAction } from '../_actions'
import { sanitizeNext } from '../_shared'
import AuthCard from '../_components/AuthCard'
import ContinueButton from '../_components/ContinueButton'

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Same-device PKCE callback. Like /auth/confirm, this NEVER exchanges the code on
// GET — only exchangeCodeAction (the "Continue" button POST) does — so a scanner's
// pre-fetch can't consume the code. See ../_actions.ts.
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>
}) {
  const sp = await searchParams
  const code = sp.code ?? ''
  const next = sanitizeNext(sp.next)

  if (!code) {
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
      <form action={exchangeCodeAction} className="space-y-3">
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="next" value={next} />
        <ContinueButton label="Continue to Heirloom Life" />
      </form>
      <p className="mt-4 text-xs text-[var(--neutral)]">
        Trouble? <Link href="/auth/login?error=link" className="font-medium text-[var(--teal)]">Get a new link</Link>
      </p>
    </AuthCard>
  )
}

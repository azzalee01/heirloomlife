'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'
import { destFor } from '../_shared'
import { verifyEmailCode } from '../_verify-code'
import { clearAuthEmail } from '../_actions'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'

// Shown after a magic link is sent. Offers the 6-digit code as a fallback (so a
// user whose link was consumed by a corporate scanner can still get in) plus a
// one-click resend. `signUp` carries the name so a resend recreates the signup.
export default function CheckYourEmail({
  email,
  next,
  signUp,
}: {
  email: string
  next: string
  signUp?: { fullName: string }
}) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    // Email OTP code verification (works cross-device — the token isn't device-bound).
    // Sign-up uses type 'signup', sign-in uses 'email', with fallback either way.
    const { error } = await verifyEmailCode(
      (p) => supabase.auth.verifyOtp(p),
      { email, token: code.trim(), isSignUp: Boolean(signUp) }
    )
    if (error) {
      setError('That code is invalid or has expired. Check the most recent email, or resend below.')
      setLoading(false)
      return
    }
    await clearAuthEmail() // signed in — drop the remembered-email cookie
    router.push(destFor(next))
  }

  async function resend() {
    setError(null)
    setResent(false)
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const options = signUp
      ? { data: { full_name: signUp.fullName }, emailRedirectTo }
      : { shouldCreateUser: false, emailRedirectTo }
    const { error } = await supabase.auth.signInWithOtp({ email, options })
    if (error) setError(error.message)
    else setResent(true)
  }

  return (
    <div className="text-left">
      <p className="text-sm text-[var(--neutral)] text-center mb-6">
        We sent a sign-in link and a 6-digit code to{' '}
        <strong className="text-[var(--ink)]">{email}</strong>.
      </p>

      <form onSubmit={verifyCode} className="space-y-3">
        <label htmlFor="otp" className="block text-sm font-medium text-[var(--ink)]">
          Enter the 6-digit code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className={inp}
          placeholder="123456"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2">{error}</p>
        )}
        {resent && !error && (
          <p className="text-sm text-[var(--teal-deep)]">A fresh link and code are on their way.</p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-3 px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--teal)' }}
        >
          {loading ? 'Verifying…' : 'Verify code'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--neutral)]">
        Didn’t get it, or your link expired?{' '}
        <button type="button" onClick={resend} className="font-medium text-[var(--teal)]">
          Resend
        </button>
      </p>
    </div>
  )
}

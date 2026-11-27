'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase'
import { sanitizeNext } from '../_shared'
import CheckYourEmail from '../_components/CheckYourEmail'

const LINK_ERRORS: Record<string, string> = {
  expired: 'That sign-in link has expired or was already used. Get a fresh one below.',
  link: 'That sign-in link was invalid. Get a new one below.',
}

const AUTH_EMAIL_COOKIE = 'hl_auth_email'

function rememberEmail(email: string) {
  document.cookie = `${AUTH_EMAIL_COOKIE}=${encodeURIComponent(email)}; path=/auth; max-age=3600; samesite=lax`
}
function readRememberedEmail(): string | null {
  const m = document.cookie.match(/(?:^|; )hl_auth_email=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sentNext, setSentNext] = useState('/dashboard')
  const [error, setError] = useState<string | null>(() => {
    try {
      const code = new URLSearchParams(window.location.search).get('error')
      return code ? LINK_ERRORS[code] ?? null : null
    } catch {
      return null
    }
  })
  // When we arrive from an expired/invalid link, offer one-click resend if we
  // remember the email the link was sent to.
  const [rememberedEmail] = useState<string | null>(() => {
    try {
      const hasError = new URLSearchParams(window.location.search).get('error')
      return hasError ? readRememberedEmail() : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  function currentNext(): string {
    return sanitizeNext(new URLSearchParams(window.location.search).get('next'))
  }

  async function sendLink(toEmail: string): Promise<string | null> {
    const next = currentNext()
    const { error } = await supabase.auth.signInWithOtp({
      email: toEmail,
      // shouldCreateUser: false so a typo'd/unknown email doesn't silently create
      // an empty account — we tell them to sign up instead.
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) return error.message
    rememberEmail(toEmail)
    setSentNext(next)
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await sendLink(email)
    if (err) {
      setError(/not.*found|signups? not allowed|user.*not/i.test(err)
        ? "We couldn't find an account for that email. Create one instead."
        : err)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  async function resendFromError() {
    if (!rememberedEmail) return
    setError(null)
    const err = await sendLink(rememberedEmail)
    if (err) { setError(err); return }
    setEmail(rememberedEmail)
    setSent(true)
  }

  const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--paper)]">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-2xl"
            style={{ color: 'var(--teal)', fontFamily: "var(--font-display)", fontStyle: 'italic', textDecoration: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ marginBottom: 2, flexShrink: 0 }}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Heirloom Life
          </Link>

          <h1 className="mt-5 text-2xl font-semibold text-[var(--ink)]">
            {sent ? 'Check your email' : 'Welcome back'}
          </h1>
          {!sent && <p className="mt-2 text-sm text-[var(--neutral)]">Sign in with a link or code  -  no password needed</p>}
        </div>

        {sent ? (
          <CheckYourEmail email={email} next={sentNext} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inp}
                placeholder="jane@example.com"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2">
                <p>{error}</p>
                {rememberedEmail && (
                  <button
                    type="button"
                    onClick={resendFromError}
                    className="mt-1.5 font-semibold text-[var(--teal)]"
                  >
                    Resend sign-in link to {rememberedEmail}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--teal)' }}
            >
              {loading ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--neutral)]">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-[var(--teal)]">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

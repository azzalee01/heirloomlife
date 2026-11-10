'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase'

// Only allow internal, single-slash paths as a post-login destination.
function sanitizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

const LINK_ERRORS: Record<string, string> = {
  expired: 'That sign-in link has expired or was already used. Enter your email for a fresh one.',
  link: 'That sign-in link was invalid. Enter your email and we’ll send a new one.',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  // Surface callback failures (e.g. a dead/expired link) instead of a silent bounce.
  const [error, setError] = useState<string | null>(() => {
    try {
      const code = new URLSearchParams(window.location.search).get('error')
      return code ? LINK_ERRORS[code] ?? null : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const next = sanitizeNext(new URLSearchParams(window.location.search).get('next'))
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

    // Passwordless sign-in. shouldCreateUser: false so a typo'd/unknown email
    // doesn't silently create a brand-new empty account — we tell them to sign up.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      setError(
        /not.*found|signups? not allowed|user.*not/i.test(error.message)
          ? "We couldn't find an account for that email. Create one instead."
          : error.message
      )
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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

          {sent ? (
            <>
              <h1 className="mt-5 text-2xl font-semibold text-[var(--ink)]">Check your email</h1>
              <p className="mt-2 text-sm text-[var(--neutral)]">
                We sent a sign-in link to <strong className="text-[var(--ink)]">{email}</strong>.<br/>
                Click it to open your account. You can close this tab.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-2xl font-semibold text-[var(--ink)]">Welcome back</h1>
              <p className="mt-2 text-sm text-[var(--neutral)]">Sign in with a link  -  no password needed</p>
            </>
          )}
        </div>

        {!sent && (
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
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--teal)' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--teal-deep)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--teal)' }}
            >
              {loading ? 'Sending link…' : 'Email me a sign-in link'}
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

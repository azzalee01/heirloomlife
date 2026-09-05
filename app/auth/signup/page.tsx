'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
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
            style={{ color: 'var(--teal)', fontFamily: "var(--font-display)", fontStyle: 'italic', fontSize: '1.5rem', textDecoration: 'none' }}
          >
            Heirloom Life
          </Link>

          {sent ? (
            <>
              <h1 className="mt-5 text-2xl font-semibold text-[var(--ink)]">Check your email</h1>
              <p className="mt-2 text-sm text-[var(--neutral)]">
                We sent a link to <strong className="text-[var(--ink)]">{email}</strong>.<br/>
                Click it to open your account.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-2xl font-semibold text-[var(--ink)]">Start your Will</h1>
              <p className="mt-2 text-sm text-[var(--neutral)]">Create your account  -  no password needed</p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inp}
                placeholder="Jane Smith"
              />
            </div>

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
              {loading ? 'Sending link…' : 'Continue'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--neutral)]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-[var(--teal)]">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

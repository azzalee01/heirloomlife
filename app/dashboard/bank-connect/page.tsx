'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BankConnectPage() {
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const resp = await fetch('/api/basiq/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(text || 'Connection failed')
      }
      const { url } = await resp.json() as { url: string }
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-sm">
        <Link href="/dashboard" className="text-xs font-medium mb-8 inline-block" style={{ color: 'var(--neutral)' }}>
          ← Back to dashboard
        </Link>

        <div className="rounded-lg border bg-white p-8" style={{ borderColor: 'var(--line)' }}>
          <div className="mb-1 h-[3px] w-8 rounded-full" style={{ background: 'var(--teal)' }} />
          <h1 className="mt-4 text-lg font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            Connect a bank account
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
            You&apos;ll be redirected to a secure consent page operated by Basiq, a CDR-accredited data intermediary. Heirloom never sees your banking credentials.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
                Mobile number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+61 4xx xxx xxx"
                required
                className="w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                  background: 'var(--paper)',
                }}
              />
              <p className="mt-1.5 text-xs" style={{ color: 'var(--neutral)' }}>
                Used by Basiq to verify your identity during the consent process.
              </p>
            </div>

            {error && (
              <p className="text-xs font-medium" style={{ color: '#b91c1c' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !mobile.trim()}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Redirecting…' : 'Continue to secure consent →'}
            </button>
          </form>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
            We request account name, type, and balance only. No transactions. Your consent can be revoked at any time from your Vault.{' '}
            <Link href="/security-trust#bank-connections" className="underline" style={{ color: 'var(--teal-deep)' }}>
              How bank connections work →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

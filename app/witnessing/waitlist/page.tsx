'use client'

import { useState } from 'react'

export default function WitnessingWaitlistPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/witnessing/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), state: 'VIC' }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center"
        style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
      >
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Victorian witnessing waitlist
        </h1>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12 space-y-6">
        <div className="space-y-3">
          <p className="text-2xl font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Remote witnessing is coming to Victoria.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
            We're completing the qualifications required to offer audio-visual Will witnessing in Victoria. Join the waitlist and we'll email you as soon as it opens.
          </p>
        </div>

        {status === 'done' ? (
          <div className="rounded border px-5 py-4" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.06)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--teal-deep)' }}>
              You're on the list. We'll be in touch when VIC witnessing opens.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--neutral)' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded border px-3 py-2.5 text-sm outline-none focus:ring-1"
                style={{
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                  background: 'white',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {status === 'submitting' ? 'Joining…' : 'Join waitlist'}
            </button>
            {status === 'error' && (
              <p className="text-xs" style={{ color: '#b91c1c' }}>
                Something went wrong — please try again.
              </p>
            )}
          </form>
        )}

        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          In the meantime, you can print your Will and sign it in front of two independent witnesses to make it legally valid.
        </p>
      </main>
    </div>
  )
}

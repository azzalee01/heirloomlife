'use client'

import { useState } from 'react'
import { setRewitnessingReminder } from '../_actions'
import { PRICING } from '@/src/lib/pricing'

const OPTIONS: { months: 12 | 24 | 36; label: string; sub: string }[] = [
  { months: 12, label: 'Every year', sub: 'Recommended — Wills should be reviewed annually' },
  { months: 24, label: 'Every 2 years', sub: 'Good for stable circumstances' },
  { months: 36, label: 'Every 3 years', sub: 'Minimum recommended review cycle' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function RewitnessingReminder({
  currentMonths,
  currentNextAt,
  rewitCredits,
}: {
  currentMonths: number | null
  currentNextAt: string | null
  rewitCredits: number
}) {
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)

  async function handleBuy() {
    setBuying(true)
    setBuyError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'rewit' }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) { setBuyError(data.error ?? 'Unable to start checkout.'); return }
      window.location.href = data.url
    } catch {
      setBuyError('Unable to start checkout.')
    } finally {
      setBuying(false)
    }
  }

  const [selected, setSelected] = useState<12 | 24 | 36 | null>(
    (currentMonths as 12 | 24 | 36 | null) ?? null,
  )
  const [nextAt, setNextAt] = useState<string | null>(currentNextAt)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const saved = status === 'saved' || (currentMonths !== null && status === 'idle')
  const dirty = selected !== (currentMonths as 12 | 24 | 36 | null)

  async function handleSave() {
    setStatus('saving')
    try {
      const result = await setRewitnessingReminder(selected)
      setNextAt(result.nextReminderAt)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="border border-[var(--line)] bg-white p-6 space-y-5">

      {/* Buy a new session — only shown when no credits held (form is shown above when credits > 0) */}
      {rewitCredits === 0 && (
        <div className="rounded border px-4 py-4 space-y-3" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Book a new witnessing session
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                Updated your Will? A new session costs ${PRICING.rewitAud}.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBuy}
              disabled={buying}
              className="btn btn-primary shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {buying ? 'Loading…' : `Buy session — $${PRICING.rewitAud}`}
            </button>
          </div>
          {buyError && <p className="text-xs" style={{ color: '#b91c1c' }}>{buyError}</p>}
        </div>
      )}

      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>
          Re-witnessing reminders
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
          Your Will should be re-signed and re-witnessed whenever it changes materially — marriage, divorce, new children, or major asset changes. Choose how often you'd like us to email you a reminder.
        </p>
      </div>

      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const active = selected === opt.months
          return (
            <button
              key={opt.months}
              type="button"
              onClick={() => { setSelected(opt.months); setStatus('idle') }}
              className="w-full text-left rounded border px-4 py-3 transition-colors"
              style={{
                borderColor: active ? 'var(--teal)' : 'var(--line)',
                background: active ? 'rgba(42,180,174,0.06)' : 'transparent',
              }}
            >
              <span className="flex items-start gap-3">
                <span
                  className="mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{ borderColor: active ? 'var(--teal)' : 'var(--line)' }}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full" style={{ background: 'var(--teal)' }} />
                  )}
                </span>
                <span>
                  <span className="text-sm font-medium block" style={{ color: 'var(--ink)' }}>
                    {opt.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--neutral)' }}>
                    {opt.sub}
                  </span>
                </span>
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => { setSelected(null); setStatus('idle') }}
          className="w-full text-left rounded border px-4 py-3 transition-colors"
          style={{
            borderColor: selected === null ? 'var(--teal)' : 'var(--line)',
            background: selected === null ? 'rgba(42,180,174,0.06)' : 'transparent',
          }}
        >
          <span className="flex items-start gap-3">
            <span
              className="mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center"
              style={{ borderColor: selected === null ? 'var(--teal)' : 'var(--line)' }}
            >
              {selected === null && (
                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--teal)' }} />
              )}
            </span>
            <span>
              <span className="text-sm font-medium block" style={{ color: 'var(--ink)' }}>
                Don't remind me
              </span>
              <span className="text-xs" style={{ color: 'var(--neutral)' }}>
                I'll manage this myself
              </span>
            </span>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {dirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Save preference'}
          </button>
        )}

        {!dirty && status === 'saved' && nextAt && selected !== null && (
          <p className="text-sm" style={{ color: 'var(--teal-deep)' }}>
            ✓ Next reminder: {formatDate(nextAt)}
          </p>
        )}

        {!dirty && currentMonths !== null && status === 'idle' && nextAt && (
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            Next reminder: {formatDate(nextAt)}
          </p>
        )}

        {status === 'error' && (
          <p className="text-sm" style={{ color: '#b91c1c' }}>
            Couldn't save — please try again.
          </p>
        )}
      </div>
    </div>
  )
}

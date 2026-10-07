'use client'

import { useState, useEffect, useCallback } from 'react'
import { getWillSnapshot, type WillSnapshot } from '@/src/lib/appointments/copilot'

const POLL_MS = 3000

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
        {label}
      </span>
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--teal-deep)' }}>{title}</p>
      {children}
    </div>
  )
}

function SnapshotView({ s }: { s: WillSnapshot }) {
  return (
    <div className="space-y-5">
      {s.name && (
        <Section title="Personal">
          <Row label="Name" value={s.name} />
          <Row label="DOB" value={s.dob} />
          <Row label="Address" value={s.address} />
          <Row label="Marital status" value={s.maritalStatus} />
          <Row label="Occupation" value={s.occupation} />
        </Section>
      )}

      {s.primaryExecutor && (
        <Section title="Executors">
          <Row label="Primary" value={s.primaryExecutor} />
          {s.alternateExecutor && <Row label="Alternate" value={s.alternateExecutor} />}
        </Section>
      )}

      {s.beneficiaries.length > 0 && (
        <Section title="Beneficiaries">
          {s.beneficiaries.map((b, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
                {b.isCharity ? 'Charity' : 'Person'}
              </span>
              <span style={{ color: 'var(--ink)' }}>
                {b.name}{b.percentage ? <span style={{ color: 'var(--neutral)' }}> — {b.percentage}</span> : null}
              </span>
            </div>
          ))}
        </Section>
      )}

      {s.assets.length > 0 && (
        <Section title="Assets">
          {s.assets.map((a, i) => (
            <p key={i} className="text-sm" style={{ color: 'var(--ink)' }}>{a}</p>
          ))}
        </Section>
      )}

      {s.specificGifts.length > 0 && (
        <Section title="Specific gifts">
          {s.specificGifts.map((g, i) => (
            <p key={i} className="text-sm" style={{ color: 'var(--ink)' }}>{g}</p>
          ))}
        </Section>
      )}

      {s.triageFlags.length > 0 && (
        <Section title="Flags">
          {s.triageFlags.map((f, i) => (
            <p key={i} className="rounded px-2 py-0.5 text-xs font-medium inline-block" style={{ background: '#fef2f2', color: '#b91c1c' }}>{f}</p>
          ))}
        </Section>
      )}

      {s.completedSections.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--neutral)' }}>Waiting for testator to start filling in their Will…</p>
      )}
    </div>
  )
}

export default function CopilotPanel({ appointmentId }: { appointmentId: string }) {
  const [snapshot, setSnapshot] = useState<WillSnapshot | null>(null)
  const [noWill, setNoWill] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const poll = useCallback(async () => {
    try {
      const result = await getWillSnapshot(appointmentId)
      if (result.ok) {
        setSnapshot(result.snapshot)
        setNoWill(false)
        setLastUpdated(new Date())
      } else if (result.error === 'no_will') {
        setNoWill(true)
      }
    } catch {
      // network hiccup — stay on last good state, next tick will retry
    }
  }, [appointmentId])

  useEffect(() => {
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [poll])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          Co-pilot
        </h2>
        {lastUpdated && (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--neutral)' }}>
            <span
              className="animate-pulse h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--teal)' }}
            />
            live
          </span>
        )}
      </div>

      <div className="rounded border p-4 space-y-4" style={{ borderColor: 'var(--line)' }}>
        {noWill ? (
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            Will not yet linked to this appointment. Link the Will in the Witnessing panel below to activate co-pilot.
          </p>
        ) : snapshot ? (
          <SnapshotView s={snapshot} />
        ) : (
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>Loading…</p>
        )}
      </div>
    </section>
  )
}

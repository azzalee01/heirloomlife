'use client'
import { useState } from 'react'

const INPUT: React.CSSProperties = {
  width: '100%', padding: '.6rem .75rem',
  border: '1px solid var(--mkt-line)', borderRadius: 6,
  fontSize: '.875rem', color: 'var(--mkt-ink-text)',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
}

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: '.78rem', fontWeight: 600,
  color: 'var(--mkt-ink-text)', marginBottom: '.35rem',
}

export default function EmployerEnquiryForm() {
  const [fields, setFields] = useState({
    contactName: '', company: '', role: '', email: '',
    employeeCount: '', state: '', intent: '', website: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/employer-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('done')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ margin: '0 0 .5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>
          Thanks — we&apos;ll be in touch.
        </p>
        <p style={{ margin: 0, fontSize: '.88rem', color: 'var(--mkt-stone)' }}>
          We aim to follow up within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <input
        type="text" name="website" value={fields.website}
        onChange={set('website')}
        style={{ position: 'absolute', left: -9999, opacity: 0, tabIndex: -1 } as React.CSSProperties}
        aria-hidden="true" tabIndex={-1} autoComplete="off"
      />

      <div
        className="md:grid-cols-2"
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}
      >
        <div>
          <label style={LABEL} htmlFor="emp-contact-name">Your name <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
          <input
            id="emp-contact-name" type="text" required
            value={fields.contactName} onChange={set('contactName')}
            placeholder="Jane Smith"
            style={INPUT}
          />
        </div>
        <div>
          <label style={LABEL} htmlFor="emp-company">Company <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
          <input
            id="emp-company" type="text" required
            value={fields.company} onChange={set('company')}
            placeholder="Acme Corp"
            style={INPUT}
          />
        </div>
        <div>
          <label style={LABEL} htmlFor="emp-role">Your role</label>
          <input
            id="emp-role" type="text"
            value={fields.role} onChange={set('role')}
            placeholder="Head of People"
            style={INPUT}
          />
        </div>
        <div>
          <label style={LABEL} htmlFor="emp-email">Work email <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
          <input
            id="emp-email" type="email" required
            value={fields.email} onChange={set('email')}
            placeholder="jane@acme.com"
            style={INPUT}
          />
        </div>
        <div>
          <label style={LABEL} htmlFor="emp-employee-count">Approximate employee count</label>
          <select id="emp-employee-count" value={fields.employeeCount} onChange={set('employeeCount')} style={INPUT}>
            <option value="">Select…</option>
            <option value="1–50">1–50</option>
            <option value="51–200">51–200</option>
            <option value="201–500">201–500</option>
            <option value="501–1000">501–1,000</option>
            <option value="1000+">1,000+</option>
          </select>
        </div>
        <div>
          <label style={LABEL} htmlFor="emp-state">State / territory</label>
          <select id="emp-state" value={fields.state} onChange={set('state')} style={INPUT}>
            <option value="">Select…</option>
            {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Multiple">Multiple states</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={LABEL}>How would you like to proceed?</label>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          {['Book a demo', 'Request a proposal'].map(opt => (
            <label
              key={opt}
              style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                fontSize: '.875rem', color: 'var(--mkt-ink-text)', cursor: 'pointer',
                padding: '.5rem .9rem', border: '1px solid',
                borderColor: fields.intent === opt ? 'var(--teal)' : 'var(--mkt-line)',
                borderRadius: 6, background: fields.intent === opt ? 'rgba(42,180,174,.06)' : 'transparent',
              }}
            >
              <input
                type="radio" name="intent" value={opt}
                checked={fields.intent === opt}
                onChange={set('intent')}
                style={{ accentColor: 'var(--teal)', margin: 0 }}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {status === 'error' && (
        <p style={{ marginBottom: '1rem', fontSize: '.85rem', color: '#b91c1c' }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          padding: '.7rem 1.75rem', background: 'var(--mkt-ink)', color: '#fff',
          border: 'none', borderRadius: 6, fontSize: '.9rem', fontWeight: 600,
          cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
          opacity: status === 'submitting' ? 0.6 : 1,
        }}
      >
        {status === 'submitting' ? 'Sending…' : 'Get in touch'}
      </button>
    </form>
  )
}

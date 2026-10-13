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
  const [fields, setFields] = useState({ name: '', company: '', email: '', message: '', website: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Honeypot */}
      <input
        type="text" name="website" value={fields.website}
        onChange={set('website')}
        style={{ position: 'absolute', left: -9999, opacity: 0 } as React.CSSProperties}
        aria-hidden="true" tabIndex={-1} autoComplete="off"
      />

      <div>
        <label style={LABEL} htmlFor="emp-name">Your name <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
        <input id="emp-name" type="text" required value={fields.name} onChange={set('name')} placeholder="Jane Smith" style={INPUT} />
      </div>

      <div>
        <label style={LABEL} htmlFor="emp-company">Company <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
        <input id="emp-company" type="text" required value={fields.company} onChange={set('company')} placeholder="Acme Corp" style={INPUT} />
      </div>

      <div>
        <label style={LABEL} htmlFor="emp-email">Work email <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
        <input id="emp-email" type="email" required value={fields.email} onChange={set('email')} placeholder="jane@acme.com" style={INPUT} />
      </div>

      <div>
        <label style={LABEL} htmlFor="emp-message">Message <span style={{ color: 'var(--mkt-stone)', fontWeight: 400 }}>(optional)</span></label>
        <textarea
          id="emp-message" value={fields.message} onChange={set('message')}
          placeholder="Tell us a bit about what you're looking for…"
          rows={3}
          style={{ ...INPUT, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {status === 'error' && (
        <p style={{ margin: 0, fontSize: '.85rem', color: '#b91c1c' }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          alignSelf: 'flex-start', padding: '.7rem 1.75rem',
          background: 'var(--mkt-ink)', color: '#fff',
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

'use client'

import { useState } from 'react'

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

const SETTLEMENTS_OPTIONS = [
  'Under 50',
  '50–150',
  '150–300',
  '300–500',
  'Over 500',
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '.7rem .9rem',
  border: '1px solid var(--mkt-line)',
  borderRadius: 6,
  fontSize: '.9rem',
  color: 'var(--mkt-ink-text)',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.78rem',
  fontWeight: 600,
  color: 'var(--mkt-ink-text)',
  marginBottom: '.35rem',
}

export default function PartnerEnquiryForm() {
  const [fields, setFields] = useState({
    name: '',
    firm: '',
    role: '',
    state: '',
    settlementsPerYear: '',
    email: '',
    website: '', // honeypot
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/partner-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(42,180,174,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 style={{ margin: '0 0 .65rem', fontSize: '1.15rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>Thanks, we&apos;ll be in touch.</h3>
        <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
          We typically follow up within one business day. Questions in the meantime?{' '}
          <a href="mailto:hello@heirloomlife.com.au" style={{ color: 'var(--teal-deep)' }}>hello@heirloomlife.com.au</a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Honeypot — hidden from real users, filled by bots */}
      <div style={{ display: 'none' }} aria-hidden>
        <label htmlFor="pi-website">Website</label>
        <input
          id="pi-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={set('website')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle} htmlFor="pi-name">Your name <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
          <input
            id="pi-name"
            type="text"
            required
            placeholder="Jane Smith"
            value={fields.name}
            onChange={set('name')}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pi-firm">Firm <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
          <input
            id="pi-firm"
            type="text"
            required
            placeholder="Smith Conveyancing"
            value={fields.firm}
            onChange={set('firm')}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle} htmlFor="pi-role">Your role</label>
          <input
            id="pi-role"
            type="text"
            placeholder="Mortgage broker"
            value={fields.role}
            onChange={set('role')}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pi-state">State</label>
          <select
            id="pi-state"
            value={fields.state}
            onChange={set('state')}
            style={{ ...inputStyle, color: fields.state ? 'var(--mkt-ink-text)' : 'var(--mkt-stone)' }}
          >
            <option value="">Select state</option>
            {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="pi-settlements">Approximate settlements per year</label>
        <select
          id="pi-settlements"
          value={fields.settlementsPerYear}
          onChange={set('settlementsPerYear')}
          style={{ ...inputStyle, color: fields.settlementsPerYear ? 'var(--mkt-ink-text)' : 'var(--mkt-stone)' }}
        >
          <option value="">Select a range</option>
          {SETTLEMENTS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="pi-email">Work email <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
        <input
          id="pi-email"
          type="email"
          required
          placeholder="jane@smithconveyancing.com.au"
          value={fields.email}
          onChange={set('email')}
          style={inputStyle}
        />
      </div>

      {errorMsg && (
        <p style={{ margin: 0, fontSize: '.82rem', color: '#c0392b' }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '.85rem 2rem',
          background: 'var(--mkt-ink-text)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: '.9rem',
          fontWeight: 600,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.6 : 1,
          alignSelf: 'flex-start',
        }}
      >
        {status === 'loading' ? 'Sending...' : 'Request a pilot'}
      </button>
    </form>
  )
}

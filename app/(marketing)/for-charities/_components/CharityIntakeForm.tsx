'use client'

import { useState } from 'react'

const ORG_TYPES = [
  'Health and medical research',
  'Environment and conservation',
  'Community services',
  'Animal welfare',
  'Education',
  'Arts and culture',
  'Faith and spiritual',
  'International aid',
  'Other',
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

export default function CharityIntakeForm() {
  const [fields, setFields] = useState({
    orgName: '',
    contactName: '',
    email: '',
    role: '',
    orgType: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/charity-enquiry', {
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
          We typically respond within one business day. In the meantime, feel free to email us directly at{' '}
          <a href="mailto:hello@heirloomlife.com.au" style={{ color: 'var(--teal-deep)' }}>hello@heirloomlife.com.au</a>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div className="sm:grid sm:grid-cols-2" style={{ gap: '1rem', display: 'grid', gridTemplateColumns: '1fr' }}>
        <div>
          <label style={labelStyle} htmlFor="ci-orgName">Organisation name <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
          <input
            id="ci-orgName"
            type="text"
            required
            placeholder="The Smith Foundation"
            value={fields.orgName}
            onChange={set('orgName')}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="ci-orgType">Organisation type</label>
          <select
            id="ci-orgType"
            value={fields.orgType}
            onChange={set('orgType')}
            style={{ ...inputStyle, color: fields.orgType ? 'var(--mkt-ink-text)' : 'var(--mkt-stone)' }}
          >
            <option value="">Select a category</option>
            {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="sm:grid sm:grid-cols-2" style={{ gap: '1rem', display: 'grid', gridTemplateColumns: '1fr' }}>
        <div>
          <label style={labelStyle} htmlFor="ci-contactName">Your name <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
          <input
            id="ci-contactName"
            type="text"
            required
            placeholder="Jane Smith"
            value={fields.contactName}
            onChange={set('contactName')}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="ci-role">Your role</label>
          <input
            id="ci-role"
            type="text"
            placeholder="Bequest Manager"
            value={fields.role}
            onChange={set('role')}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="ci-email">Work email <span style={{ color: 'var(--teal-deep)' }}>*</span></label>
        <input
          id="ci-email"
          type="email"
          required
          placeholder="jane@smithfoundation.org.au"
          value={fields.email}
          onChange={set('email')}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="ci-message">Anything you&apos;d like us to know</label>
        <textarea
          id="ci-message"
          rows={4}
          placeholder="Tell us about your bequest program, what you're looking for, or any questions you have."
          value={fields.message}
          onChange={set('message')}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
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
        {status === 'loading' ? 'Sending...' : 'Get in touch'}
      </button>
    </form>
  )
}

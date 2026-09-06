'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

type ExtractedData = Record<string, unknown>

interface UploadResult {
  success: boolean
  confidence?: 'ok' | 'low'
  extractedData?: ExtractedData
  extractedFields?: string[]
  reason?: string
}

interface Props {
  onClose: () => void
  onComplete: (result: { extractedData: ExtractedData; extractedFields: string[] }) => void
}

const REASONS: Record<string, string> = {
  unreadable: "We couldn't read this file — it may be a scanned document without selectable text. Start fresh and enter your details manually.",
  protected: "This file appears to be password-protected. Remove the password and try again, or start fresh.",
  parse_error: "We couldn't extract your details from this file. Start fresh and enter your details manually.",
  unsupported_type: 'Only PDF and DOCX files are supported.',
  too_large: 'File is too large. Please upload a file under 10 MB.',
  no_file: 'No file was received. Please try again.',
}

const STEPS = [
  'Uploading your document...',
  'Reading the text...',
  'Identifying names, executors and beneficiaries...',
  'Almost there...',
]

const FACTS: { label: string; heading: string; body: string }[] = [
  {
    label: 'Did you know',
    heading: 'Most Australians don\'t have a valid Will.',
    body: 'Over 60% of Australians haven\'t made one. If you pass without a Will, the state decides who gets what — regardless of your wishes.',
  },
  {
    label: 'Solicitor review',
    heading: 'Every Heirloom Will is reviewed before issue.',
    body: 'A standard solicitor quality review is included as part of every Will — not an optional extra. Complex situations are flagged and escalated automatically.',
  },
  {
    label: 'Stays current',
    heading: 'Marriage automatically revokes a prior Will in most states.',
    body: 'Life events — marriage, a new child, buying property — can quietly invalidate your Will. Heirloom tracks what changed and prompts a review before a gap becomes a problem.',
  },
  {
    label: 'Your Vault',
    heading: 'Everything your executor needs, in one place.',
    body: 'Your Will, asset register and instructions live securely in your Vault — clear, up to date, and ready when it matters most.',
  },
  {
    label: 'All states covered',
    heading: 'Drafted to the requirements of wherever you live.',
    body: 'Your Will is legally structured for your Australian state or territory. Move interstate? We\'ll update it.',
  },
  {
    label: 'Amend anytime',
    heading: 'Your estate plan isn\'t a one-time document.',
    body: 'Update beneficiaries, add gifts, change your executor — all from your Vault, without starting from scratch.',
  },
  {
    label: 'Takes 15 minutes',
    heading: 'Most people complete their Will in a single session.',
    body: 'Seven guided steps. Your answers are saved at every point. Pick up where you left off whenever you\'re ready.',
  },
]

function UploadingScreen() {
  const [stepIndex, setStepIndex] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [factVisible, setFactVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    }, 3500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setFactVisible(false)
      const swap = setTimeout(() => {
        setFactIndex(i => (i + 1) % FACTS.length)
        setFactVisible(true)
      }, 380)
      return () => clearTimeout(swap)
    }, 5500)
    return () => clearInterval(t)
  }, [])

  const fact = FACTS[factIndex]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Top teal rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--teal-deep), var(--teal))' }} />

      {/* Wordmark */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.75rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--mkt-ink-text)', letterSpacing: '-.01em' }}>
          heirloom
        </span>
      </div>

      {/* Main content */}
      <div style={{ textAlign: 'center', maxWidth: '36rem', width: '100%' }}>

        {/* Animated dots */}
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 9, height: 9, borderRadius: '50%',
                background: 'var(--teal)',
                animation: `hl-dot 1.4s ease-in-out ${i * 0.22}s infinite`,
              }}
            />
          ))}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
          lineHeight: 1.1,
          letterSpacing: '-.02em',
          color: 'var(--mkt-ink-text)',
          margin: '0 0 .85rem',
          fontWeight: 500,
        }}>
          Reading your Will
        </h1>

        {/* Step text */}
        <p
          key={stepIndex}
          style={{
            fontSize: '.9rem',
            color: 'var(--mkt-stone)',
            margin: 0,
            animation: 'hl-fadein .4s ease',
          }}
        >
          {STEPS[stepIndex]}
        </p>

        {/* Divider */}
        <div style={{
          margin: '2.5rem auto',
          height: 1,
          background: 'var(--mkt-line)',
          maxWidth: '20rem',
        }} />

        {/* Rotating fact */}
        <div style={{
          opacity: factVisible ? 1 : 0,
          transition: 'opacity .38s ease',
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: '.65rem',
            fontWeight: 700,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'var(--teal-deep)',
            marginBottom: '.75rem',
          }}>
            {fact.label}
          </span>
          <p style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--mkt-ink-text)',
            margin: '0 0 .5rem',
            lineHeight: 1.35,
          }}>
            {fact.heading}
          </p>
          <p style={{
            fontSize: '.88rem',
            lineHeight: 1.65,
            color: 'var(--mkt-stone)',
            margin: 0,
            maxWidth: '28rem',
            marginInline: 'auto',
          }}>
            {fact.body}
          </p>
        </div>

        {/* Fact dots */}
        <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'center', marginTop: '1.75rem' }}>
          {FACTS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 5, height: 5, borderRadius: '50%',
                background: i === factIndex ? 'var(--teal)' : 'var(--mkt-line)',
                transition: 'background .3s ease',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hl-dot {
          0%, 80%, 100% { opacity: .2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-6px); }
        }
        @keyframes hl-fadein {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function UploadWillModal({ onClose, onComplete }: Props) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error' | 'low_confidence'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pendingResult, setPendingResult] = useState<{ extractedData: ExtractedData; extractedFields: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && status !== 'uploading') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, status])

  const handleFile = useCallback(async (file: File) => {
    setStatus('uploading')
    setErrorMsg('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/will/upload', { method: 'POST', body: fd })
      const data: UploadResult = await res.json()
      if (!data.success) {
        setStatus('error')
        setErrorMsg(REASONS[data.reason ?? ''] ?? 'Something went wrong. Please try again.')
        return
      }
      const result = { extractedData: data.extractedData!, extractedFields: data.extractedFields! }
      if (data.confidence === 'low') {
        setPendingResult(result)
        setStatus('low_confidence')
      } else {
        onComplete(result)
      }
    } catch {
      setStatus('error')
      setErrorMsg('Upload failed. Please check your connection and try again.')
    }
  }, [onComplete])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  if (status === 'uploading') {
    return <UploadingScreen />
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(14,21,20,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,.18)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem .75rem', borderBottom: '1px solid var(--mkt-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>
              Upload your existing Will
            </h2>
            <p style={{ margin: '.25rem 0 0', fontSize: '.82rem', color: 'var(--mkt-stone)' }}>
              PDF or DOCX, up to 10 MB
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mkt-stone)', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {status === 'idle' && (
            <>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--mkt-line)', borderRadius: 8,
                  padding: '2.5rem 1rem', textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--mkt-line)')}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ marginInline: 'auto' }}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>
                </svg>
                <p style={{ marginTop: '.75rem', fontSize: '.9rem', fontWeight: 500, color: 'var(--mkt-ink-text)' }}>
                  Drag and drop, or click to select
                </p>
                <p style={{ marginTop: '.25rem', fontSize: '.78rem', color: 'var(--mkt-stone)' }}>
                  PDF or DOCX
                </p>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleInputChange} style={{ display: 'none' }} />
              </div>
              <p style={{ marginTop: '1rem', fontSize: '.78rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>
                We extract what we can — names, executors, beneficiaries — and pre-fill the questionnaire. You confirm every field before anything becomes part of your new Will. We never edit your uploaded file directly.
              </p>
            </>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: 'var(--mkt-stone)', marginBottom: '1.25rem' }}>
                {errorMsg}
              </p>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setStatus('idle'); setErrorMsg('') }}
                  style={{ padding: '.6rem 1.25rem', fontSize: '.85rem', fontWeight: 600, border: '1.5px solid var(--teal)', color: 'var(--teal-deep)', background: 'transparent', borderRadius: 6, cursor: 'pointer' }}
                >
                  Try again
                </button>
                <button
                  onClick={onClose}
                  style={{ padding: '.6rem 1.25rem', fontSize: '.85rem', fontWeight: 600, background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Start fresh instead
                </button>
              </div>
            </div>
          )}

          {status === 'low_confidence' && (
            <div style={{ padding: '.5rem 0' }}>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, padding: '.75rem 1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '.85rem', lineHeight: 1.6, color: '#78350f', margin: 0 }}>
                  We could only extract limited information from your document. You&apos;ll need to fill in most fields manually, but we&apos;ll show you what we found.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={onClose}
                  style={{ padding: '.6rem 1.25rem', fontSize: '.85rem', fontWeight: 500, border: '1.5px solid var(--mkt-line)', color: 'var(--mkt-stone)', background: 'transparent', borderRadius: 6, cursor: 'pointer' }}
                >
                  Start fresh instead
                </button>
                <button
                  onClick={() => { if (pendingResult) onComplete(pendingResult) }}
                  style={{ padding: '.6rem 1.25rem', fontSize: '.85rem', fontWeight: 600, background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Continue with what we found
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

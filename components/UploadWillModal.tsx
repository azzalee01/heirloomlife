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
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

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

          {status === 'uploading' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--mkt-line)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginInline: 'auto' }} />
              <p style={{ marginTop: '1rem', fontSize: '.9rem', color: 'var(--mkt-stone)' }}>Reading your Will...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
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

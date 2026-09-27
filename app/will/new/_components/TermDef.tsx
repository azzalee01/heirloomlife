'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  term: string
  definition: string
  iconOnly?: boolean
}

export default function TermDef({ term, definition, iconOnly = false }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex items-baseline gap-0.5" style={{ verticalAlign: 'baseline' }}>
      {!iconOnly && (
        <span style={{ borderBottom: '1px dashed var(--neutral)', cursor: 'default' }}>
          {term}
        </span>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label={`Definition of ${term}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 15,
          height: 15,
          borderRadius: '50%',
          background: open ? 'var(--teal)' : 'rgba(42,180,174,0.18)',
          color: open ? '#fff' : 'var(--teal-deep)',
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1,
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s, color 0.15s',
          marginLeft: iconOnly ? 4 : 3,
          position: 'relative',
          top: iconOnly ? 0 : 1,
        }}
      >
        i
      </button>

      {open && (
        <span
          role="tooltip"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 60,
            width: 'min(272px, calc(100vw - 48px))',
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderLeft: '3px solid var(--teal)',
            padding: '10px 14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'block',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--teal-deep)',
              marginBottom: 4,
            }}
          >
            Definition
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: 5,
            }}
          >
            {term}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 12,
              lineHeight: 1.65,
              color: 'var(--neutral)',
            }}
          >
            {definition}
          </span>
        </span>
      )}
    </span>
  )
}

'use client'

import { useState } from 'react'

export default function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="More information"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 15,
          height: 15,
          borderRadius: '50%',
          border: '1.5px solid var(--mkt-stone)',
          background: 'transparent',
          color: 'var(--mkt-stone)',
          fontSize: '.6rem',
          fontWeight: 700,
          fontStyle: 'italic',
          cursor: 'default',
          padding: 0,
          marginLeft: '.3rem',
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        i
      </button>
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            background: '#1a1f1e',
            color: '#f5f4f2',
            fontSize: '.75rem',
            lineHeight: 1.65,
            padding: '.8rem 1rem',
            borderRadius: 8,
            zIndex: 20,
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
          }}
        >
          {text}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1a1f1e',
          }} />
        </span>
      )}
    </span>
  )
}

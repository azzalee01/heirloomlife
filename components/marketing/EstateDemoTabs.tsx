'use client'
import { useState } from 'react'

type Step = { label: string; note?: string }
type Scenario = {
  title: string
  steps: Step[]
  lane: 'instant' | 'reviewed'
  laneLabel: string
  timeframe: string
}

// Scenario copy written to match product behaviour — no copy existed in reference files.
// Review and edit these three objects before launch.
const SCENARIOS: Scenario[] = [
  {
    title: '"I want to add my new property as an asset."',
    steps: [
      { label: 'Open the asset register in your Vault and add the property address, type, and estimated value.' },
      { label: 'The register syncs to your Will draft. Any specific-gift clauses that reference property are flagged for your review.' },
      { label: 'Confirm the update. No solicitor review required — asset register changes are self-serve unless they trigger a high-severity flag.' },
    ],
    lane: 'instant',
    laneLabel: 'Self-serve',
    timeframe: 'Done in minutes',
  },
  {
    title: '"We just had a second child. Do I need to update my Will?"',
    steps: [
      { label: 'The Vault flags the life event. Guardianship clauses and equal-distribution provisions are reviewed against the new family structure.' },
      { label: 'If existing clauses cover additional children automatically, you\'ll see a confirmation. If not, the affected clauses are highlighted for amendment.' },
      { label: 'High-severity changes — like naming a guardian for the first time — are queued for included solicitor review.', note: 'Solicitor review included' },
    ],
    lane: 'reviewed',
    laneLabel: 'Solicitor reviewed',
    timeframe: 'Review turnaround being confirmed pre-launch',
  },
  {
    title: '"I want to change who my executor is."',
    steps: [
      { label: 'Open the executor section in your Will and search for your new executor by name. You\'ll need their full legal name and contact details.' },
      { label: 'The existing executor is removed. Any related clauses — including backup executor provisions — are flagged for your review.' },
      { label: 'Executor changes are high-severity. A solicitor reviews the amendment before a new Will version is issued.', note: 'Solicitor review included' },
    ],
    lane: 'reviewed',
    laneLabel: 'Solicitor reviewed',
    timeframe: 'Review turnaround being confirmed pre-launch',
  },
]

const TABS = ['Add a property', 'New child', 'Change executor'] as const

export default function EstateDemoTabs() {
  const [active, setActive] = useState(0)
  const scenario = SCENARIOS[active]

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      {/* Readiness ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ position: 'relative', flexShrink: 0, width: 88, height: 88 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
            <circle cx="44" cy="44" r="38" stroke="var(--mkt-line)" strokeWidth="5"/>
            <circle
              cx="44" cy="44" r="38"
              stroke="var(--teal)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - 0.85)}`}
              transform="rotate(-90 44 44)"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.5rem', lineHeight: 1, color: 'var(--mkt-ink-text)' }}>85</span>
            <span style={{ fontSize: '.6rem', color: 'var(--mkt-stone)', marginTop: '.1rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>ready</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: 0 }}>Estate readiness</p>
          <p style={{ fontSize: '.8rem', color: 'var(--mkt-stone)', marginTop: '.25rem', lineHeight: 1.5 }}>
            2 items flagged for review.<br/>Last updated 3 days ago.
          </p>
        </div>
      </div>

      {/* Tab buttons */}
      <div role="tablist" aria-label="Estate scenarios" style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') setActive((active + 1) % TABS.length)
              if (e.key === 'ArrowLeft') setActive((active - 1 + TABS.length) % TABS.length)
            }}
            style={{
              height: '2.2rem', paddingInline: '1rem', borderRadius: 4, fontSize: '.8rem', fontWeight: 600,
              cursor: 'pointer', border: '1px solid', transition: 'background .15s ease, color .15s ease',
              background: active === i ? 'var(--mkt-ink)' : 'transparent',
              color: active === i ? '#fff' : 'var(--mkt-ink-text)',
              borderColor: active === i ? 'var(--mkt-ink)' : 'var(--mkt-line)',
              outline: 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scenario panel */}
      <div
        role="tabpanel"
        style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--mkt-line)', overflow: 'hidden' }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
          <p style={{ fontSize: '.88rem', fontStyle: 'italic', color: 'var(--mkt-ink-text)', margin: 0, lineHeight: 1.5 }}>
            {scenario.title}
          </p>
        </div>
        <ol style={{ margin: 0, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.9rem', listStyle: 'none' }}>
          {scenario.steps.map((step, i) => (
            <li key={i} style={{ display: 'grid', gridTemplateColumns: '1.5rem 1fr', gap: '.6rem', alignItems: 'flex-start' }}>
              <span style={{ width: '1.4rem', height: '1.4rem', borderRadius: '50%', background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 700, color: 'var(--teal-deep)', flexShrink: 0, marginTop: '.05rem' }}>
                {i + 1}
              </span>
              <div>
                <span style={{ fontSize: '.85rem', color: 'var(--mkt-stone)', lineHeight: 1.55 }}>{step.label}</span>
                {step.note && (
                  <span style={{ display: 'inline-flex', marginTop: '.4rem', marginLeft: '0', fontSize: '.65rem', fontWeight: 600, padding: '.25rem .6rem', borderRadius: 99, border: '1px solid var(--teal)', color: 'var(--teal-deep)' }}>
                    {step.note}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.5rem', borderTop: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.68rem', fontWeight: 600, padding: '.28rem .7rem', borderRadius: 99, background: scenario.lane === 'instant' ? 'rgba(42,180,174,.08)' : 'rgba(18,32,29,.05)', border: `1px solid ${scenario.lane === 'instant' ? 'var(--teal)' : 'var(--mkt-line)'}`, color: scenario.lane === 'instant' ? 'var(--teal-deep)' : 'var(--mkt-stone)' }}>
            {scenario.laneLabel}
          </span>
          <span style={{ fontSize: '.75rem', color: 'var(--mkt-stone)' }}>{scenario.timeframe}</span>
        </div>
      </div>
    </div>
  )
}

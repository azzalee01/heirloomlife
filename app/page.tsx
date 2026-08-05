import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

// ─── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'AI-guided will builder',
    body: 'Answer a series of guided questions about your assets, beneficiaries, and wishes. Your will is drafted on the spot — clearly, legally, and in plain English.',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Solicitor review',
    body: 'Every will is reviewed by a qualified Australian solicitor before it is finalised — so you can be confident it holds up when it matters most.',
  },
  {
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
    title: 'Remote witnessing',
    body: 'Schedule a video session with two independent witnesses from your home. No office visit, no waiting rooms — your will is witnessed on your time.',
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Living Vault',
    body: 'Store all your estate documents in one encrypted, private vault. Update your will as your life changes — your family will always find the latest version.',
  },
]

const STEPS = [
  { number: '01', label: 'Answer the questions', detail: 'Walk through your personal details, assets, beneficiaries, and wishes at your own pace.' },
  { number: '02', label: 'Review your draft', detail: 'Your AI-drafted will is generated instantly. Read it, request changes, and submit for legal review.' },
  { number: '03', label: 'Witness & finalise', detail: 'Book a remote witnessing session or arrange your own. Download your signed, legally valid will.' },
]

function Icon({ d, size = 20, color = 'var(--teal)' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div style={{ background: 'var(--paper)' }}>
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-28 sm:pt-32 sm:pb-36">
        <div className="max-w-3xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-6"
            style={{ color: 'var(--teal)' }}
          >
            Estate planning for Australians
          </p>
          <h1
            className="text-[clamp(2.4rem,5vw,3.8rem)] font-semibold leading-[1.1] tracking-tight mb-7"
            style={{
              color: 'var(--ink)',
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: 'italic',
            }}
          >
            The will you keep
            <br />putting off, done right.
          </h1>
          <p
            className="text-[1.1rem] leading-relaxed mb-10 max-w-xl"
            style={{ color: 'var(--neutral)' }}
          >
            Heirloom Life guides you through writing a legally valid Australian will in under an hour — with AI-assisted drafting, qualified solicitor review, and remote witnessing built in.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Write your will
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-semibold flex items-center gap-2 py-2"
              style={{ color: 'var(--ink)' }}
            >
              See plans & pricing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Trust bar */}
        <div
          className="mt-20 pt-8 border-t flex flex-wrap gap-8 items-center"
          style={{ borderColor: 'var(--line)' }}
        >
          {[
            'Reviewed by qualified Australian solicitors',
            'Remote witnessing available',
            'Valid in all states & territories',
          ].map((t) => (
            <div key={t} className="flex items-center gap-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-sm" style={{ color: 'var(--neutral)' }}>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--paper-warm)' }}>
        <div className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
              style={{ color: 'var(--teal)' }}
            >
              What's included
            </p>
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold leading-tight max-w-lg"
              style={{
                color: 'var(--ink)',
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              Everything your estate plan needs, in one place.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: 'var(--line)' }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-8 sm:p-10"
                style={{ background: 'var(--paper-warm)' }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-5 border"
                  style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
                >
                  <Icon d={f.icon} size={18} />
                </div>
                <h3
                  className="text-[1.1rem] font-semibold mb-2"
                  style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <div className="mb-14">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ color: 'var(--teal)' }}
          >
            How it works
          </p>
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold leading-tight"
            style={{
              color: 'var(--ink)',
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: 'italic',
            }}
          >
            Three steps. One afternoon.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: 'var(--line)' }}>
          {STEPS.map((s) => (
            <div
              key={s.number}
              className="p-8 sm:p-10"
              style={{ background: 'var(--paper)' }}
            >
              <p
                className="text-3xl font-bold mb-4"
                style={{
                  color: 'var(--teal-light)',
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  WebkitTextStroke: '1.5px var(--teal)',
                }}
              >
                {s.number}
              </p>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: 'var(--ink)' }}
              >
                {s.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--ink)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <h2
              className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight text-white mb-3"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
            >
              Start protecting your family today.
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              From $199. No subscription required for the Will Document plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Write your will
            </Link>
            <Link
              href="/pricing"
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

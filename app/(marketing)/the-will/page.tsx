import Link from 'next/link'

const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }
const SECTION_PAD: React.CSSProperties = { paddingBlock: '5.5rem' }
const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

function Pill({ children, variant = 'teal' }: { children: React.ReactNode; variant?: 'teal' | 'amber' | 'quiet' }) {
  const border = variant === 'teal' ? 'var(--teal)' : variant === 'amber' ? 'var(--mkt-ink-text)' : 'var(--mkt-line)'
  const color = variant === 'quiet' ? 'var(--mkt-stone)' : 'var(--mkt-ink-text)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '.4rem',
      fontSize: '.68rem', fontWeight: 600, padding: '.32rem .7rem', borderRadius: 99,
      background: '#fff', color, border: `1px solid ${border}`,
    }}>
      {children}
    </span>
  )
}

export const metadata = { title: 'The Will  -  Heirloom Life', description: 'A living Will in plain English, drafted to your state\'s requirements, and versioned every time your life moves forward.' }

export default function TheWillPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '7rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '44rem' }}>
            <span style={SECTION_LABEL}>The Will</span>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(2.6rem, 5vw, 4.6rem)', lineHeight: 1.04,
              letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', margin: 0,
            }}>
              Not a document you sign once<br/>
              and hope you never think about{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--teal-deep)' }}>again</em>.
            </h1>
            <p style={{ marginTop: '1.75rem', maxWidth: '34rem', fontSize: '1.1rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
              Most Wills are static PDFs, filed away and forgotten until it&#8217;s too late to matter. Yours lives in your Vault  -  readable in plain English, reviewed by solicitors when it counts, and versioned every time your life moves forward.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/start" className="mkt-btn-ink-l">
                Start your Will
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/how-it-works" className="mkt-btn-ghost-l">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Document mockup ───────────────────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '48rem', marginInline: 'auto' }}>
            <div style={{ borderRadius: 12, background: '#fff', border: '1px solid var(--mkt-line)', boxShadow: '0 30px 80px rgba(15,30,28,0.09)', overflow: 'hidden' }}>
              {/* Doc header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--mkt-line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                  <div style={{ width: '2.6rem', height: '2.6rem', borderRadius: 8, background: 'var(--mkt-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M2 2h8l4 4v8H2V2Z" stroke="#2ab4ae" strokeWidth="1.2"/>
                      <path d="M10 2v4h4" stroke="#2ab4ae" strokeWidth="1.2"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.95rem', margin: 0 }}>Sample Last Will &amp; Testament</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--mkt-stone-soft)', marginTop: '.15rem' }}>Version 4 · Last amended 12 Jun 2026</p>
                  </div>
                </div>
                <Pill>Solicitor reviewed</Pill>
              </div>

              {/* Tab strip */}
              <div role="tablist" style={{ display: 'flex', gap: '1.6rem', paddingInline: '1.5rem', borderBottom: '1px solid var(--mkt-line)', overflowX: 'auto' }}>
                {['Clauses', 'Beneficiaries', 'Version History', 'Suggested Edits'].map((tab, i) => (
                  <div key={tab} style={{ paddingBlock: '1rem', fontSize: '.78rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, color: i === 0 ? 'var(--mkt-ink-text)' : 'var(--mkt-stone-soft)', borderBottom: i === 0 ? '2px solid var(--teal)' : '2px solid transparent' }}>
                    {tab}
                  </div>
                ))}
              </div>

              {/* Clauses panel */}
              <div style={{ padding: '1.75rem 1.5rem' }}>
                {[
                  { n: '1', title: 'Appointment of Executor', body: "Names who carries out your wishes. Your executor gathers your assets, pays any debts, and distributes what remains as you've set out below.", badge: null },
                  { n: '2', title: 'Guardianship of Minor Children', body: 'Flagged for review  -  a change to your family situation since your last amendment may affect this clause.', badge: 'Included review recommended' },
                  { n: '3', title: 'Distribution of Residuary Estate', body: 'Sets out how everything not otherwise gifted is divided. Last confirmed against your asset register two months ago.', badge: null },
                ].map(clause => (
                  <div key={clause.n} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--mkt-line)' }}>
                    <div style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: 6, background: 'var(--mkt-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: 'var(--teal-deep)' }}>{clause.n}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '.9rem', margin: 0 }}>{clause.title}</p>
                      <p style={{ fontSize: '.83rem', color: 'var(--mkt-stone)', marginTop: '.3rem', lineHeight: 1.55 }}>{clause.body}</p>
                      {clause.badge && <Pill variant="amber" >{clause.badge}</Pill>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ margin: '0 1.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, background: 'var(--mkt-ink)', padding: '1rem 1.25rem', color: '#fff' }}>
                <span style={{ fontSize: '.85rem', fontWeight: 600 }}>Request solicitor review</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How the Will works ────────────────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '38rem', marginBottom: '3.5rem' }}>
            <span style={SECTION_LABEL}>How it works</span>
            <h2 style={{ fontFamily: "var(--font-body)", fontSize: 'clamp(1.9rem, 3.2vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-.02em', fontWeight: 500, color: 'var(--mkt-ink-text)', margin: 0 }}>
              Seven guided steps. A document that actually stays current.
            </h2>
          </div>
          <div className="lg:grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.1rem' }}>
            {[
              { n: '01', title: 'Answer guided questions', body: 'Seven steps covering your assets, beneficiaries, executor, and any guardianship arrangements. Every question has a plain-English explanation.' },
              { n: '02', title: 'Review your draft', body: 'Your answers become a structured Will draft. Review clause by clause. Change your answers and the draft updates immediately.' },
              { n: '03', title: 'Download and sign', body: 'Download your completed Will and sign it with two witnesses. Any complex flags  -  business interests, blended families, overseas assets  -  are highlighted in your Vault.' },
              { n: '04', title: 'Sign and witness', body: 'Your Will is valid only once signed in front of two independent witnesses. We walk you through the exact requirements for your state.' },
              { n: '05', title: 'Store and update', body: 'Your signed Will lives in your Vault alongside your asset register. Every time your life changes, update your Will from the same place.' },
              { n: '+', title: 'Versioned as your life changes', body: 'Every amendment creates a new version. A change to your family, your assets, or your executors prompts an update  -  not a whole new Will.' },
            ].map(step => (
              <div key={step.n} style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--mkt-line)', padding: '1.75rem' }}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontSize: '1.3rem', color: 'var(--teal)', display: 'block', marginBottom: '.75rem' }}>{step.n}</span>
                <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--mkt-ink-text)', margin: '0 0 .5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: 'var(--mkt-stone)', margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solicitor review add-on note ──────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: '#fff' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720 }}>
          <h2 style={{ fontFamily: "var(--font-body)", fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 1.25rem' }}>
            Solicitor review, when you need it.
          </h2>
          <p style={{ fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)', margin: '0 0 1rem' }}>
            Template Wills are not automatically reviewed by a solicitor  -  they don&#8217;t need to be for straightforward estates. For situations that are more complex  -  business succession, blended families, overseas assets, testamentary trusts  -  your Vault will flag the specific areas of concern. You can then request a solicitor review as an add-on for around $150, and communicate directly with our partner lawyers through the platform.
          </p>
        </div>
      </section>

      {/* ── State note ────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '3.5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 md:flex-row md:items-center md:justify-between" style={{ ...W, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ maxWidth: '38rem', fontSize: '.92rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
            Australian succession law is state-based. Heirloom Life is available across all states and territories, accounting for each state&#8217;s specific requirements around execution, witnessing, and revocation.
          </p>
          <Link href="/start" className="mkt-btn-ink-m" style={{ flexShrink: 0 }}>
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

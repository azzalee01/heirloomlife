import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import PlatformPreview from '@/components/marketing/PlatformPreview'
import Reveal from '@/components/marketing/Reveal'

const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }
const SECTION_PAD: React.CSSProperties = { paddingBlock: '5.5rem' }

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 'clamp(1.9rem, 3.2vw, 3.1rem)', lineHeight: 1.08,
      letterSpacing: '-.02em', fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif", color: 'var(--mkt-ink-text)', margin: 0,
    }}>
      {children}
    </h2>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ marginTop: '1.1rem', maxWidth: '34rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
      {children}
    </p>
  )
}

function Pill({ children, variant = 'teal' }: { children: React.ReactNode; variant?: 'teal' | 'amber' | 'quiet' }) {
  const border = variant === 'teal' ? 'var(--teal)' : variant === 'amber' ? 'var(--mkt-ink-text)' : 'var(--mkt-line)'
  const color = variant === 'quiet' ? 'var(--mkt-stone)' : 'var(--mkt-ink-text)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '.4rem',
      fontSize: '.68rem', fontWeight: 600,
      padding: '.32rem .7rem', borderRadius: 99,
      background: '#fff', color, border: `1px solid ${border}`,
    }}>
      {children}
    </span>
  )
}

export default function HomePage() {
  return (
    <>
      <MarketingNav />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', background: 'var(--mkt-surface)', color: 'var(--mkt-ink-text)', overflow: 'hidden' }}>
        {/* Hero text — constrained */}
        <div style={{ ...W, paddingTop: '8rem', paddingBottom: '3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ maxWidth: '52rem' }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(2.7rem, 6.2vw, 5.4rem)', lineHeight: .98, letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', margin: 0 }}>
              Your Will, kept{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--teal-deep)' }}>current</em>.
            </h1>
            <p style={{ marginTop: '1.75rem', maxWidth: '36rem', marginInline: 'auto', fontSize: '1.15rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
              Heirloom Life is the estate command centre for Australians who&#8217;ve built something worth protecting — a living Will and a private Vault that keeps your estate current as your life changes.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '.9rem', justifyContent: 'center' }}>
              <Link href="/start" className="mkt-btn-ink-l">
                Start your Will
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/how-it-works" className="mkt-btn-ghost-l">
                See how it works
              </Link>
            </div>
          </div>
        </div>

        {/* Platform preview */}
        <div style={{ paddingInline: '2rem', paddingBottom: '4rem' }}>
          <div style={{ width: '86%', marginInline: 'auto' }}>
            <PlatformPreview />
          </div>
        </div>

        {/* Trust bar */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid var(--mkt-line)', background: '#fff' }}>
          <div
            className="md:px-10 md:grid-cols-3"
            style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '1.4rem', paddingBlock: '1.6rem', fontSize: '.8rem', color: 'var(--mkt-stone)' }}
          >
            {[
              {
                d: <><path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.4"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
                t: 'Available across Australia — drafted to your state\'s legal requirements',
              },
              {
                d: <><path d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" stroke="currentColor" strokeWidth="1.4"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
                t: 'A living document, amended as your life changes',
              },
              {
                d: <><rect x="4" y="10" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.4"/></>,
                t: 'Solicitor reviewed, encrypted, executor-ready',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--teal-deep)' }} aria-hidden="true">{item.d}</svg>
                {item.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE WILL ─────────────────────────────────────────────────────── */}
      <section id="the-will" style={{ ...SECTION_PAD, background: '#fff' }}>
        <Reveal className="md:px-10" style={W}>
          <div style={{ maxWidth: '38rem' }}>
            <span style={SECTION_LABEL}>The Will</span>
            <H2>Not a document you sign once<br/>and hope you never think about <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>again</em>.</H2>
            <Sub>Most Wills are static PDFs, filed away and forgotten until it&#8217;s too late to matter. Yours lives in your Vault — readable in plain English, versioned every time your life moves forward, with a solicitor review add-on available when your situation calls for it.</Sub>
          </div>

          <div style={{ marginTop: '3.5rem', borderRadius: 12, background: '#fff', border: '1px solid var(--mkt-line)', boxShadow: '0 30px 80px rgba(15,30,28,0.10)', overflow: 'hidden' }}>
            {/* Doc header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--mkt-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                <div style={{ width: '2.6rem', height: '2.6rem', borderRadius: 8, background: 'var(--mkt-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2h8l4 4v8H2V2Z" stroke="#2ab4ae" strokeWidth="1.2"/><path d="M10 2v4h4" stroke="#2ab4ae" strokeWidth="1.2"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.95rem', margin: 0 }}>Last Will &amp; Testament</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--mkt-stone-soft)', marginTop: '.15rem' }}>Version 4 · Solicitor reviewed 12 Jun 2026</p>
                </div>
              </div>
              <Pill>Solicitor reviewed</Pill>
            </div>
            {/* Tab strip */}
            <div style={{ display: 'flex', gap: '1.6rem', paddingInline: '1.5rem', borderBottom: '1px solid var(--mkt-line)', overflowX: 'auto' }}>
              {['Clauses', 'Beneficiaries', 'Version History', 'Suggested Edits'].map((tab, i) => (
                <div key={tab} style={{ paddingBlock: '1rem', fontSize: '.78rem', fontWeight: 600, color: i === 0 ? 'var(--mkt-ink-text)' : 'var(--mkt-stone-soft)', whiteSpace: 'nowrap', flexShrink: 0, borderBottom: i === 0 ? '2px solid var(--teal)' : '2px solid transparent' }}>
                  {tab}
                </div>
              ))}
            </div>
            {/* Clauses */}
            <div style={{ padding: '1.75rem 1.5rem', minHeight: '14rem' }}>
              {[
                { n: '1', title: 'Appointment of Executor', body: "Names who carries out your wishes. Your executor gathers your assets, pays any debts, and distributes what remains as you've set out below.", badge: null },
                { n: '2', title: 'Guardianship of Minor Children', body: 'Flagged for review — a change to your family situation since your last amendment may affect this clause.', badge: 'Included review recommended' },
                { n: '3', title: 'Distribution of Residuary Estate', body: 'Sets out how everything not otherwise gifted is divided. Last confirmed against your asset register two months ago.', badge: null },
              ].map(clause => (
                <div key={clause.n} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--mkt-line)' }}>
                  <div style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: 6, background: 'var(--mkt-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: 'var(--teal-deep)' }}>{clause.n}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.9rem', margin: 0 }}>{clause.title}</p>
                    <p style={{ fontSize: '.83rem', color: 'var(--mkt-stone)', marginTop: '.3rem', lineHeight: 1.55 }}>{clause.body}</p>
                    {clause.badge && <span style={{ display: 'inline-flex', marginTop: '.6rem', fontSize: '.68rem', fontWeight: 600, padding: '.32rem .7rem', borderRadius: 99, border: '1px solid var(--mkt-ink-text)', color: 'var(--mkt-ink-text)' }}>{clause.badge}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ margin: '0 1.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, background: 'var(--mkt-ink)', padding: '1rem 1.25rem', color: '#fff' }}>
              <span style={{ fontSize: '.85rem', fontWeight: 600 }}>Request solicitor review</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── LIVING VAULT / COMMAND CENTRE ────────────────────────────────── */}
      <section id="living-vault" style={{ ...SECTION_PAD, background: 'var(--mkt-surface-2)' }}>
        <Reveal className="md:px-10" style={W}>
          <div style={{ maxWidth: '38rem' }}>
            <span style={SECTION_LABEL}>The Command Centre</span>
            <H2>A single home for everything<br/>your estate needs to <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>keep working</em>.</H2>
            <Sub>Your Will is the start, not the finish. The Living Vault keeps your estate current as your life does — your assets, your people, your instructions, always in step.</Sub>
          </div>
          <div className="lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2" style={{ marginTop: '3.5rem', display: 'grid', gap: '1.1rem', gridTemplateColumns: '1fr' }}>
            <div className="lg:row-span-2" style={{ borderRadius: 14, background: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '20rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
              <div>
                <Pill variant="quiet">Living Vault</Pill>
                <h3 style={{ marginTop: '1rem', fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.015em', maxWidth: '20rem', color: 'var(--mkt-ink-text)', margin: '1rem 0 0' }}>Your estate, kept current.</h3>
                <p style={{ marginTop: '.75rem', fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)', maxWidth: '26rem' }}>Marriage, a new child, a property purchase, a business sold — each one can quietly invalidate parts of a Will. The Vault tracks the life events that matter and prompts an update before a gap becomes a problem for the people you&#8217;ve named.</p>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span style={{ flex: 1 }}>Marriage automatically revokes a prior Will in most Australian states</span>
                  <Pill variant="amber">Action needed</Pill>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span style={{ flex: 1 }}>New asset added: Investment property, Bondi</span>
                  <Pill>Synced</Pill>
                </div>
              </div>
            </div>
            {[
              { tag: 'Lawyer Review', h: "Available when it matters, at a flat rate.", p: 'Complex flags — business succession, trusts, blended families — are surfaced in your Vault. A solicitor review add-on is available for around $150, with direct access to our partner lawyers through the platform.' },
              { tag: 'Document Storage', h: "Everything in one place, always up to date.", p: "Your Will, asset register, and instructions stored securely in your Vault — so nothing is left to find at the worst possible time." },
            ].map(card => (
              <div key={card.tag} style={{ borderRadius: 14, background: '#fff', padding: '2rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
                <Pill variant="quiet">{card.tag}</Pill>
                <h3 style={{ marginTop: '1rem', fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.015em', color: 'var(--mkt-ink-text)', margin: '1rem 0 0' }}>{card.h}</h3>
                <p style={{ marginTop: '.75rem', fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>{card.p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <section style={SECTION_PAD}>
        <Reveal className="md:px-10" style={W}>
          <div style={{ maxWidth: '40rem' }}>
            <span style={SECTION_LABEL}>Why now</span>
            <H2>Estate planning has been <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>deprioritised</em>,<br/>not because it doesn&#8217;t matter.</H2>
          </div>
          <div className="md:grid-cols-3" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr', borderTop: '1px solid var(--mkt-line)', borderLeft: '1px solid var(--mkt-line)' }}>
            {[
              { num: '7', label: 'Guided steps from first login to a complete, structured Will' },
              { num: '8', label: 'States and territories covered — your Will is drafted to the legal requirements of wherever you live' },
              { num: '1', label: "Place your Will, your Vault, and your executor's instructions all live" },
            ].map(stat => (
              <div key={stat.num} style={{ borderRight: '1px solid var(--mkt-line)', borderBottom: '1px solid var(--mkt-line)', padding: '2.4rem 2rem' }}>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem, 5vw, 4.6rem)', lineHeight: .9, color: 'var(--mkt-ink-text)', margin: 0 }}>{stat.num}</p>
                <p style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--mkt-line)', fontSize: '.8rem', color: 'var(--mkt-stone)', letterSpacing: '.02em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── MANIFESTO ────────────────────────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: '#fff', borderTop: '1px solid var(--mkt-line)', borderBottom: '1px solid var(--mkt-line)' }}>
        <Reveal className="md:px-10" style={W}>
          <p style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal)', marginBottom: '2rem' }}>From the founder</p>
          <blockquote style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(1.7rem, 2.9vw, 2.6rem)', lineHeight: 1.25, letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', maxWidth: '46rem', margin: 0 }}>
            &#8220;We built Heirloom Life because a Will isn&#8217;t paperwork — it&#8217;s the last conversation you get to have with the people you love. It deserves better than a template and a filing cabinet.&#8221;
          </blockquote>
          <p style={{ marginTop: '2rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>Aaron Lee</p>
          <p style={{ marginTop: '.2rem', color: 'var(--mkt-stone)', fontSize: '.9rem' }}>Founder, Heirloom Life</p>
        </Reveal>
      </section>

      {/* ─── PRICING PREVIEW ──────────────────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: 'var(--mkt-surface-2)' }}>
        <Reveal className="md:px-10" style={W}>
          <div style={{ maxWidth: '34rem' }}>
            <span style={SECTION_LABEL}>Membership</span>
            <H2>Priced like something<br/>worth <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>getting right</em>.</H2>
            <Sub>A one-off Will to get your estate in order, and a Vault membership to keep it that way. No per-clause upsells, no surprise renewals.</Sub>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/pricing" className="mkt-btn-ink-m">View pricing</Link>
          </div>
        </Reveal>
      </section>

      {/* ─── FOR ADVISERS BAND ────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--mkt-line)', borderBottom: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10 md:flex-row md:items-center md:justify-between" style={{ ...W, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBlock: '2.2rem' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)', fontWeight: 500, letterSpacing: '-.02em', maxWidth: '32rem', margin: 0, color: 'var(--mkt-ink-text)' }}>
            Refer your clients into an estate plan they&#8217;ll actually finish.
          </h2>
          <Link href="/for-advisers" className="mkt-btn-ink-m" style={{ flexShrink: 0 }}>
            Partner with Heirloom
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}

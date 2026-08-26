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

export const metadata = { title: 'Living Vault — Heirloom Life', description: 'The estate command centre that keeps your Will current as your life changes.' }

export default function LivingVaultPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '7rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '44rem' }}>
            <span style={SECTION_LABEL}>The Command Centre</span>
            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(2.6rem, 5vw, 4.6rem)', lineHeight: 1.04,
              letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', margin: 0,
            }}>
              A single home for everything<br/>
              your estate needs to{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--teal-deep)' }}>keep working</em>.
            </h1>
            <p style={{ marginTop: '1.75rem', maxWidth: '34rem', fontSize: '1.1rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
              Your Will is the start, not the finish. The Living Vault keeps your estate current as your life does — your assets, your people, your instructions, always in step.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/dashboard" className="mkt-btn-ink-l">
                Open your Vault
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/start" className="mkt-btn-ghost-l">
                Start your Will
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vault cards ───────────────────────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: '#fff' }}>
        <div className="md:px-10" style={W}>
          <div className="lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.1rem' }}>
            {/* Tall card */}
            <div className="lg:row-span-2" style={{ borderRadius: 14, background: 'var(--mkt-surface)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '24rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
              <div>
                <Pill variant="quiet">Living Vault</Pill>
                <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-.015em', color: 'var(--mkt-ink-text)', margin: '1rem 0 0' }}>
                  Your estate, kept current.
                </h2>
                <p style={{ marginTop: '.75rem', fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
                  Marriage, a new child, a property purchase, a business sold — each one can quietly invalidate parts of a Will. The Vault tracks the life events that matter and prompts an update before a gap becomes a problem for the people you&#8217;ve named.
                </p>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: '#fff', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span style={{ flex: 1, color: 'var(--mkt-ink-text)' }}>Marriage automatically revokes a prior Will in most Australian states</span>
                  <Pill variant="amber">Action needed</Pill>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: '#fff', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span style={{ flex: 1, color: 'var(--mkt-ink-text)' }}>New asset added: Investment property, Bondi</span>
                  <Pill>Synced</Pill>
                </div>
              </div>
            </div>

            {/* Standard cards */}
            {[
              {
                tag: 'Lawyer Review',
                title: 'Included where it matters, priced where it doesn\'t.',
                body: 'High-severity flags — guardianship, trusts, business succession — come with included solicitor review each year. Minor changes stay self-serve, so premium attention goes where the stakes are highest.',
              },
              {
                tag: 'Executor Access',
                title: 'Built for the day it\'s actually needed.',
                body: 'A verified path from death certificate to executor access — identity-verified and cross-referenced, so the people you trust aren\'t left guessing at the worst possible time.',
              },
            ].map(card => (
              <div key={card.tag} style={{ borderRadius: 14, background: 'var(--mkt-surface)', padding: '2rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
                <Pill variant="quiet">{card.tag}</Pill>
                <h2 style={{ marginTop: '1rem', fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.015em', color: 'var(--mkt-ink-text)', margin: '1rem 0 0' }}>{card.title}</h2>
                <p style={{ marginTop: '.75rem', fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What the Vault tracks ─────────────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '38rem', marginBottom: '3rem' }}>
            <span style={SECTION_LABEL}>Life events</span>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-.02em', fontWeight: 500, color: 'var(--mkt-ink-text)', margin: 0 }}>
              The events that change your estate — and that most Wills miss.
            </h2>
          </div>
          <div className="md:grid-cols-2 lg:grid-cols-3" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1px', background: 'var(--mkt-line)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { event: 'Marriage', note: 'Automatically revokes a prior Will in most Australian states' },
              { event: 'Divorce', note: 'Revokes gifts and executor appointments to former spouses in most states' },
              { event: 'New child', note: 'May affect guardianship and equal-distribution clauses' },
              { event: 'Property purchase or sale', note: 'Updates the asset register; specific gifts may need revision' },
              { event: 'Business sale or transfer', note: 'Can significantly change your estate composition' },
              { event: 'Death of named executor', note: 'Requires appointment of a replacement before the Will is actionable' },
            ].map(item => (
              <div key={item.event} style={{ background: '#fff', padding: '1.5rem 1.75rem' }}>
                <p style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--mkt-ink-text)', margin: '0 0 .4rem' }}>{item.event}</p>
                <p style={{ fontSize: '.85rem', color: 'var(--mkt-stone)', lineHeight: 1.55, margin: 0 }}>{item.note}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1.25rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.5 }}>
            Rules vary by state. Heirloom Life currently serves NSW and VIC — other states can join the waitlist.
          </p>
        </div>
      </section>

      {/* ── Executor Access ───────────────────────────────────────────────── */}
      <section style={{ ...SECTION_PAD, background: 'var(--mkt-paper)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: '44rem' }}>
          <span style={SECTION_LABEL}>Executor Access</span>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-.02em', fontWeight: 500, color: 'var(--mkt-ink-text)', margin: 0 }}>
            A verified path from death certificate to{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>access</em>.
          </h2>
          <p style={{ marginTop: '1rem', fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
            Your executor is granted access after lodging the death certificate and verifying their identity. When it&#8217;s needed, the process is clear and nothing is left to guess.
          </p>
          <div style={{ marginTop: '1.5rem', border: '1px solid var(--mkt-line)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { label: 'Executor', value: 'Named by you in your Will' },
              { label: 'Access trigger', value: 'Death certificate lodgement + identity verification' },
              { label: 'Instructions', value: 'Provided digitally to your named executor' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '9rem 1fr', borderBottom: i < arr.length - 1 ? '1px solid var(--mkt-line)' : 'none' }}>
                <div style={{ background: 'var(--mkt-surface-2)', padding: '.85rem 1rem', fontSize: '.7rem', fontWeight: 600, color: 'var(--mkt-stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{row.label}</div>
                <div style={{ padding: '.85rem 1rem', fontSize: '.85rem', color: 'var(--mkt-ink-text)' }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10 md:flex-row md:items-center md:justify-between" style={{ ...W, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBlock: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)', fontWeight: 500, letterSpacing: '-.02em', maxWidth: '28rem', margin: 0, color: 'var(--mkt-ink-text)' }}>
            Start with the Will. Stay with the Vault.
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="mkt-btn-ink-m">Open your Vault</Link>
            <Link href="/start" className="mkt-btn-ghost-m">Start your Will</Link>
          </div>
        </div>
      </section>
    </>
  )
}

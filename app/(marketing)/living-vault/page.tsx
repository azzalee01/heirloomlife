import Link from 'next/link'
import EditorialBanner from '@/components/marketing/EditorialBanner'

const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }
const SECTION_PAD: React.CSSProperties = { paddingBlock: '5.5rem' }
const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

function Pill({ children, variant = 'teal' }: { children: React.ReactNode; variant?: 'teal' | 'amber' | 'quiet' }) {
  const accent = variant === 'teal' ? 'var(--teal)' : variant === 'amber' ? 'var(--mkt-stone)' : 'var(--mkt-line)'
  const color = variant === 'quiet' ? 'var(--mkt-stone)' : 'var(--teal-deep)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
      paddingLeft: '.55rem', color, borderLeft: `2px solid ${accent}`,
    }}>
      {children}
    </span>
  )
}

export const metadata = { title: 'Living Vault  -  Heirloom Life', description: 'The estate command centre that keeps your Will current as your life changes.' }

export default function LivingVaultPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '7rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface-2)', overflow: 'hidden' }}>
        <div className="relative md:flex md:min-h-[30rem] md:items-center md:px-10" style={W}>
          <div className="relative z-10 md:w-[54%]" style={{ maxWidth: '44rem' }}>
            <span style={SECTION_LABEL}>The Command Centre</span>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(2.6rem, 5vw, 4.6rem)', lineHeight: 1.04,
              letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', margin: 0,
            }}>
              Your Will starts the plan.<br/>
              Living Vault keeps it{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--teal-deep)' }}>ready for life</em>.
            </h1>
            <p style={{ marginTop: '1.75rem', maxWidth: '34rem', fontSize: '1.1rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
              Tell us when life changes. Living Vault helps you review what may be affected, maintain your Will and estate record, and keep everything organised for the people who may one day need it.
            </p>
            <p style={{ marginTop: '1rem', fontSize: '.9rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>
              Included for three months with a $129 one-off Will, or continuously with the $99 annual Heirloom Membership—which includes your Will.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/dashboard" className="mkt-btn-ink-l">
                Open your Vault
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/start?path=retail" className="mkt-btn-ghost-l">
                Start your Will
              </Link>
            </div>
          </div>
          <EditorialBanner src="/images/editorial/living-vault.jpg" alt="An organised estate archive and digital Vault" />
        </div>
      </section>

      <section style={{ paddingBlock: '3rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 md:grid-cols-3" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '1px', background: 'var(--mkt-line)', border: '1px solid var(--mkt-line)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            ['Keep it current', 'Guided life-change check-ins and supported amendments when your details or wishes change.'],
            ['Keep it together', 'Your Will, assets, beneficiaries, executors and important estate information in one organised place.'],
            ['Keep it ready', 'Will status, witnessing guidance, estate recommendations and a pathway to professional support when needed.'],
          ].map(([title, body]) => (
            <div key={title} style={{ background: 'var(--mkt-surface)', padding: '1.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{title}</h2>
              <p style={{ margin: '.7rem 0 0', fontSize: '.86rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>{body}</p>
            </div>
          ))}
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
                  Marriage, a new child, a property purchase or a business sale can change what your estate plan needs to do. Report the change in your Vault and we&#8217;ll guide you through the information that may need review.
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
                body: 'High-severity flags  -  guardianship, trusts, business succession  -  are surfaced in your Vault with a clear recommendation. A solicitor review add-on is available for around $150, and you can communicate directly with our partner lawyers through the platform.',
              },
              {
                tag: 'Document Storage',
                title: 'Everything your family needs, in one place.',
                body: 'Your Will, asset register, and instructions are stored securely in your Vault. When it matters, there is no searching through filing cabinets  -  it\'s all there.',
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
            <h2 style={{ fontFamily: "var(--font-body)", fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-.02em', fontWeight: 500, color: 'var(--mkt-ink-text)', margin: 0 }}>
              The events that change your estate  -  and that most Wills miss.
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
            Rules vary by state. Heirloom Life is available across Australia  -  your Will is drafted to the specific requirements of your state.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10 md:flex-row md:items-center md:justify-between" style={{ ...W, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBlock: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)', fontWeight: 500, letterSpacing: '-.02em', maxWidth: '28rem', margin: 0, color: 'var(--mkt-ink-text)' }}>
            One Will. One Vault. Choose the access that suits you.
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="mkt-btn-ink-m">Open your Vault</Link>
            <Link href="/pricing" className="mkt-btn-ghost-m">Compare $129 once and $99/year</Link>
          </div>
        </div>
      </section>
    </>
  )
}

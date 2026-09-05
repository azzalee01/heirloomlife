import type { Metadata } from 'next'
import Link from 'next/link'
import { LIFE_CHANGES } from './_data'

export const metadata: Metadata = {
  title: 'Life Changes and Your Will | Heirloom Life',
  description: 'Understand what marriage, children, property, separation, illness, business changes and moving may mean for your estate plan.',
}

const W: React.CSSProperties = { maxWidth: 1120, marginInline: 'auto', paddingInline: '1.5rem' }

export default function LifeChangesPage() {
  return (
    <>
      <section style={{ paddingBlock: '7rem 5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <p style={{ margin: 0, color: 'var(--teal-deep)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>Life changes</p>
          <h1 style={{ margin: '1.25rem 0 0', maxWidth: '48rem', fontSize: 'clamp(2.7rem, 5.5vw, 5rem)', lineHeight: 1.02, fontWeight: 400, color: 'var(--mkt-ink-text)' }}>Know exactly what life changes mean for your estate plan.</h1>
          <p style={{ margin: '1.5rem 0 0', maxWidth: '39rem', fontSize: '1.08rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>Choose what is happening in your life. Learn the legal rule, understand what needs attention, work through a practical checklist, then take the next step.</p>
        </div>
      </section>

      <section style={{ paddingBlock: '5rem', background: '#fff' }}>
        <div className="md:px-10" style={W}>
          <div className="sm:grid-cols-2 lg:grid-cols-4" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '.85rem' }}>
            {LIFE_CHANGES.map((event) => (
              <Link key={event.slug} href={`/life-changes/${event.slug}`} style={{ position: 'relative', overflow: 'hidden', display: 'flex', minHeight: 210, flexDirection: 'column', justifyContent: 'space-between', padding: '1.4rem', border: '1px solid var(--mkt-line)', borderRadius: 12, background: 'var(--mkt-surface)', color: 'inherit', textDecoration: 'none' }}>
                <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--teal-deep)' }}>{event.eyebrow}</p>
                  <h2 style={{ margin: '.8rem 0 0', fontSize: '1.08rem', lineHeight: 1.25, fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{event.shortTitle}</h2>
                  <p style={{ margin: '.65rem 0 0', fontSize: '.8rem', lineHeight: 1.55, color: 'var(--mkt-stone)' }}>{event.summary}</p>
                </div>
                <span style={{ marginTop: '1rem', fontSize: '.8rem', fontWeight: 600, color: 'var(--teal-deep)' }}>What to review →</span>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '4rem', padding: '2rem', border: '1px solid var(--mkt-line)', borderRadius: 12, background: 'var(--mkt-surface-2)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ maxWidth: '36rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>Your life is personal. Your next step should be too.</h2>
              <p style={{ margin: '.7rem 0 0', fontSize: '.88rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>Create a new Will, or use Living Vault to organise what changed and review your existing estate information.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
              <Link href="/start?path=retail" className="mkt-btn-ink-m">Create my Will</Link>
              <Link href="/living-vault" className="mkt-btn-ghost-m">Explore Living Vault</Link>
            </div>
          </div>

          <p style={{ margin: '1.5rem 0 0', fontSize: '.76rem', lineHeight: 1.6, color: 'var(--mkt-stone-soft)' }}>This information is general and does not determine the legal effect of an event in your circumstances. Laws and document requirements vary across Australia. Obtain legal advice where you are unsure.</p>
        </div>
      </section>
    </>
  )
}

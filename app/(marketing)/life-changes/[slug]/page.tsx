import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EditorialBanner from '@/components/marketing/EditorialBanner'
import { getLifeChange, LIFE_CHANGES } from '../_data'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return LIFE_CHANGES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getLifeChange((await params).slug)
  if (!event) return {}
  return {
    title: `${event.title} and Your Will | Heirloom Life`,
    description: `${event.summary} Read what may need attention and use a practical estate-planning checklist.`,
  }
}

export default async function LifeChangePage({ params }: Props) {
  const event = getLifeChange((await params).slug)
  if (!event) notFound()

  return (
    <>
      <section style={{ paddingBlock: '3.25rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', overflow: 'hidden' }}>
        <div className="relative md:flex md:min-h-[25rem] md:items-center md:px-10" style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <div className="relative z-10 md:w-[54%]">
            <Link href="/life-changes" style={{ fontSize: '.78rem', color: 'var(--teal-deep)', textDecoration: 'none', fontWeight: 600 }}>← All life changes</Link>
            <p style={{ margin: '1.5rem 0 0', color: 'var(--teal-deep)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>{event.eyebrow}</p>
            <h1 style={{ margin: '1rem 0 0', maxWidth: '45rem', fontSize: 'clamp(2.6rem, 5.4vw, 4.8rem)', lineHeight: 1.03, fontWeight: 400, color: 'var(--mkt-ink-text)' }}>{event.title}</h1>
            <p style={{ margin: '1.4rem 0 0', maxWidth: '36rem', fontSize: '1.08rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>{event.introduction}</p>
          </div>
          <EditorialBanner src={`/images/life-changes/${event.slug}.jpg`} alt={`${event.shortTitle} — a new chapter in life`} />
        </div>
      </section>

      <section style={{ paddingBlock: '4.5rem', background: '#fff' }}>
        <div className="md:px-10 lg:grid-cols-[1fr_18rem]" style={{ maxWidth: 1000, marginInline: 'auto', paddingInline: '1.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
          <div>
            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', border: '1px solid var(--mkt-line)', borderLeft: '2px solid var(--teal)', borderRadius: 12, background: 'var(--mkt-surface)' }}>
              <p style={{ margin: 0, color: 'var(--teal-deep)', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>The legal position</p>
              <p style={{ margin: '.7rem 0 0', fontSize: '.92rem', lineHeight: 1.72, color: 'var(--mkt-ink-text)' }}>{event.legalRule}</p>
            </div>
            <p style={{ margin: 0, color: 'var(--teal-deep)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>What may need attention</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              {event.considerations.map((item, index) => (
                <article key={item.title} style={{ paddingBlock: '1.4rem', borderTop: '1px solid var(--mkt-line)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ color: 'var(--teal-deep)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.15rem' }}>0{index + 1}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{item.title}</h2>
                      <p style={{ margin: '.55rem 0 0', fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>{item.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderLeft: '2px solid var(--teal)', background: 'var(--mkt-surface)' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>When professional advice matters</h2>
              <p style={{ margin: '.65rem 0 0', fontSize: '.87rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>{event.advice}</p>
            </div>
          </div>

          <aside>
            <div style={{ border: '1px solid var(--mkt-line)', borderRadius: 12, padding: '1.4rem', background: 'var(--mkt-surface)' }}>
              <p style={{ margin: 0, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--teal-deep)' }}>Your review checklist</p>
              <ul style={{ margin: '1.15rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                {event.checklist.map((item) => <li key={item} style={{ display: 'flex', gap: '.6rem', fontSize: '.8rem', lineHeight: 1.5, color: 'var(--mkt-stone)' }}><span style={{ color: 'var(--teal-deep)' }}>✓</span>{item}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ maxWidth: 1000, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>Ready to take the next step?</h2>
          <p style={{ margin: '.8rem 0 0', maxWidth: '38rem', fontSize: '.9rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>Pay $129 once for your Will and three months of Vault benefits, or join for $99 a year to keep your Will and estate information supported as this chapter unfolds.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Link href="/start?path=retail" className="mkt-btn-ink-m">Create my Will</Link>
            <Link href="/living-vault" className="mkt-btn-ghost-m">See Living Vault</Link>
          </div>

          {event.sources.length > 0 && <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--mkt-line)' }}>
            <p style={{ margin: 0, fontSize: '.72rem', fontWeight: 700, color: 'var(--mkt-ink-text)' }}>Useful official information</p>
            <div style={{ marginTop: '.65rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {event.sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer" style={{ fontSize: '.76rem', color: 'var(--teal-deep)' }}>{source.label} ↗</a>)}
            </div>
          </div>}
          <p style={{ margin: '1.5rem 0 0', fontSize: '.73rem', lineHeight: 1.6, color: 'var(--mkt-stone-soft)' }}>General information only, not legal, financial, tax or medical advice. The effect of a life event depends on your jurisdiction, documents and circumstances.</p>
        </div>
      </section>
    </>
  )
}

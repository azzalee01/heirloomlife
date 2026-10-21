import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LIFE_CHANGES } from '../../life-changes/_data'

const LP_COPY: Record<string, { headline: string; em: string; sub: string }> = {
  'getting-married': {
    headline: 'Just got engaged?',
    em: 'Your Will needs to know.',
    sub: 'Marriage can revoke a prior Will in every Australian state. Write a new one free, in about 15 minutes.',
  },
  'separation-divorce': {
    headline: 'Your relationship changed.',
    em: 'Your Will should too.',
    sub: "Review who inherits and who you've appointed to act. Update your estate plan in 15 minutes.",
  },
  'new-child': {
    headline: 'Who raises your child',
    em: "if you're not there?",
    sub: 'Name a guardian in writing — not just an assumption. Free to draft, in about 15 minutes.',
  },
  'buying-selling-property': {
    headline: 'You bought the house.',
    em: 'Who gets it?',
    sub: 'Without a Will, the law decides who inherits your property — not you. Draft free in 15 minutes.',
  },
  'starting-selling-business': {
    headline: 'Big move in business.',
    em: 'Protect everything else.',
    sub: 'Connect your business interests with your personal estate plan. Start free in 15 minutes.',
  },
  'receiving-inheritance': {
    headline: "You've received an inheritance.",
    em: 'Protect what comes next.',
    sub: 'A change in wealth is a reason to review your estate plan. Free to draft in 15 minutes.',
  },
  'serious-illness': {
    headline: 'Put your wishes in writing,',
    em: 'while you can.',
    sub: 'A Will is the clearest way to protect the people and things you love most.',
  },
  'moving-interstate': {
    headline: 'New state.',
    em: 'Updated Will?',
    sub: 'Moving can affect your estate planning documents. Review and update free in 15 minutes.',
  },
}

export function generateStaticParams() {
  return LIFE_CHANGES.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = LIFE_CHANGES.find((e) => e.slug === slug)
  const copy = LP_COPY[slug]
  if (!event || !copy) return {}
  return {
    title: `${event.shortTitle} | Heirloom Life`,
    description: copy.sub,
    robots: { index: false, follow: false },
    alternates: { canonical: `https://www.heirloomlife.com.au/lp/${slug}` },
  }
}

const W: React.CSSProperties = {
  maxWidth: 1240,
  marginInline: 'auto',
  paddingInline: '1.5rem',
}

const TRUST_ITEMS = [
  { label: 'Solicitor-reviewed', desc: 'Checked before issue' },
  { label: 'Plain English', desc: 'Readable, not legalese' },
  { label: 'Kept current', desc: 'Update as life changes' },
]

export default async function LifeEventLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = LIFE_CHANGES.find((e) => e.slug === slug)
  const copy = LP_COPY[slug]
  if (!event || !copy) notFound()

  const position = event.heroObjectPosition ?? 'center'

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ position: 'relative', background: '#f5f0e8', overflow: 'hidden' }}>
        <Image
          src={`/images/life-changes/${event.slug}.webp`}
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: position }}
          aria-hidden="true"
        />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(245,240,232,0.88) 0%, rgba(245,240,232,0.66) 20%, rgba(245,240,232,0.52) 42%, rgba(245,240,232,0.48) 58%, rgba(245,240,232,0.88) 100%)',
        }} />
        <div style={{ ...W, position: 'relative', zIndex: 2, paddingTop: '12rem', paddingBottom: '12rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.5rem', display: 'block' }}>
            {event.eyebrow}
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.4rem, 7.5vw, 6.8rem)',
            lineHeight: 0.93,
            letterSpacing: '-.025em',
            color: 'var(--mkt-ink-text)',
            margin: 0,
          }}>
            {copy.headline}<br />
            <em style={{ fontStyle: 'italic', color: 'var(--teal-deep)' }}>{copy.em}</em>
          </h1>
          <p style={{ marginTop: '2.25rem', maxWidth: '26rem', marginInline: 'auto', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-ink-text)', textShadow: '0 1px 8px rgba(245,240,232,1), 0 2px 20px rgba(245,240,232,0.95)' }}>
            {copy.sub}
          </p>
          <div style={{ marginTop: '2.5rem' }}>
            <Link href="/start?path=retail" className="mkt-btn-ink-l">
              Create my Will
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '.8rem', color: 'var(--mkt-ink-text)', textShadow: '0 1px 8px rgba(245,240,232,1), 0 2px 20px rgba(245,240,232,0.95)' }}>
            Free to draft · about 15 minutes · <strong>$149 to issue</strong>
          </p>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section style={{ borderTop: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)', paddingBlock: '3rem' }}>
        <div style={{ maxWidth: 680, marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem' }}>
          {TRUST_ITEMS.map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '.88rem', color: 'var(--mkt-ink-text)' }}>{item.label}</p>
              <p style={{ margin: '.25rem 0 0', fontSize: '.78rem', color: 'var(--mkt-stone)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link href={`/life-changes/${event.slug}`} style={{ fontSize: '.8rem', color: 'var(--teal-deep)', fontWeight: 600, textDecoration: 'none' }}>
            Learn what {event.eyebrow.toLowerCase()} means for your estate →
          </Link>
        </p>
      </section>
    </>
  )
}

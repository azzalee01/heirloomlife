import Link from 'next/link'
import type { Metadata } from 'next'
import Reveal from '@/components/marketing/Reveal'
import LifeEventHeroImage from '@/components/marketing/LifeEventHeroImage'

export const metadata: Metadata = {
  title: 'Name a Guardian for Your Child | Heirloom Life',
  description: 'If neither of you could raise your child, who would? Without a Will, a court decides. Name a guardian in about 15 minutes.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/new-baby' },
  openGraph: {
    title: 'Name a Guardian for Your Child | Heirloom Life',
    description: 'If neither of you could raise your child, who would? Without a Will, a court decides.',
    url: 'https://www.heirloomlife.com.au/new-baby',
    siteName: 'Heirloom Life',
    type: 'website',
  },
}

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
      fontFamily: 'var(--font-body)', color: 'var(--mkt-ink-text)', margin: 0,
    }}>{children}</h2>
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
  const accent = variant === 'teal' ? 'var(--teal)' : variant === 'amber' ? 'var(--mkt-stone)' : 'var(--mkt-line)'
  const color = variant === 'quiet' ? 'var(--mkt-stone)' : 'var(--teal-deep)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
      paddingLeft: '.55rem', color, borderLeft: `2px solid ${accent}`,
    }}>{children}</span>
  )
}

export default function NewBabyPage() {
  const heroCopy = (
    <>
      <span style={{ ...SECTION_LABEL, marginBottom: '1.5rem' }}>New baby</span>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3.2rem, 7vw, 6.4rem)',
        lineHeight: 0.95,
        letterSpacing: '-.025em',
        color: 'var(--mkt-ink-text)',
        margin: 0,
      }}>
        Who raises your child?<br />
        <em style={{
          fontStyle: 'italic',
          color: 'var(--mkt-ink-text)',
          textDecoration: 'underline',
          textDecorationColor: 'var(--teal)',
          textDecorationThickness: '2px',
          textUnderlineOffset: '8px',
        }}>Without a Will,<br />a court decides.</em>
      </h1>
      <p style={{ marginTop: '2.25rem', maxWidth: '28rem', marginInline: 'auto', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
        Name a guardian for your child. Free to draft, in about 15 minutes.
      </p>
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/start" className="mkt-btn-ink-l">
          Name a guardian
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <Link href="/how-it-works" className="mkt-btn-ink-l" style={{ background: 'transparent', border: '1.5px solid var(--teal)', color: 'var(--teal-deep)' }}>
          How it works
        </Link>
      </div>
      <p style={{ marginTop: '1.25rem', fontSize: '.8rem', color: 'var(--mkt-stone)' }}>
        Free to draft &middot; about 15 minutes &middot; <strong style={{ color: 'var(--mkt-ink-text)' }}>$149 to issue</strong>
      </p>
      <p style={{ margin: '.5rem 0 0', fontSize: '.72rem', color: 'var(--mkt-stone)', opacity: .6 }}>
        General information only, not legal advice.
      </p>
    </>
  )

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ position: 'relative', background: 'var(--mkt-surface)', color: 'var(--mkt-ink-text)', overflow: 'hidden' }}>
        <div
            className="lg:flex lg:items-center lg:gap-16"
            style={{ ...W, paddingTop: '7rem', paddingBottom: '3.5rem' }}
          >
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-1">
              {heroCopy}
            </div>
            <div className="mt-10 lg:mt-0 w-full lg:w-[560px] lg:shrink-0">
              <LifeEventHeroImage
                src="/images/life-events/new-baby.webp"
                alt="Two parents leaning over a newborn in the mother's arms, with a cot visible behind"
              />
            </div>
          </div>
      </section>

      {/* ── Why it matters ── */}
      <section style={{ ...SECTION_PAD, background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <Reveal
          className="md:px-10 lg:grid lg:gap-16 lg:items-center"
          style={{ ...W, gridTemplateColumns: '1fr 1fr' }}
        >
          <div>
            <span style={SECTION_LABEL}>Why it matters now</span>
            <H2>An assumption isn&apos;t a plan.</H2>
            <Sub>Most new parents have someone in mind. Without a Will, that&apos;s all it is — an assumption. If neither of you could raise your child, a court would decide who does.</Sub>
            <Sub>That process takes time, costs money, and may not reflect what you&apos;d have wanted. Naming a guardian takes about 15 minutes.</Sub>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '.9rem', flexWrap: 'wrap' }}>
              <Link href="/start" className="mkt-btn-ink-l">
                Name a guardian
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/the-will" className="mkt-btn-ghost-l">About the Will</Link>
            </div>
          </div>

          {/* Guardian form mockup — reused from homepage guardianship section */}
          <div className="mt-12 lg:mt-0" style={{ borderRadius: 12, background: '#fff', border: '1px solid var(--mkt-line)', boxShadow: '0 20px 60px rgba(15,30,28,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '.9rem 1.25rem', borderBottom: '1px solid var(--mkt-line)', background: 'var(--mkt-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--mkt-stone)' }}>Step 3 of 7 — Guardian for Minor Children</span>
              <Pill variant="quiet">In progress</Pill>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .35rem' }}>Guardian&apos;s full name</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', marginBottom: '1rem' }}>
                <div style={{ padding: '.6rem .75rem', borderRadius: 6, border: '1px solid var(--teal)', fontSize: '.875rem', color: 'var(--mkt-ink-text)', background: '#fff' }}>Sarah</div>
                <div style={{ padding: '.6rem .75rem', borderRadius: 6, border: '1px solid var(--mkt-line)', fontSize: '.875rem', color: 'var(--mkt-ink-text)', background: '#fff' }}>Williams</div>
              </div>
              <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .35rem' }}>Relationship to you</p>
              <div style={{ padding: '.6rem .75rem', borderRadius: 6, border: '1px solid var(--mkt-line)', fontSize: '.875rem', color: 'var(--mkt-ink-text)', background: '#fff', marginBottom: '1.25rem' }}>Sister</div>
              <div style={{ padding: '.85rem 1rem', borderRadius: 8, background: 'rgba(42,180,174,0.06)', border: '1px solid rgba(42,180,174,0.2)', display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <p style={{ margin: 0, fontSize: '.8rem', lineHeight: 1.55, color: 'var(--mkt-ink-text)' }}>
                  <strong>Sarah Williams</strong> has been named as guardian for any children under 18 at the time of your death.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── What you get ── */}
      <section style={{ ...SECTION_PAD, background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <Reveal className="md:px-10" style={W}>
          <div style={{ maxWidth: '38rem', marginBottom: '3rem' }}>
            <span style={SECTION_LABEL}>What Heirloom gives you</span>
            <H2>You planned the nursery. Plan this.</H2>
          </div>
          <div className="lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2" style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: '1fr' }}>
            <div className="lg:row-span-2" style={{ borderRadius: 14, background: '#fff', padding: '2rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
              <Pill variant="quiet">Guardianship</Pill>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.015em', color: 'var(--mkt-ink-text)', margin: '1rem 0 .75rem' }}>Name who raises your child.</h3>
              <p style={{ fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)', maxWidth: '26rem' }}>
                Name a primary guardian and a backup in your Will — so there&apos;s no ambiguity if both of you can&apos;t be there. Guardian appointment is part of a complete Will, including who inherits your estate and how it&apos;s managed on your child&apos;s behalf.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span>Primary guardian named in your Will</span><Pill>Covered</Pill>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span>Backup guardian if primary cannot act</span><Pill>Covered</Pill>
                </div>
              </div>
            </div>
            {[
              { tag: 'Solicitor review', h: 'Reviewed before issue.', p: 'Every Will is checked against a solicitor-written checklist. Your family deserves a Will that holds up when it matters.' },
              { tag: 'Living Vault', h: 'Update it as they grow.', p: 'New child, change of guardian, new assets — your Will lives in your Heirloom Vault and can be updated whenever you need to.' },
            ].map(card => (
              <div key={card.tag} style={{ borderRadius: 14, background: '#fff', padding: '2rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
                <Pill variant="quiet">{card.tag}</Pill>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.015em', color: 'var(--mkt-ink-text)', margin: '1rem 0 0' }}>{card.h}</h3>
                <p style={{ marginTop: '.75rem', fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>{card.p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section style={{ paddingBlock: '5.5rem', background: 'var(--teal-deep)' }}>
        <div style={{ ...W, maxWidth: 640, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1.0, fontWeight: 400, color: '#fff', margin: '0 0 1.25rem' }}>
            Put your answer<br />in writing.
          </h2>
          <p style={{ margin: '0 0 .5rem', fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
            Free to draft. $149 when you&apos;re ready to issue.
          </p>
          <p style={{ margin: '0 0 2.5rem', fontSize: '.88rem', color: 'rgba(255,255,255,0.5)' }}>About 15 minutes from start to draft.</p>
          <Link href="/start" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: '#fff', color: 'var(--teal-deep)', fontWeight: 700, fontSize: '1rem', padding: '.9rem 2rem', borderRadius: 99, textDecoration: 'none' }}>
            Name a guardian
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="var(--teal-deep)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p style={{ marginTop: '1.75rem', fontSize: '.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '.04em' }}>
            General information only, not legal advice.
          </p>
        </div>
      </section>
    </>
  )
}

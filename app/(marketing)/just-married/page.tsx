import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import Reveal from '@/components/marketing/Reveal'

export const metadata: Metadata = {
  title: 'Just Married? Your Old Will May No Longer Apply | Heirloom Life',
  description: 'Marriage can revoke an earlier Will in most Australian states. Write a new one free, in about 15 minutes.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/just-married' },
  openGraph: {
    title: 'Just Married? Your Old Will May No Longer Apply | Heirloom Life',
    description: 'Marriage can revoke an earlier Will in most Australian states.',
    url: 'https://www.heirloomlife.com.au/just-married',
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

export default function JustMarriedPage() {
  const heroCopy = (
    <>
      <span style={{ ...SECTION_LABEL, marginBottom: '1.5rem' }}>Just married</span>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3.2rem, 7vw, 6.4rem)',
        lineHeight: 0.95,
        letterSpacing: '-.025em',
        color: 'var(--mkt-ink-text)',
        margin: 0,
      }}>
        Married?{' '}
        <em style={{
          fontStyle: 'italic',
          color: 'var(--mkt-ink-text)',
          textDecoration: 'underline',
          textDecorationColor: 'var(--teal)',
          textDecorationThickness: '2px',
          textUnderlineOffset: '8px',
        }}>Your old Will<br />may no longer apply.</em>
      </h1>
      <p style={{ marginTop: '2.25rem', maxWidth: '28rem', marginInline: 'auto', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
        Marriage can revoke an earlier Will. Write a new one — free, in about 15 minutes.
      </p>
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/start" className="mkt-btn-ink-l">
          Start free
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
      <section style={{ position: 'relative', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', overflow: 'hidden', minHeight: 560 }}>
        {/* Text — z-indexed above image */}
        <div className="md:px-10" style={{ position: 'relative', zIndex: 1, maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem', paddingTop: '7rem', paddingBottom: '3.5rem' }}>
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left" style={{ maxWidth: '45rem' }}>
            {heroCopy}
          </div>
        </div>
        {/* Image — absolute, bleeds to right edge */}
        <div className="hidden lg:block" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '55%' }}>
          <Image
            src="/images/life-changes/getting-married.webp"
            alt=""
            fill
            priority
            quality={85}
            sizes="(min-width: 1024px) 800px, 100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center 68%',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 28%)',
            }}
          />
        </div>
        {/* Mobile image */}
        <div className="lg:hidden" style={{ paddingBottom: '2.5rem' }}>
          <div style={{
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 52%, transparent 86%)',
            maskImage: 'linear-gradient(to right, black 0%, black 52%, transparent 86%)',
          }}>
            <Image src="/images/life-changes/getting-married.webp" alt="" width={1080} height={830} quality={85} sizes="100vw" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* ── Why it matters ── */}
      <section style={{ ...SECTION_PAD, background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <Reveal
          className="md:px-10 lg:grid lg:gap-16 lg:items-center"
          style={{ ...W, gridTemplateColumns: '1fr 1.1fr' }}
        >
          <div>
            <span style={SECTION_LABEL}>Why it matters now</span>
            <H2>Your Will didn&apos;t get the memo.</H2>
            <Sub>Under Australian law, marriage can automatically revoke a Will made before the ceremony — regardless of what it says. If you had an existing Will, it may no longer be valid.</Sub>
            <Sub>If you have no Will at all, your estate passes under intestacy laws. Those laws weren&apos;t written with your relationship in mind.</Sub>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '.9rem', flexWrap: 'wrap' }}>
              <Link href="/start" className="mkt-btn-ink-l">
                Write a new Will
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/the-will" className="mkt-btn-ghost-l">About the Will</Link>
            </div>
          </div>

          {/* Vault alert mockup */}
          <div className="mt-12 lg:mt-0" style={{ borderRadius: 12, background: '#fff', border: '1px solid var(--mkt-line)', boxShadow: '0 30px 80px rgba(15,30,28,0.10)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--mkt-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                <div style={{ width: '2.6rem', height: '2.6rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v4M8 10.5v.5" stroke="#2ab4ae" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.95rem', margin: 0 }}>Heirloom Vault</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--mkt-stone)', marginTop: '.15rem' }}>Life event detected</p>
                </div>
              </div>
              <Pill variant="amber">Action needed</Pill>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ padding: '1rem', borderRadius: 8, background: 'rgba(255,180,50,0.07)', border: '1px solid rgba(255,180,50,0.25)', marginBottom: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '.85rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>Marriage detected</p>
                <p style={{ margin: '.35rem 0 0', fontSize: '.82rem', lineHeight: 1.55, color: 'var(--mkt-stone)' }}>Marriage automatically revokes a prior Will in most Australian states. Your existing Will may no longer be valid.</p>
              </div>
              {[
                { label: 'Previous Will (pre-marriage)', status: 'May be revoked', variant: 'amber' as const },
                { label: 'Spouse named as beneficiary', status: 'Not set', variant: 'amber' as const },
                { label: 'New Will reflecting marriage', status: 'Required', variant: 'amber' as const },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.75rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', marginBottom: '.5rem', fontSize: '.82rem' }}>
                  <span style={{ color: 'var(--mkt-ink-text)' }}>{row.label}</span>
                  <Pill variant={row.variant}>{row.status}</Pill>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── What you get ── */}
      <section style={{ ...SECTION_PAD, background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <Reveal className="md:px-10" style={W}>
          <div style={{ maxWidth: '38rem', marginBottom: '3rem' }}>
            <span style={SECTION_LABEL}>What Heirloom gives you</span>
            <H2>You said &ldquo;I do.&rdquo; Now say who gets what.</H2>
          </div>
          <div className="lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2" style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: '1fr' }}>
            <div className="lg:row-span-2" style={{ borderRadius: 14, background: '#fff', padding: '2rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
              <Pill variant="quiet">The Will</Pill>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.015em', color: 'var(--mkt-ink-text)', margin: '1rem 0 .75rem' }}>Name who inherits. Name who&apos;s in charge.</h3>
              <p style={{ fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)', maxWidth: '26rem' }}>
                Your new Will names your spouse as beneficiary and executor, explicitly revokes all prior Wills, and sets out what happens to your estate. Drafted in plain English and reviewed before issue.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span>Prior Wills explicitly revoked</span><Pill>Covered</Pill>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span>Spouse named as beneficiary &amp; executor</span><Pill>Covered</Pill>
                </div>
              </div>
            </div>
            {[
              { tag: 'Solicitor review', h: 'Reviewed before issue.', p: 'Every Will is checked against a solicitor-written checklist. Complex situations — blended families, trusts — are flagged and escalated.' },
              { tag: 'Living Vault', h: 'Update it as life changes.', p: 'Children, property, business — your Will lives in your Heirloom Vault and can be updated whenever your life moves forward.' },
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
            Your Will didn&apos;t get the memo.<br />Redo it free.
          </h2>
          <p style={{ margin: '0 0 .5rem', fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
            Free to draft. $149 when you&apos;re ready to issue.
          </p>
          <p style={{ margin: '0 0 2.5rem', fontSize: '.88rem', color: 'rgba(255,255,255,0.5)' }}>About 15 minutes from start to draft.</p>
          <Link href="/start" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: '#fff', color: 'var(--teal-deep)', fontWeight: 700, fontSize: '1rem', padding: '.9rem 2rem', borderRadius: 99, textDecoration: 'none' }}>
            Start free
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

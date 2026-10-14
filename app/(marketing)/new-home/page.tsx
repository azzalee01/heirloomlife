import Link from 'next/link'
import type { Metadata } from 'next'
import Reveal from '@/components/marketing/Reveal'

export const metadata: Metadata = {
  title: 'You Bought the House. Now Protect It. | Heirloom Life',
  description: 'Own a home and no Will? The law decides who gets your share — not you. Draft your Will free in about 15 minutes.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/new-home' },
  openGraph: {
    title: 'You Bought the House. Now Protect It. | Heirloom Life',
    description: 'Own a home and no Will? The law decides who gets your share — not you.',
    url: 'https://www.heirloomlife.com.au/new-home',
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

export default function NewHomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section style={{ position: 'relative', background: 'var(--mkt-surface)', color: 'var(--mkt-ink-text)', overflow: 'hidden' }}>
        <div style={{ ...W, paddingTop: '10rem', paddingBottom: '8rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ ...SECTION_LABEL, marginBottom: '1.5rem' }}>New home</span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.2rem, 7vw, 6.4rem)',
            lineHeight: 0.95,
            letterSpacing: '-.025em',
            color: 'var(--mkt-ink-text)',
            margin: 0,
          }}>
            You bought the house.<br />
            Who gets it{' '}
            <em style={{
              fontStyle: 'italic',
              color: 'var(--mkt-ink-text)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--teal)',
              textDecorationThickness: '2px',
              textUnderlineOffset: '8px',
            }}>if something<br />happens to you?</em>
          </h1>
          <p style={{ marginTop: '2.25rem', maxWidth: '28rem', marginInline: 'auto', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
            Own a home and no Will? The law decides — not you.
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
            <H2>Without a Will, the law writes one for you.</H2>
            <Sub>When you own property, what happens to your share if you die is determined by intestacy law — a formula your state government wrote. It may not match what you&apos;d want, and your partner may not automatically inherit.</Sub>
            <Sub>A Will takes about 15 minutes to draft. The cost of not having one falls on the people you leave behind.</Sub>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '.9rem', flexWrap: 'wrap' }}>
              <Link href="/start" className="mkt-btn-ink-l">
                Start your Will
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/the-will" className="mkt-btn-ghost-l">About the Will</Link>
            </div>
          </div>

          {/* Property Will mockup */}
          <div className="mt-12 lg:mt-0" style={{ borderRadius: 12, background: '#fff', border: '1px solid var(--mkt-line)', boxShadow: '0 30px 80px rgba(15,30,28,0.10)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--mkt-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                <div style={{ width: '2.6rem', height: '2.6rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 2h8l4 4v8H2V2Z" stroke="#2ab4ae" strokeWidth="1.2"/><path d="M10 2v4h4" stroke="#2ab4ae" strokeWidth="1.2"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.95rem', margin: 0 }}>Last Will &amp; Testament</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--mkt-stone)', marginTop: '.15rem' }}>Version 1 · Draft</p>
                </div>
              </div>
              <Pill variant="quiet">Draft</Pill>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--mkt-stone)', margin: '0 0 .75rem' }}>Asset register</p>
              {[
                { label: '14 Harbour View Tce, Manly NSW 2095', tag: 'Real property', status: 'Unprotected' },
                { label: 'CommBank offset account', tag: 'Cash', status: 'Synced' },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', marginBottom: '.6rem', fontSize: '.82rem' }}>
                  <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: 6, border: '1px solid var(--mkt-line)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden><rect x="2" y="7" width="12" height="8" rx="1" stroke="var(--teal-deep)" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="var(--teal-deep)" strokeWidth="1.3"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{a.label}</p>
                    <p style={{ margin: 0, color: 'var(--mkt-stone)', fontSize: '.75rem' }}>{a.tag}</p>
                  </div>
                  <Pill variant={a.status === 'Unprotected' ? 'amber' : 'teal'}>{a.status}</Pill>
                </div>
              ))}
              <div style={{ marginTop: '1.25rem', padding: '.85rem 1rem', borderRadius: 8, background: 'rgba(42,180,174,0.05)', border: '1px solid rgba(42,180,174,0.18)', fontSize: '.82rem', color: 'var(--mkt-stone)' }}>
                <strong style={{ color: 'var(--mkt-ink-text)' }}>Real Property Gift</strong> — Name who inherits your share of the property and how any mortgage is handled at the time of your death.
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
            <H2>A Will that works as hard as you did to get here.</H2>
          </div>
          <div className="lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2" style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: '1fr' }}>
            <div className="lg:row-span-2" style={{ borderRadius: 14, background: '#fff', padding: '2rem', border: '1px solid var(--mkt-line)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)', pointerEvents: 'none' }}/>
              <Pill variant="quiet">The Will</Pill>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.015em', color: 'var(--mkt-ink-text)', margin: '1rem 0 .75rem' }}>Name who gets your property.</h3>
              <p style={{ fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)', maxWidth: '26rem' }}>
                Your Will names who inherits your home and other assets, who carries out your wishes, and how any outstanding mortgage is handled. Drafted in plain English and reviewed against a solicitor-written checklist before issue.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span>Real property named in your Will</span><Pill>Covered</Pill>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.85rem 1rem', borderRadius: 8, background: 'var(--mkt-surface-2)', border: '1px solid var(--mkt-line)', fontSize: '.82rem' }}>
                  <span>Executor named to carry out your wishes</span><Pill>Covered</Pill>
                </div>
              </div>
            </div>
            {[
              { tag: 'Solicitor review', h: 'Reviewed before issue.', p: 'Every Will is checked against a solicitor-written checklist. Complex situations are flagged and escalated before anything is issued.' },
              { tag: 'Living Vault', h: 'Update it as life changes.', p: 'New property, new relationship, new child — your Will lives in your Heirloom Vault and can be updated whenever you need to.' },
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
            Decide it yourself,<br />in writing.
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

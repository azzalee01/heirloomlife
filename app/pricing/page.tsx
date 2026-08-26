import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import PricingVaultCTA from './_components/PricingVaultCTA'

const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }
const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '.15rem', color: 'var(--teal-deep)' }} aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function PricingPage() {
  return (
    <>
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720 }}>
          <span style={SECTION_LABEL}>Pricing</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Start for free.{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>Stay current</em>{' '}
            with the Vault.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
            A legally-structured Will at no cost, with a membership option to keep it current as your life changes.
          </p>
        </div>
      </section>

      {/* ── The Will ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '4rem 5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2 lg:gap-16" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={SECTION_LABEL}>The Will</span>
            <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3.5rem, 6vw, 5rem)', color: 'var(--mkt-ink-text)', lineHeight: 1, margin: '0 0 .5rem' }}>
              $0
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--mkt-stone)', marginBottom: '1.5rem' }}>Free, always.</p>

            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--mkt-stone)', marginBottom: '2rem', maxWidth: '28rem' }}>
              Answer a short questionnaire  -  or upload your existing will and tell us what&apos;s changed  -  and get a legally-structured Will, ready to print and sign.
            </p>

            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <Link href="/start" className="mkt-btn-ink-m">
                Start your Will
              </Link>
              <Link href="/will/new?mode=upload" className="mkt-btn-ink-m">
                Upload your existing Will
              </Link>
            </div>

            <p style={{ marginTop: '1.1rem', fontSize: '.78rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.5 }}>
              Available across all Australian states and territories.
            </p>
          </div>

          <div style={{ borderRadius: 14, border: '1px solid var(--mkt-line)', background: '#fff', padding: '2rem' }}>
            <p style={{ fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--mkt-stone)', margin: '0 0 1.25rem' }}>
              What&apos;s included
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Seven-step guided questionnaire',
                'State-specific legal compliance for all Australian states and territories',
                'Ingest-and-redraft from your existing Will',
                'Downloadable, print-and-sign Will document',
                'Witnessing guidance and remote witness scheduling',
              ].map((f) => (
                <li key={f} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.9rem', color: 'var(--mkt-stone)' }}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Living Vault ─────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '4rem 5rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2 lg:gap-16" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={SECTION_LABEL}>Living Vault</span>
            <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3.5rem, 6vw, 5rem)', color: 'var(--mkt-ink-text)', lineHeight: 1, margin: '0 0 .25rem' }}>
              $8
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--mkt-stone)', marginBottom: '1.5rem' }}>per month. Cancel anytime.</p>

            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--mkt-stone)', marginBottom: '2rem', maxWidth: '28rem' }}>
              Keep your Will current as your life changes. Unlimited amendments, immediate redrafted documents, and access to Heirloom&apos;s witness pool if you&apos;re in NSW.
            </p>

            <PricingVaultCTA />

            <p style={{ marginTop: '1rem', fontSize: '.78rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.5 }}>
              Your first Will is always free. Membership unlocks repeat amendments.
            </p>
          </div>

          <div style={{ borderRadius: 14, border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)', padding: '2rem' }}>
            <p style={{ fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--mkt-stone)', margin: '0 0 1.25rem' }}>
              What&apos;s included
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Unlimited will reviews and quick amendments  -  chat-based update, immediate redrafted document',
                'Unlimited quick add/remove of beneficiaries, gifts, and executors',
                'NSW members only: access to Heirloom\'s team AV witness pool for remote execution',
                'Solicitor review add-on available (~$150) with direct access to partner lawyers through the platform',
              ].map((f) => (
                <li key={f} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.9rem', color: 'var(--mkt-stone)' }}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Complex situation ─────────────────────────────────────────────────── */}
      <section
        id="complex-situation"
        style={{ paddingBlock: '4rem 5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}
      >
        <div className="md:px-10" style={{ ...W, maxWidth: 800 }}>
          <span style={SECTION_LABEL}>Complex situation?</span>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.25rem',
          }}>
            Complete your Will  -  we&apos;ll flag what needs a closer look.
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', maxWidth: '36rem', marginBottom: '2rem' }}>
            If your estate involves overseas assets, a business, a blended family, or a beneficiary with special needs, complete the questionnaire and your Vault will flag the specific areas of concern. From there you can request a solicitor review for around $150 and communicate directly with our partner lawyers  -  without starting over.
          </p>
          <a href="/start" className="mkt-btn-ghost-m">Start your Will</a>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 2.5rem' }}>
            Common questions
          </h2>
          {[
            {
              q: 'Is the Will really free?',
              a: 'Yes. The questionnaire, the Will document, and the download are free. There are no hidden charges, no per-clause upsells, and no GST on free.',
            },
            {
              q: 'Which states are supported?',
              a: 'All Australian states and territories. Your Will is drafted to the specific legal requirements of your state. NSW members have access to remote AV witnessing  -  all other states complete with a print-and-sign process, which we walk you through.',
            },
            {
              q: 'Can I upload my existing Will?',
              a: 'Yes. The upload flow reads your existing Will, extracts what it can, and presents it for you to confirm and update. The output is always a fresh Heirloom-template document  -  we never edit an uploaded file directly.',
            },
            {
              q: 'What is the Living Vault?',
              a: 'An $8/month membership that keeps your Will current as your life changes. It unlocks unlimited chat-based amendments with an immediate redrafted document, unlimited add/remove of beneficiaries and executors, and access to Heirloom\'s AV witness pool for NSW members. Cancel anytime.',
            },
            {
              q: 'What if my situation is complex?',
              a: 'Complete the questionnaire and your Vault will flag the specific areas of concern. You can then request a solicitor review add-on for around $150 and communicate directly with our partner lawyers through the platform. For estates too complex for a template Will entirely, we can refer you to a solicitor for a bespoke engagement.',
            },
          ].map((item) => (
            <details
              key={item.q}
              style={{ borderTop: '1px solid var(--mkt-line)', paddingBlock: '1.25rem' }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '.95rem', color: 'var(--mkt-ink-text)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                {item.q}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--mkt-stone)' }} aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </summary>
              <p style={{ marginTop: '.75rem', fontSize: '.92rem', lineHeight: 1.65, color: 'var(--mkt-stone)', paddingRight: '2rem' }}>{item.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--mkt-line)', paddingTop: '1.25rem' }}/>
        </div>
      </section>

      {/* ── Disclaimer ───────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '3rem', background: 'var(--mkt-surface)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720 }}>
          <p style={{ fontSize: '.78rem', lineHeight: 1.7, color: 'var(--mkt-stone-soft)' }}>
            Heirloom Life provides a platform for you to prepare your own Will. We are not a law firm and this is not legal advice. Our platform is built using established estate planning drafting standards, but we do not review your individual Will or take responsibility for its legal validity or its suitability for your personal circumstances. If your situation involves factors like overseas assets, business ownership, or a blended family, we strongly recommend a bespoke Will prepared by a solicitor.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}

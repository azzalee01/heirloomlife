import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import PricingVaultCTA from './_components/PricingVaultCTA'
import { PRICING } from '@/src/lib/pricing'

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
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Pay once, or keep your estate plan{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>ready for life</em>.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
            Free to start. Draft your whole Will at your own pace, then pay ${PRICING.willAud} to download and sign it. Add unlimited updates for ${PRICING.updatesAudPerYear}/year if you want to keep it current as life changes.
          </p>
        </div>
      </section>

      {/* ── Pricing tiers ────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '4rem 5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <div className="md:grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', alignItems: 'start' }}>

            {/* ── The Will ── */}
            <div style={{ borderRadius: 16, border: '1px solid var(--mkt-line)', background: '#fff', padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
              <span style={SECTION_LABEL}>The Will</span>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: 'var(--mkt-ink-text)', lineHeight: 1, margin: '0 0 .25rem' }}>
                $0
              </p>
              <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', marginBottom: '.3rem' }}>Free to draft. No account required to start.</p>
              <p style={{ fontSize: '.85rem', color: 'var(--teal-deep)', fontWeight: 600, marginBottom: '.3rem' }}>Pay $129 to download  - solicitor review included.</p>
              <p style={{ fontSize: '.8rem', color: 'var(--mkt-stone-soft)', marginBottom: '1.5rem' }}>Partner discount: $89 when your partner shares their link with you.</p>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                {[
                  'Guided questionnaire',
                  'State-specific legal compliance for all Australian states and territories',
                  'Standard solicitor quality review before your Will is issued',
                  'Your Will, permanently downloadable',
                  'One remote signing session included (NSW)',
                  'Witnessing guidance (remote AV witnessing in NSW — print-and-sign in all other states)',
                ].map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.875rem', color: 'var(--mkt-stone)' }}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <Link href="/start?path=retail" className="mkt-btn-ink-m">
                  Plan my Will for free
                </Link>
                <Link href="/will/new?mode=upload" className="mkt-btn-ink-m">
                  Upload existing Will
                </Link>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '.78rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.5 }}>
                No payment required to begin. Available in all Australian states and territories.
              </p>
            </div>

            {/* ── Unlimited updates ── */}
            <div id="unlimited-updates" style={{ borderRadius: 16, border: '2px solid var(--teal-deep)', background: '#fff', padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
              <span style={SECTION_LABEL}>Unlimited updates</span>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: 'var(--mkt-ink-text)', lineHeight: 1, margin: '0 0 .25rem' }}>
                ${PRICING.updatesAudPerYear}
              </p>
              <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', marginBottom: '.3rem' }}>per year, optional.</p>
              <p style={{ fontSize: '.8rem', color: 'var(--mkt-stone-soft)', marginBottom: '1.5rem' }}>Partner discount applies to the Will only, not to unlimited updates.</p>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                {[
                  'Change your Will as often as life changes',
                  'Add or remove beneficiaries, gifts and executors',
                  'Download every new version',
                  'Cancel any time',
                ].map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.875rem', color: 'var(--mkt-stone)' }}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <p style={{ fontSize: '.82rem', color: 'var(--mkt-stone-soft)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                Video re-witnessing of updated Wills: coming soon.
              </p>

              <div style={{ marginTop: 'auto' }}>
                <PricingVaultCTA />
              </div>
              <p style={{ marginTop: '1rem', fontSize: '.78rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.5 }}>
                Renews annually until cancelled. You keep your completed Will and all versions if you cancel.
              </p>
            </div>

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
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.25rem',
          }}>
            Complete your Will  -  we&apos;ll flag what needs a closer look.
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', maxWidth: '36rem', marginBottom: '2rem' }}>
            If your estate involves overseas assets, a business, a blended family, or a beneficiary with special needs, complete the questionnaire and your Vault will flag the specific areas of concern. From there you can communicate directly with our partner lawyers through your Vault  -  without starting over.
          </p>
          <a href="/start?path=retail" className="mkt-btn-ghost-m">Start your Will</a>
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
              q: 'Is it really free to start?',
              a: 'Yes. You can draft your complete Will  - every step, every clause  - without paying anything. You pay $129 when you\'re ready to download your solicitor-reviewed, signed-ready document. Unlimited updates ($25/year, optional) only matters if you want to change your Will later.',
            },
            {
              q: 'Which states are supported?',
              a: 'All Australian states and territories. Your Will is drafted to the specific legal requirements of your state. NSW members have access to remote AV witnessing  -  all other states complete with a straightforward print-and-sign process we walk you through.',
            },
            {
              q: 'Can I upload my existing Will?',
              a: 'Yes. The upload flow reads your existing Will, extracts what it can, and presents it for you to confirm and update. The output is always a fresh Heirloom-template document  -  we never edit an uploaded file directly.',
            },
            {
              q: 'What is the Living Vault?',
              a: 'Living Vault is where your Will, assets and people live, from the day you buy your Will. Unlimited updates ($25/year, optional) keeps your Will current as life changes.',
            },
            {
              q: 'What if my situation is complex?',
              a: 'Complete the questionnaire and your Vault will flag the specific areas of concern. Your Will also receives a standard solicitor quality review before being issued. For situations that need a more detailed bespoke engagement, you can communicate directly with our partner lawyers through your Vault. For estates too complex for a template Will entirely, we can refer you to a solicitor for a bespoke engagement.',
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
            Heirloom Life provides a platform for you to prepare your own Will. We are not a law firm and this is not legal advice. All Wills receive a standard solicitor quality review before being issued — this review checks for document compliance and drafting standards, not the suitability of your instructions for your individual circumstances. If your situation involves factors like overseas assets, business ownership, or a blended family, we strongly recommend a bespoke Will prepared by a solicitor.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}

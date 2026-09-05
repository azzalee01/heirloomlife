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
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Pay once, or keep your estate plan{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>ready for life</em>.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
            Choose a $129 one-off Will with three months of full Living Vault benefits, or join for $99 a year with your Will and continuing membership included.
          </p>
        </div>
      </section>

      {/* ── The Will ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '4rem 5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2 lg:gap-16" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={SECTION_LABEL}>The Will</span>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(3.5rem, 6vw, 5rem)', color: 'var(--mkt-ink-text)', lineHeight: 1, margin: '0 0 .5rem' }}>
              $129
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--mkt-stone)', marginBottom: '1.5rem' }}>One-time payment. Three months of full platform benefits included.</p>

            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--mkt-stone)', marginBottom: '2rem', maxWidth: '28rem' }}>
              Create and keep your signing-ready Will, with three months to organise your Vault, make supported updates and use included member benefits.
            </p>

            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <Link href="/start?path=retail" className="mkt-btn-ink-m">
                Plan my Will for free
              </Link>
              <Link href="/will/new?mode=upload" className="mkt-btn-ink-m">
                Upload your existing Will
              </Link>
            </div>

            <p style={{ marginTop: '1.1rem', fontSize: '.78rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.5 }}>
              No charitable gift is required for the standard Will. Available across all Australian states and territories.
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
                'Standard solicitor quality review before your Will is issued',
                'Your Will, permanently downloadable',
                '3 months Living Vault membership included',
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

      <section style={{ paddingBlock: '4rem 5rem', background: 'var(--mkt-surface-2)', color: 'var(--mkt-ink-text)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2 lg:gap-16" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{ ...SECTION_LABEL, color: 'var(--teal)' }}>Charity-sponsored Will</span>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(3.5rem, 6vw, 5rem)', lineHeight: 1, margin: '0 0 .5rem' }}>$0</p>
            <p style={{ marginBottom: '1.5rem', color: 'var(--mkt-stone)' }}>Available when your Will includes an eligible charitable gift.</p>
            <p style={{ maxWidth: '30rem', fontSize: '1rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>Choose the charity and share that reflect your intentions. If you decide not to include a charitable gift, every answer is preserved and you can continue with the standard $129 Will.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <Link href="/start?path=sponsored" className="mkt-btn-ink-m">Create a sponsored Will</Link>
              <Link href="/charity-wills" style={{ alignSelf: 'center', fontSize: '.82rem', fontWeight: 600, color: 'var(--teal-deep)' }}>Read how sponsorship works →</Link>
            </div>
          </div>
          <div style={{ borderRadius: 14, border: '1px solid var(--mkt-line)', background: '#fff', padding: '2rem' }}>
            <p style={{ margin: '0 0 1.25rem', fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--teal-deep)' }}>The transparent choice</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {['A positive share to an eligible registered charity is required', 'A valid-format ABN and any campaign eligibility conditions are required', 'You control which charity and what share to include', 'No charity gift is required for the paid standard Will', 'Changing paths never deletes your estate-plan answers'].map((item) => <li key={item} style={{ display: 'flex', gap: '.6rem', fontSize: '.9rem', color: 'var(--mkt-stone)' }}><Check />{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Living Vault ─────────────────────────────────────────────────────── */}
      <section id="living-vault" style={{ paddingBlock: '4rem 5rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2 lg:gap-16" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={SECTION_LABEL}>Living Vault</span>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(3.5rem, 6vw, 5rem)', color: 'var(--mkt-ink-text)', lineHeight: 1, margin: '0 0 .25rem' }}>
              $99
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--mkt-stone)', marginBottom: '1.5rem' }}>per year. Your Will is included.</p>

            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--mkt-stone)', marginBottom: '2rem', maxWidth: '28rem' }}>
              One annual membership for the Will and what comes after it. Report life changes, maintain your estate record, make supported amendments and access Heirloom&apos;s witness pool if you&apos;re in NSW.
            </p>

            <PricingVaultCTA />

            <p style={{ marginTop: '1rem', fontSize: '.78rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.5 }}>
              Renews annually until cancelled. You can download and retain your completed Will if you later leave.
            </p>
          </div>

          <div style={{ borderRadius: 14, border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)', padding: '2rem' }}>
            <p style={{ fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--mkt-stone)', margin: '0 0 1.25rem' }}>
              What&apos;s included
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Guided life-change check-ins through your Vault',
                'Your signing-ready Will included in the first year',
                'Supported amendments and updated Will documents',
                'A maintained register of assets, beneficiaries, gifts, and executors',
                'Will status and estate-review guidance',
                'NSW members only: access to Heirloom\'s team AV witness pool for remote execution',
                'Direct access to partner lawyers through the platform for complex or bespoke situations',
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
              q: 'Can I create a Will for $0?',
              a: 'The standard Will is $129 once and includes three months of full Living Vault benefits. Annual membership is $99 and includes your Will. A charity-sponsored Will is $0 when you include an eligible charitable gift, provide a valid-format ABN and meet any applicable campaign conditions.',
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
              a: 'Living Vault is included in the $99 annual Heirloom Membership. It keeps your Will and estate information organised, supports updates as life changes and gives NSW members access to Heirloom\'s AV witness pool. The $129 one-off Will includes the same platform benefits for three months.',
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
            Heirloom Life provides a platform for you to prepare your own Will. We are not a law firm and this is not legal advice. Our platform is built using established estate planning drafting standards, but we do not review your individual Will or take responsibility for its legal validity or its suitability for your personal circumstances. If your situation involves factors like overseas assets, business ownership, or a blended family, we strongly recommend a bespoke Will prepared by a solicitor.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}

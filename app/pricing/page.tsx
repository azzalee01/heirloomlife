import Link from 'next/link'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

// ─── Types ────────────────────────────────────────────────────────────────────
type Plan = {
  slug: string
  name: string
  tagline: string
  price_label: string
  billing_type: string
  description: string
  features: string[]
  highlight: boolean
  sort_order: number
  is_placeholder: boolean
}

// ─── Static fallback (all marked placeholder until pricing is confirmed) ───────
const STATIC_PLANS: Plan[] = [
  {
    slug: 'will-single',
    name: 'The Will — Single',
    tagline: 'One-off, solicitor reviewed',
    price_label: 'TBC',
    billing_type: 'one_time',
    description: 'A legally valid Will drafted with guidance, reviewed by a solicitor, and ready to sign.',
    features: [
      'Seven-step guided drafting',
      'State-specific legal compliance',
      'Solicitor review included',
      'Printed Will, cloth-bound folder',
    ],
    highlight: false,
    sort_order: 1,
    is_placeholder: true,
  },
  {
    slug: 'will-couple',
    name: 'The Will — Couple',
    tagline: 'One-off, both partners',
    price_label: 'TBC',
    billing_type: 'one_time',
    description: 'Two mirrored Wills for partners, cross-referenced and sharing one asset register.',
    features: [
      'Two mirrored Wills, cross-referenced',
      'Shared asset register',
      'Both solicitor reviews included',
      'Two folders, one Vault',
    ],
    highlight: false,
    sort_order: 2,
    is_placeholder: true,
  },
  {
    slug: 'vault',
    name: 'Living Vault',
    tagline: 'Ongoing membership',
    price_label: 'TBC',
    billing_type: 'annual',
    description: 'Life-event tracking, annual solicitor review, and executor access — keeping your estate current as your life changes.',
    features: [
      'Life-event tracking and alerts',
      'Included annual solicitor review',
      'Executor access instructions',
      'Will version history',
      'Cancel anytime',
    ],
    highlight: true,
    sort_order: 3,
    is_placeholder: true,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PricingPage() {
  // Fetch from DB; fall back to static if table doesn't exist or has no rows
  let plans: Plan[] = STATIC_PLANS
  try {
    const { data } = await supabaseAdmin
      .from('pricing_plans')
      .select('slug, name, tagline, price_label, billing_type, description, features, highlight, sort_order, is_placeholder')
      .eq('active', true)
      .order('sort_order')
    if (data && data.length > 0) {
      plans = data as Plan[]
    }
  } catch {
    // table not yet migrated — use static fallback
  }

  const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }
  const SECTION_LABEL: React.CSSProperties = {
    fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
    fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
  }

  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720 }}>
          <span style={SECTION_LABEL}>Membership</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Priced like something worth{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>getting right</em>.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
            A one-off Will to get your estate in order, and a Vault membership to keep it that way. No per-clause upsells, no surprise renewals. All prices include GST.
          </p>
          {plans.some(p => p.is_placeholder) && (
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 4, border: '1px solid var(--mkt-line)', background: '#fff', fontSize: '.85rem', color: 'var(--mkt-stone)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--mkt-ink-text)' }}>Pricing is being finalised.</strong>{' '}
              The figures shown below are indicative. We&#8217;ll publish confirmed prices, inclusive of GST, before launch.
            </div>
          )}
        </div>
      </section>

      {/* Plan cards */}
      <section style={{ paddingBlock: '4rem 6rem', background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10" style={W}>
          <div
            className="md:grid-cols-3"
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}
          >
            {plans.map(plan => (
              <div
                key={plan.slug}
                style={{
                  borderRadius: 14, border: `1px solid ${plan.highlight ? 'var(--teal)' : 'var(--mkt-line)'}`,
                  background: '#fff', padding: '2.2rem',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: plan.highlight ? '0 20px 50px rgba(0,0,0,.08)' : 'none',
                }}
              >
                {plan.is_placeholder && (
                  <span style={{
                    alignSelf: 'flex-start', marginBottom: '1rem',
                    fontSize: '.65rem', fontWeight: 600,
                    padding: '.28rem .65rem', borderRadius: 99,
                    border: '1px solid var(--mkt-line)', color: 'var(--mkt-stone)',
                  }}>
                    Indicative pricing
                  </span>
                )}
                {plan.highlight && !plan.is_placeholder && (
                  <span style={{
                    alignSelf: 'flex-start', marginBottom: '1rem',
                    fontSize: '.65rem', fontWeight: 600,
                    padding: '.28rem .65rem', borderRadius: 99,
                    border: '1px solid var(--teal)', color: 'var(--mkt-ink-text)',
                  }}>
                    Recommended
                  </span>
                )}

                <p style={{ fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--mkt-stone)', margin: 0 }}>
                  {plan.name}
                </p>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.6rem', color: 'var(--mkt-ink-text)', marginTop: '.75rem', lineHeight: 1 }}>
                  {plan.price_label}
                </p>
                <p style={{ fontSize: '.85rem', color: 'var(--mkt-stone)', marginTop: '.3rem' }}>{plan.tagline}</p>

                <ul style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.65rem', fontSize: '.9rem', color: 'var(--mkt-stone)', listStyle: 'none', padding: 0, flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '.15rem', color: 'var(--teal-deep)' }} aria-hidden="true">
                        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/will/new"
                  className={plan.highlight ? 'mkt-btn-ink-m' : 'mkt-btn-ghost-m'}
                  style={{ marginTop: '2rem' }}
                >
                  {plan.billing_type === 'annual' ? 'Join the Vault' : 'Start your Will'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 2.5rem' }}>
            Common questions about pricing
          </h2>
          {[
            {
              q: 'Is the Will one-off, or do I pay to update it?',
              a: 'The Will document itself is a one-off purchase. If your life changes and you want ongoing updates with annual solicitor review and life-event tracking, the Living Vault membership covers that.',
            },
            {
              q: 'Are prices inclusive of GST?',
              a: 'Yes. All prices shown will be GST-inclusive. The final confirmed price will be the figure you pay — no GST surprises at checkout.',
            },
            {
              q: 'Can I cancel the Vault membership?',
              a: 'Yes, at any time. You retain access until the end of your current billing period, and your Will document remains yours.',
            },
            {
              q: 'What if I started a Will and decide I want the Vault?',
              a: 'You can upgrade at any time. Contact us and we\'ll make sure you\'re not paying twice for overlapping periods.',
            },
          ].map(item => (
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

      <MarketingFooter />
    </>
  )
}

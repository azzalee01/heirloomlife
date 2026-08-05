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
}

// ─── Fallback static plans (used when the table doesn't exist yet) ────────────
const STATIC_PLANS: Plan[] = [
  {
    slug: 'will',
    name: 'Will Document',
    tagline: 'One-off purchase',
    price_label: '$199',
    billing_type: 'one_time',
    description: 'A legally valid will drafted by AI, reviewed by a qualified solicitor, and ready to sign.',
    features: [
      'AI-guided will builder',
      'Solicitor review included',
      'Downloadable & printable PDF',
      'Valid in all Australian states',
      'Covers assets, beneficiaries & executors',
    ],
    highlight: false,
    sort_order: 1,
  },
  {
    slug: 'vault',
    name: 'Living Vault',
    tagline: 'Annual subscription',
    price_label: '$299/year',
    billing_type: 'annual',
    description: 'Everything in Will Document, plus a secure digital vault to keep your estate plan current as life changes.',
    features: [
      'Everything in Will Document',
      'Secure document vault',
      'Unlimited will updates',
      'Remote witnessing sessions',
      'Priority solicitor support',
    ],
    highlight: true,
    sort_order: 2,
  },
]

const FAQ = [
  {
    q: 'Is my will legally valid in Australia?',
    a: 'Yes. Every will created through Heirloom Life is reviewed by a qualified Australian solicitor and drafted to meet the legal requirements of all Australian states and territories.',
  },
  {
    q: 'What happens if I need to update my will?',
    a: 'Will Document purchasers can update at any time for a small admin fee. Living Vault subscribers get unlimited updates included — as often as life changes.',
  },
  {
    q: 'How does remote witnessing work?',
    a: 'Once your will is ready, you schedule a video call with two independent witnesses arranged by Heirloom Life. You sign the document on-screen, witnesses countersign, and it\'s done — no office required.',
  },
  {
    q: 'What does the Living Vault store?',
    a: 'The Vault holds your will, any codicils, power of attorney documents, insurance policies, and any other estate documents you choose to upload — encrypted and accessible only to you.',
  },
  {
    q: 'Can I try before I buy?',
    a: 'Yes — create a free account, start your will, and see the full draft before you pay. You only pay when you\'re ready to submit for solicitor review.',
  },
]

async function getPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('slug, name, tagline, price_label, billing_type, description, features, highlight, sort_order')
      .eq('active', true)
      .order('sort_order')
    if (error || !data?.length) return STATIC_PLANS
    return data as Plan[]
  } catch {
    return STATIC_PLANS
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PricingPage() {
  const plans = await getPlans()

  return (
    <div style={{ background: 'var(--paper)' }}>
      <MarketingNav />

      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <p
          className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
          style={{ color: 'var(--teal)' }}
        >
          Pricing
        </p>
        <h1
          className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight mb-4"
          style={{
            color: 'var(--ink)',
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic',
          }}
        >
          Simple, honest pricing.
        </h1>
        <p className="text-base max-w-md" style={{ color: 'var(--neutral)' }}>
          One plan to get your will done. Another to keep your estate plan alive. No hidden fees.
        </p>
      </section>

      {/* ── Plan cards ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24 sm:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px max-w-3xl" style={{ background: 'var(--line)' }}>
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className="flex flex-col"
              style={{
                background: plan.highlight ? 'var(--ink)' : 'var(--paper)',
              }}
            >
              {/* Plan header */}
              <div
                className="px-8 py-7 border-b"
                style={{ borderColor: plan.highlight ? 'rgba(255,255,255,0.1)' : 'var(--line)' }}
              >
                {plan.highlight && (
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.18em] mb-3"
                    style={{ color: 'var(--teal)' }}
                  >
                    Most popular
                  </p>
                )}
                <p
                  className="text-xs font-semibold uppercase tracking-[0.18em] mb-1"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.45)' : 'var(--neutral)' }}
                >
                  {plan.tagline}
                </p>
                <h2
                  className="text-[1.35rem] font-semibold mb-1"
                  style={{
                    color: plan.highlight ? 'white' : 'var(--ink)',
                    fontFamily: "'Instrument Serif', Georgia, serif",
                  }}
                >
                  {plan.name}
                </h2>
                <p
                  className="text-3xl font-bold mt-3 mb-1"
                  style={{ color: plan.highlight ? 'white' : 'var(--ink)' }}
                >
                  {plan.price_label}
                </p>
                {plan.billing_type === 'annual' && (
                  <p className="text-xs" style={{ color: plan.highlight ? 'rgba(255,255,255,0.45)' : 'var(--neutral)' }}>
                    billed annually
                  </p>
                )}
                {plan.billing_type === 'one_time' && (
                  <p className="text-xs" style={{ color: plan.highlight ? 'rgba(255,255,255,0.45)' : 'var(--neutral)' }}>
                    one-time payment
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="px-8 py-7 flex-1">
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--neutral)' }}
                >
                  {plan.description}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <svg
                        className="shrink-0 mt-0.5"
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="var(--teal)" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : 'var(--ink)' }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div
                className="px-8 pb-8"
              >
                <Link
                  href="/auth/signup"
                  className="btn btn-lg w-full justify-center"
                  style={
                    plan.highlight
                      ? { background: 'var(--teal)', color: 'white', borderColor: 'var(--teal)' }
                      : { background: 'var(--paper-warm)', color: 'var(--ink)', borderColor: 'var(--line)' }
                  }
                >
                  {plan.billing_type === 'one_time' ? 'Get your Will' : 'Start Living Vault'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs" style={{ color: 'var(--neutral)' }}>
          Not sure? Create a free account — you only pay when you submit for solicitor review.
        </p>
      </section>

      {/* ── Guarantee strip ───────────────────────────────────────────────── */}
      <section style={{ background: 'var(--paper-warm)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Solicitor review on every will', detail: 'Human expert eyes before it\'s finalised.' },
              { icon: 'M3 10h18M3 14h18M5 6l7-3 7 3M4 10v10M20 10v10', label: 'No lock-in on Will Document', detail: 'Pay once, own your will permanently.' },
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Private & encrypted', detail: 'Your documents are yours alone.' },
            ].map((g) => (
              <div key={g.label} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 border flex items-center justify-center shrink-0"
                  style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={g.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{g.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>{g.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ color: 'var(--teal)' }}
          >
            FAQ
          </p>
          <h2
            className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight mb-12"
            style={{
              color: 'var(--ink)',
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: 'italic',
            }}
          >
            Common questions.
          </h2>

          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {FAQ.map((item) => (
              <div key={item.q} className="py-6">
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>
                  {item.q}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--ink)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24 text-center">
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold leading-tight text-white mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
          >
            Ready to write your will?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Start free. Pay when you submit for review.
          </p>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Get started
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

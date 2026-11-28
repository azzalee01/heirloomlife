import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security & Trust | Heirloom Life',
  description: 'What security measures are actually in place at Heirloom Life today — written accurately, not to match a competitor\'s marketing page.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/security-trust' },
  openGraph: {
    title: 'Security & Trust | Heirloom Life',
    description: 'What security measures are actually in place at Heirloom Life today — written accurately, not to match a competitor\'s marketing page.',
    url: 'https://www.heirloomlife.com.au/security-trust',
    siteName: 'Heirloom Life',
    type: 'website',
    images: [{ url: '/images/editorial/learn.jpg' }],
  },
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}


const ITEMS = [
  {
    title: 'Data encryption',
    body: 'Your data is stored on encrypted, access-controlled cloud infrastructure. Data is encrypted at rest and all connections are enforced over TLS. We do not store Will content in plaintext outside the secured database.',
  },
  {
    title: 'Authentication',
    body: 'Signing in is passwordless. You use a one-time magic link or a six-digit code sent to your email — there is no password to create, reuse, or have stolen. Session tokens are short-lived and signed, and the sign-in links are built so that corporate email scanners cannot consume them before you do.',
  },
  {
    title: 'Data residency',
    body: 'Your account data and Will documents are stored in Australia (the AWS Sydney region, via Supabase), and the application servers run in Sydney. A few sub-processors that support the service process limited data in the US or EU (listed below) — so we say your data is stored in Australia, not that it never leaves Australia.',
  },
  {
    title: 'Sub-processors',
    body: 'We rely on a small number of trusted providers: Supabase (database and authentication, Australia), Vercel (application hosting, Sydney), Stripe (payments, US — we never see your full card details), Daily (video for guided witnessing, US), Resend (transactional email, US), Anthropic (the estate assistant, US) and PostHog (product analytics, EU). We keep this list current as it changes.',
  },
  {
    title: 'Executor access controls',
    body: 'Executor access controls are on our build roadmap. Today, your Vault is accessible only to you with your account credentials. We will publish details of the executor access model before it is released.',
  },
  {
    title: 'Checklist review',
    body: 'Every Will is reviewed against a solicitor-written checklist before being issued. The checklist was prepared by qualified Australian legal practitioners. For complex situations, an additional bespoke review via our partner lawyers can be requested through your Vault.',
  },
  {
    title: 'If something goes wrong',
    body: 'If a data breach occurs that is likely to result in serious harm, we will contain and assess it, and notify affected individuals and the Office of the Australian Information Commissioner as required under the Notifiable Data Breaches scheme (Privacy Act 1988). If you notice a security issue, email hello@heirloomlife.com.au and we will respond promptly.',
  },
  {
    title: 'What we are not claiming',
    body: 'We do not hold ISO 27001 or SOC 2 certification at this time, and we are not claiming specific penetration-testing results or uptime SLAs until these are formally verified and documented. This page is updated as those confirmations are in place — we would rather note the uncertainty than paper over it.',
  },
]

export default function SecurityTrustPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: '4rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <span style={SECTION_LABEL}>Security &amp; Trust</span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            What we can tell you,{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>accurately</em>.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
            Estate documents are among the most sensitive records you can hold. We have written this page to describe what is actually in place today  -  not to match the length of a competitor&#8217;s security marketing page.
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 4, border: '1px solid var(--mkt-line)', background: '#fff', fontSize: '.85rem', color: 'var(--mkt-stone)', lineHeight: 1.5 }}>
            This page describes what is currently in place. Items not yet fully verified are noted as such. We will update this page as confirmations are in place rather than publish claims in advance.
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                style={{
                  paddingBlock: '2rem',
                  borderBottom: i < ITEMS.length - 1 ? '1px solid var(--mkt-line)' : 'none',
                  display: 'grid', gridTemplateColumns: '1fr', gap: '.75rem',
                }}
                className="md:grid-cols-[240px_1fr]"
              >
                <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: 0, paddingTop: '.1rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ paddingBlock: '4rem', background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .75rem', letterSpacing: '-.01em' }}>
            Questions about security?
          </h2>
          <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: '0 0 1.25rem' }}>
            If you have a specific security question that isn&#8217;t answered here, contact us directly. We&#8217;d rather acknowledge a gap than paper over it.
          </p>
          <a
            href="mailto:hello@heirloomlife.com.au"
            style={{ fontSize: '.88rem', color: 'var(--teal-deep)', textDecoration: 'underline' }}
          >
            hello@heirloomlife.com.au
          </a>
        </div>
      </section>
    </>
  )
}

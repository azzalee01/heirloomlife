import Link from 'next/link'
import type { Metadata } from 'next'
import PartnerEnquiryForm from './_components/PartnerEnquiryForm'

export const metadata: Metadata = {
  title: 'For Advisers | Heirloom Life',
  description: 'Give your clients a settlement gift that helps them plan for the people they love. Heirloom Life prepaid Will codes for mortgage brokers and conveyancers.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/for-advisers' },
  openGraph: {
    title: 'For Advisers | Heirloom Life',
    description: 'Give your clients a settlement gift that helps them plan for the people they love. Heirloom Life prepaid Will codes for mortgage brokers and conveyancers.',
    url: 'https://www.heirloomlife.com.au/for-advisers',
    siteName: 'Heirloom Life',
    type: 'website',
  },
}

const W: React.CSSProperties = { maxWidth: 1100, marginInline: 'auto', paddingInline: '1.5rem' }
const LABEL: React.CSSProperties = {
  margin: 0, color: 'var(--teal-deep)', fontSize: '.72rem',
  fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
}

const HOW_IT_WORKS = [
  {
    n: '01',
    heading: 'You buy prepaid gift codes',
    body: 'Purchase a batch of Heirloom Will codes at a fixed rate. No contracts, no ongoing commitments.',
  },
  {
    n: '02',
    heading: 'Present the gift at settlement',
    body: 'Hand your client a card at settlement — a practical, thoughtful gift that helps them get their estate in order.',
  },
  {
    n: '03',
    heading: 'Your client takes it from there',
    body: 'They complete their Will directly with Heirloom, on their own time. Your practice sees none of their Will information.',
  },
]

const FAQ = [
  {
    q: 'Does my practice see my clients’ Will details?',
    a: 'No. Your client interacts directly with Heirloom. We hold all Will data under our own privacy policy. You receive no client information beyond what you already collect at settlement.',
  },
  {
    q: 'Is this a substitute for complex estate planning?',
    a: 'No. Heirloom is designed for straightforward estates. Clients with complex needs — business interests, trusts, foreign assets — are referred to a solicitor during the Will process.',
  },
  {
    q: 'Where can I read about Heirloom’s security practices?',
    a: null,
  },
]

export default function ForAdvisersPage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', paddingBlock: '8rem 5rem' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 760 }}>
          <p style={LABEL}>For mortgage brokers &amp; conveyancers</p>
          <h1 style={{
            margin: '1.25rem 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.7rem, 5.5vw, 5rem)',
            lineHeight: 1.02,
            fontWeight: 400,
            color: 'var(--mkt-ink-text)',
          }}>
            A settlement gift that helps your clients{' '}
            <em style={{ color: 'var(--teal-deep)', fontWeight: 400 }}>plan for the people they love</em>.
          </h1>
          <p style={{ margin: '1.5rem 0 0', maxWidth: '38rem', fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Settlement is the moment your clients are most focused on what they own. Give them something that helps them protect it for the people who matter — a prepaid Heirloom Will, ready when they are.
          </p>
          <div style={{ marginTop: '2.25rem' }}>
            <a href="#enquire" className="mkt-btn-ink-l">Request a pilot</a>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <p style={LABEL}>How it works</p>
          <div
            className="md:grid-cols-3"
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2.5rem' }}
          >
            {HOW_IT_WORKS.map(({ n, heading, body }) => (
              <div key={n}>
                <p style={{
                  margin: '0 0 1rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.4rem',
                  lineHeight: 1,
                  fontWeight: 400,
                  color: 'var(--teal-deep)',
                  opacity: 0.4,
                }}>
                  {n}
                </p>
                <h3 style={{ margin: '0 0 .6rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>
                  {heading}
                </h3>
                <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '2.5rem', fontSize: '.875rem', color: 'var(--mkt-stone)', lineHeight: 1.65, maxWidth: '40rem', borderLeft: '2px solid var(--mkt-line)', paddingLeft: '1rem' }}>
            Your practice sees none of your client&apos;s Will information. Heirloom holds all estate data under its own privacy policy.
          </p>
        </div>
      </section>

      {/* ── Secondary tracks ───────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <p style={LABEL}>Other ways to work together</p>
          <div
            className="md:grid-cols-2"
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '2.5rem' }}
          >
            {/* Advisers card */}
            <div style={{ padding: '2rem', border: '1px solid var(--mkt-line)', borderRadius: 8, background: '#fff' }}>
              <p style={{ margin: '0 0 .5rem', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mkt-stone)' }}>
                Financial advisers &amp; accountants
              </p>
              <h3 style={{ margin: '0 0 .75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>
                Referral programme
              </h3>
              <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
                A referral structure for advisers and accountants who want to offer estate planning as part of a holistic financial plan. Coming soon — register your interest using the form below.
              </p>
            </div>

            {/* Charities card */}
            <div style={{ padding: '2rem', border: '1px solid var(--mkt-line)', borderRadius: 8, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 .5rem', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mkt-stone)' }}>
                  Charities
                </p>
                <h3 style={{ margin: '0 0 .75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>
                  Gifts in Wills
                </h3>
                <p style={{ margin: '0 0 1.5rem', fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
                  Your cause, in front of supporters at the moment they are actively writing their Will. Register your charity to appear in the Heirloom beneficiary selection.
                </p>
              </div>
              <Link
                href="/for-charities"
                style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--teal-deep)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}
              >
                Learn about charity partnerships
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 760 }}>
          <p style={LABEL}>Questions</p>
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3 style={{ margin: '0 0 .6rem', fontSize: '1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>
                  {q}
                </h3>
                {a ? (
                  <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>{a}</p>
                ) : (
                  <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
                    See our{' '}
                    <Link href="/security-trust" style={{ color: 'var(--teal-deep)' }}>
                      Security &amp; Trust
                    </Link>{' '}
                    page for details on data handling, encryption, and our privacy commitments.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enquiry form ───────────────────────────────────────────────────── */}
      <section id="enquire" style={{ paddingBlock: '5.5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 760 }}>
          <p style={LABEL}>Pilot programme</p>
          <h2 style={{
            margin: '1.1rem 0 .75rem',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
            lineHeight: 1.1,
            fontWeight: 400,
            color: 'var(--mkt-ink-text)',
          }}>
            Request a pilot
          </h2>
          <p style={{ margin: '0 0 2.5rem', fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Tell us about your practice. We&apos;ll follow up within one business day.
          </p>
          <div style={{ background: '#fff', border: '1px solid var(--mkt-line)', borderRadius: 8, padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            <PartnerEnquiryForm />
          </div>
        </div>
      </section>
    </>
  )
}

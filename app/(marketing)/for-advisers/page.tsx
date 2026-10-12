import Link from 'next/link'
import type { Metadata } from 'next'
import PartnerEnquiryForm from './_components/PartnerEnquiryForm'

export const metadata: Metadata = {
  title: 'For Mortgage Brokers & Conveyancers | Heirloom Life',
  description: 'Settlement closes the loan. A Will closes the loop. Prepaid Heirloom Will codes for mortgage brokers and conveyancers — a thoughtful settlement gift your clients will remember.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/for-advisers' },
  openGraph: {
    title: 'For Mortgage Brokers & Conveyancers | Heirloom Life',
    description: 'Settlement closes the loan. A Will closes the loop. Prepaid Heirloom Will codes for mortgage brokers and conveyancers.',
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

const WHY_IT_WORKS = [
  {
    heading: 'The relationship outlasts the transaction.',
    body: 'Most clients don\'t remember the rate. They remember who gave them something that mattered. A Will is one of those things.',
  },
  {
    heading: 'Your practice is ring-fenced.',
    body: 'Your client\'s estate details — beneficiaries, assets, executors, instructions — are held by Heirloom under our own privacy policy. Nothing flows back to your CRM, your team, or your licence.',
  },
  {
    heading: 'No contract. No commitment.',
    body: 'Buy a batch of codes at a fixed rate. Hand them out at settlement. There\'s no subscription, no reporting obligation, and no minimum ongoing order.',
  },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    heading: 'Order a batch of Will codes',
    body: 'Purchase prepaid Heirloom Will codes at a fixed rate. No contracts, no minimum ongoing commitment.',
  },
  {
    n: '02',
    heading: 'Hand it over at settlement',
    body: 'Present the code with your settlement paperwork — a practical, personalised touch on a milestone day.',
  },
  {
    n: '03',
    heading: 'We take it from there',
    body: 'Your client completes their Will directly with Heirloom, on their own time. Your practice sees nothing.',
  },
]

const FAQ = [
  {
    q: 'Does my practice see my clients’ Will details?',
    a: 'No. Your client interacts directly with Heirloom. We hold all Will data under our own privacy policy. You receive no information about their estate — not their beneficiaries, not their assets, not their instructions. Nothing flows back to you.',
  },
  {
    q: 'Does offering this create any professional or licensing risk for my practice?',
    a: 'No. You are gifting a product code, not providing legal or financial advice. Heirloom handles the Will process entirely — you have no involvement in the drafting, no visibility of the content, and no obligations under the client relationship with Heirloom. If you have specific compliance questions, we\'re happy to provide a written summary for your compliance team.',
  },
  {
    q: 'Is this a substitute for complex estate planning?',
    a: 'No. Heirloom is designed for straightforward estates. Clients with complex needs — business interests, trusts, foreign assets — are referred to a solicitor during the Will process. You can refer confidently knowing we won\'t take a client further than we should.',
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
      <section style={{ background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', paddingBlock: '8rem 5.5rem' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 780 }}>
          <p style={LABEL}>For mortgage brokers &amp; conveyancers</p>
          <h1 style={{
            margin: '1.25rem 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)',
            lineHeight: 1.02,
            fontWeight: 400,
            color: 'var(--mkt-ink-text)',
          }}>
            Settlement closes the loan.{' '}
            <em style={{ color: 'var(--teal-deep)', fontWeight: 400 }}>A Will closes the loop.</em>
          </h1>
          <p style={{ margin: '1.75rem 0 0', maxWidth: '40rem', fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Your clients just committed to the biggest financial decision of their lives. Most of them don&apos;t have a Will that reflects it. A prepaid Heirloom Will turns your settlement handover into something they&apos;ll remember — and something that protects everything they&apos;ve just worked for.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#enquire" className="mkt-btn-ink-l">Request a pilot</a>
            <a href="#how-it-works" style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Why it works ───────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '36rem', marginBottom: '3rem' }}>
            <p style={LABEL}>Why it works</p>
            <h2 style={{
              margin: '.9rem 0 0',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
              lineHeight: 1.08,
              fontWeight: 400,
              color: 'var(--mkt-ink-text)',
            }}>
              Settlement is the moment your clients are thinking about the future.
            </h2>
          </div>
          <div
            className="md:grid-cols-3"
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}
          >
            {WHY_IT_WORKS.map(({ heading, body }) => (
              <div
                key={heading}
                style={{
                  padding: '1.75rem',
                  border: '1px solid var(--mkt-line)',
                  borderRadius: 10,
                  background: 'var(--mkt-surface)',
                }}
              >
                <h3 style={{ margin: '0 0 .75rem', fontSize: '1rem', fontWeight: 600, lineHeight: 1.35, color: 'var(--mkt-ink-text)' }}>
                  {heading}
                </h3>
                <p style={{ margin: 0, fontSize: '.88rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy callout ────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '3.5rem', background: 'var(--mkt-ink)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="md:px-10 md:flex md:items-center md:justify-between md:gap-16" style={{ ...W, maxWidth: 900 }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ ...LABEL, color: 'var(--teal)' }}>Privacy, by design</p>
            <h2 style={{
              margin: '.75rem 0 0',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              lineHeight: 1.15,
              fontWeight: 400,
              color: '#fff',
            }}>
              What your practice never sees
            </h2>
          </div>
          <ul style={{
            margin: 0, padding: 0, listStyle: 'none',
            display: 'flex', flexDirection: 'column', gap: '.6rem',
            flexShrink: 0, minWidth: '16rem',
          }}>
            {[
              'Your client\'s Will',
              'Their beneficiaries',
              'Their executor',
              'Their assets or instructions',
              'Any data from the Heirloom platform',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '.65rem', fontSize: '.88rem', color: 'rgba(255,255,255,0.65)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ paddingBlock: '5.5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)', scrollMarginTop: '5rem' }}>
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
                  opacity: 0.35,
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
        </div>
      </section>

      {/* ── Other tracks ───────────────────────────────────────────────────── */}
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
            Let&apos;s run a pilot.
          </h2>
          <p style={{ margin: '0 0 2.5rem', fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Tell us about your practice. We&apos;ll follow up within one business day — no hard sell, just a conversation about whether it&apos;s a fit.
          </p>
          <div style={{ background: '#fff', border: '1px solid var(--mkt-line)', borderRadius: 8, padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            <PartnerEnquiryForm />
          </div>
        </div>
      </section>
    </>
  )
}

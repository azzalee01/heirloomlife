import type { Metadata } from 'next'
import EmployerEnquiryForm from './_components/EmployerEnquiryForm'

export const metadata: Metadata = {
  title: 'For Employers | Heirloom Life',
  description: 'A meaningful financial wellbeing benefit for your people. Give your employees access to simple, guided Will preparation — no legal complexity, no cost to them.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/for-employers' },
  openGraph: {
    title: 'For Employers | Heirloom Life',
    description: 'A meaningful financial wellbeing benefit for your people.',
    url: 'https://www.heirloomlife.com.au/for-employers',
    siteName: 'Heirloom Life',
    type: 'website',
  },
}

const W: React.CSSProperties = { maxWidth: 1100, marginInline: 'auto', paddingInline: '1.5rem' }
const LABEL: React.CSSProperties = {
  margin: 0, color: 'var(--teal-deep)', fontSize: '.72rem',
  fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
}

const WHY_ITEMS = [
  {
    heading: 'Financial stress is a workplace problem.',
    body: 'Employees who haven\'t sorted their estate carry that anxiety with them. Not knowing what happens to their family if something goes wrong is a real, persistent concern — and one that\'s entirely solvable. Offering Heirloom removes that burden.',
  },
  {
    heading: 'A benefits package that actually stands out.',
    body: 'Health cover, EAP, and super are expected. A Will benefit is still uncommon enough to be memorable. It signals that your organisation thinks about employees\' lives beyond the office — and beyond their tenure.',
  },
  {
    heading: 'The right support at the right moment.',
    body: 'A new child, a home purchase, a marriage — these are the moments when employees are most likely to think about their estate. Being there at those milestones with a practical, meaningful benefit is how you build long-term loyalty.',
  },
  {
    heading: 'No complexity for HR.',
    body: 'Heirloom operates entirely independently of your organisation. You enrol. We do the rest. There are no ongoing obligations, no data handling requirements, and no legal involvement required from your team.',
  },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    heading: 'Your organisation enrols',
    body: 'We set up employer-funded access for your team. Your HR contact receives everything they need to communicate the benefit to employees.',
  },
  {
    n: '02',
    heading: 'Employees receive access',
    body: 'Each employee gets their own Heirloom access. They complete their Will in their own time, entirely independently of your organisation.',
  },
  {
    n: '03',
    heading: 'Heirloom delivers the service',
    body: 'We guide employees through the process, review their Will against a solicitor-written checklist before issue, and support them if their situation needs more than our platform can handle.',
  },
]

const INCLUDED = [
  'Guided Will preparation — seven steps, around 15–20 minutes',
  'Reviewed against a solicitor-written checklist before issue',
  'Signing guidance: remote video witnessing in NSW, print-and-sign elsewhere',
  'Living Vault — secure document storage and estate organisation',
  'Escalation pathway: complex situations referred to our partner lawyers',
  'Updates if life changes — your team keeps their Will current as circumstances evolve',
]

const TIERS = [
  {
    name: 'Starter',
    wills: 10,
    perWill: 129,
    total: 1290,
    popular: false,
  },
  {
    name: 'Team',
    wills: 50,
    perWill: 109,
    total: 5450,
    popular: true,
  },
  {
    name: 'Company',
    wills: 100,
    perWill: 99,
    total: 9900,
    popular: false,
  },
]

const FAQ = [
  {
    q: 'Can employees keep their Will after they leave the company?',
    a: 'Yes. A Will belongs to the person who made it. Employees retain full access to their Will and Vault regardless of their employment status.',
  },
  {
    q: 'Does our organisation see any employee information?',
    a: 'No. Every employee interacts directly and independently with Heirloom. We hold all estate data under our own privacy policy. Nothing flows back to you — not the Will itself, not the beneficiaries, not the executor, not any other estate details.',
  },
  {
    q: 'How does billing work?',
    a: 'You purchase a pack of Will codes at a fixed rate. Codes are distributed to employees and redeemed when they complete their Will. Unused codes don\'t expire. Enterprise arrangements are invoiced separately — get in touch to discuss.',
  },
  {
    q: 'Can employees\' spouses or partners also use the benefit?',
    a: 'That\'s something we can accommodate — speak to us about it during your enquiry. Many employers extend the benefit to household members as part of a broader family financial wellbeing offering.',
  },
  {
    q: 'What if an employee\'s estate situation is complex?',
    a: 'Heirloom is designed for straightforward estates. If the platform identifies that an employee\'s situation — business interests, overseas assets, blended family arrangements — needs specialist attention, we refer them to our partner lawyers. We never take anyone further than we should.',
  },
  {
    q: 'Are there any fringe benefits tax implications?',
    a: 'We aren\'t able to provide tax advice. We recommend speaking with your payroll or tax adviser to understand the FBT treatment for your specific arrangement. We can provide any product information they need.',
  },
]

export default function ForEmployersPage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', paddingBlock: '8rem 5.5rem' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 780 }}>
          <p style={LABEL}>For Employers</p>
          <h1 style={{
            margin: '1.25rem 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)',
            lineHeight: 1.02,
            fontWeight: 400,
            color: 'var(--mkt-ink-text)',
          }}>
            A meaningful benefit{' '}
            <em style={{ color: 'var(--teal-deep)', fontWeight: 400 }}>for life&apos;s biggest moments.</em>
          </h1>
          <p style={{ margin: '1.75rem 0 0', maxWidth: '40rem', fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Give your employees access to simple, guided Will preparation as part of your financial wellbeing programme. Help them plan for their families and their futures — without adding complexity for your HR team.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#pricing" className="mkt-btn-ink-l">See packages</a>
            <a href="#enquire" style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* ── Why it's good for business ─────────────────────────────────────── */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '36rem', marginBottom: '3rem' }}>
            <p style={LABEL}>Why offer Heirloom</p>
            <h2 style={{
              margin: '.9rem 0 0',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
              lineHeight: 1.08,
              fontWeight: 400,
              color: 'var(--mkt-ink-text)',
            }}>
              Financial wellbeing goes beyond super and salary.
            </h2>
          </div>
          <div
            className="md:grid-cols-2"
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}
          >
            {WHY_ITEMS.map(({ heading, body }) => (
              <div
                key={heading}
                style={{ padding: '1.75rem', border: '1px solid var(--mkt-line)', borderRadius: 10, background: 'var(--mkt-surface)' }}
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

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ paddingBlock: '5.5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', scrollMarginTop: '5rem' }}>
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

      {/* ── What's included ────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 md:flex md:items-start md:gap-20" style={{ ...W }}>
          <div style={{ flexShrink: 0, maxWidth: '22rem', marginBottom: '2rem' }}>
            <p style={LABEL}>What&apos;s included</p>
            <h2 style={{
              margin: '.9rem 0 .75rem',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 3vw, 2.6rem)',
              lineHeight: 1.1,
              fontWeight: 400,
              color: 'var(--mkt-ink-text)',
            }}>
              Everything your employees need.
            </h2>
            <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
              Heirloom handles the entire process. Your organisation provides the access.
            </p>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {INCLUDED.map((item) => (
              <li key={item} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span style={{ fontSize: '.9rem', lineHeight: 1.6, color: 'var(--mkt-ink-text)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Privacy ────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '3.5rem', background: 'var(--mkt-ink-text)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="md:px-10 md:flex md:items-center md:justify-between md:gap-16" style={{ ...W, maxWidth: 900 }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ ...LABEL, color: 'var(--teal)' }}>Private by design</p>
            <h2 style={{
              margin: '.75rem 0 .75rem',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              lineHeight: 1.15,
              fontWeight: 400,
              color: '#fff',
            }}>
              Your organisation sees nothing.
            </h2>
            <p style={{ margin: 0, maxWidth: '28rem', fontSize: '.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)' }}>
              Estate planning is deeply personal. Every employee interacts directly with Heirloom under our own privacy policy. No Will details, beneficiary names, or asset information ever reaches your organisation.
            </p>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.6rem', flexShrink: 0, minWidth: '16rem' }}>
            {[
              'Your employees\' Will contents',
              'Beneficiary or executor names',
              'Asset information',
              'Instructions or wishes',
              'Any platform activity',
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

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ paddingBlock: '5.5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', scrollMarginTop: '5rem' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '36rem', marginBottom: '3rem' }}>
            <p style={LABEL}>Packages</p>
            <h2 style={{
              margin: '.9rem 0 .5rem',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
              lineHeight: 1.08,
              fontWeight: 400,
              color: 'var(--mkt-ink-text)',
            }}>
              Simple, fixed-rate packages.
            </h2>
            <p style={{ margin: 0, fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
              Buy a pack of Will codes. Distribute to your team. Employees redeem in their own time. Unused codes don&apos;t expire.
            </p>
          </div>

          <div
            className="md:grid-cols-4"
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', alignItems: 'stretch' }}
          >
            {TIERS.map(({ name, wills, perWill, total, popular }) => (
              <div
                key={name}
                style={{
                  position: 'relative',
                  padding: '1.75rem',
                  border: `2px solid ${popular ? 'var(--teal)' : 'var(--mkt-line)'}`,
                  borderRadius: 10,
                  background: popular ? 'rgba(42,180,174,.04)' : '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {popular && (
                  <span style={{
                    position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%) translateY(-50%)',
                    background: 'var(--teal)', color: '#fff',
                    fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                    padding: '.25rem .75rem', borderRadius: 99, whiteSpace: 'nowrap',
                  }}>
                    Most popular
                  </span>
                )}
                <p style={{ margin: '0 0 .35rem', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--mkt-stone)' }}>
                  {name}
                </p>
                <p style={{ margin: '0 0 1.25rem', fontSize: '.95rem', color: 'var(--mkt-stone)' }}>
                  {wills} Wills
                </p>
                <p style={{ margin: '0 0 .25rem', fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1, fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
                  ${total.toLocaleString()}
                </p>
                <p style={{ margin: '0 0 1.5rem', fontSize: '.8rem', color: 'var(--mkt-stone)' }}>
                  ${perWill} per Will · includes GST
                </p>
                <a
                  href="#enquire"
                  style={{
                    marginTop: 'auto',
                    display: 'block', textAlign: 'center',
                    padding: '.65rem 1rem', borderRadius: 6,
                    fontSize: '.875rem', fontWeight: 600, textDecoration: 'none',
                    background: popular ? 'var(--teal)' : 'transparent',
                    color: popular ? '#fff' : 'var(--mkt-ink-text)',
                    border: popular ? 'none' : '1.5px solid var(--mkt-line)',
                  }}
                >
                  Get this package
                </a>
              </div>
            ))}

            {/* Enterprise card */}
            <div style={{
              padding: '1.75rem',
              border: '2px solid var(--mkt-line)',
              borderRadius: 10,
              background: 'var(--mkt-ink-text)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <p style={{ margin: '0 0 .35rem', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Enterprise
              </p>
              <p style={{ margin: '0 0 1.25rem', fontSize: '.95rem', color: 'rgba(255,255,255,0.5)' }}>
                500+ Wills
              </p>
              <p style={{ margin: '0 0 .25rem', fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1, fontWeight: 400, color: '#fff' }}>
                Custom
              </p>
              <p style={{ margin: '0 0 1.5rem', fontSize: '.8rem', color: 'rgba(255,255,255,0.45)' }}>
                Volume pricing · invoiced annually
              </p>
              <a
                href="#enquire"
                style={{
                  marginTop: 'auto',
                  display: 'block', textAlign: 'center',
                  padding: '.65rem 1rem', borderRadius: 6,
                  fontSize: '.875rem', fontWeight: 600, textDecoration: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                }}
              >
                Contact us
              </a>
            </div>
          </div>

          <p style={{ marginTop: '1.5rem', fontSize: '.8rem', color: 'var(--mkt-stone)' }}>
            All packages include full Heirloom access for each Will — guided preparation, review, signing guidance, and Living Vault. Employees retain access after leaving the organisation.
          </p>
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
                <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enquiry form ───────────────────────────────────────────────────── */}
      <section id="enquire" style={{ paddingBlock: '5.5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 760 }}>
          <p style={LABEL}>Get in touch</p>
          <h2 style={{
            margin: '1.1rem 0 .75rem',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
            lineHeight: 1.1,
            fontWeight: 400,
            color: 'var(--mkt-ink-text)',
          }}>
            Let&apos;s talk about your team.
          </h2>
          <p style={{ margin: '0 0 2.5rem', fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Tell us about your organisation. We&apos;ll follow up within one business day — no hard sell, just a conversation about whether Heirloom is the right fit.
          </p>
          <div style={{ background: '#fff', border: '1px solid var(--mkt-line)', borderRadius: 8, padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            <EmployerEnquiryForm />
          </div>
          <p style={{ marginTop: '1.25rem', fontSize: '.82rem', color: 'var(--mkt-stone)', textAlign: 'center' }}>
            Or email us directly at{' '}
            <a href="mailto:hello@heirloomlife.com.au" style={{ color: 'var(--teal-deep)' }}>hello@heirloomlife.com.au</a>
          </p>
        </div>
      </section>
    </>
  )
}

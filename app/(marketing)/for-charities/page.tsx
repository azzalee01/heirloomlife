import Link from 'next/link'
import CharityIntakeForm from './_components/CharityIntakeForm'

const W: React.CSSProperties = { maxWidth: 1100, marginInline: 'auto', paddingInline: '1.5rem' }
const LABEL: React.CSSProperties = {
  margin: 0, color: 'var(--teal-deep)', fontSize: '.72rem',
  fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
}

export const metadata = {
  title: 'For Charities - Grow your bequest program with Heirloom Life',
  description: 'Partner with Heirloom Life to reach Australians who are actively planning their estate. Grow your gifts-in-Wills program at exactly the right moment.',
}

const STATS = [
  { figure: '1 in 12', label: 'Australians currently include a gift to charity in their Will' },
  { figure: '$2.5B+', label: 'generated for Australian charities through gifts in Wills each year' },
  { figure: '200x', label: 'the average bequest compared to a typical cash donation' },
]

const VALUE_PROPS = [
  ['Present at the right moment', 'Your cause appears to supporters while they are actively drafting their estate plan - not through a cold campaign weeks later.'],
  ['No disruption to your existing program', 'We work alongside your bequest team, not instead of it. Supporters can still speak directly to your staff.'],
  ['Built for Australian charities', 'We understand DGR requirements, the regulatory environment, and the sensitivities that come with bequest fundraising.'],
  ['Full attribution and reporting', 'Know exactly how many people have named your organisation, and track your program over time with transparent data.'],
]

const HOW_IT_WORKS = [
  ['Register your charity', 'Tell us about your organisation using the form below. We review all partners to ensure a good fit for our users.'],
  ['We surface your cause', 'During the Will drafting process, users are given the option to name a charity as a beneficiary. Registered partners appear in that selection.'],
  ['Supporters act in the moment', 'Someone who already cares about your cause can add you as a beneficiary in seconds - while the Will is open in front of them.'],
]

export default function ForCharitiesPage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', paddingBlock: '8rem 5rem' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 760 }}>
          <p style={LABEL}>For charities</p>
          <h1 style={{
            margin: '1.25rem 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.7rem, 5.5vw, 5rem)',
            lineHeight: 1.02,
            fontWeight: 400,
            color: 'var(--mkt-ink-text)',
          }}>
            Reach supporters at the moment they&apos;re thinking about their{' '}
            <em style={{ color: 'var(--teal-deep)', fontWeight: 400 }}>legacy</em>.
          </h1>
          <p style={{ margin: '1.5rem 0 0', maxWidth: '38rem', fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Gifts in Wills are one of the most valuable income streams available to Australian charities. Heirloom puts your cause in front of supporters at exactly the right moment - when they are writing their Will.
          </p>
          <div style={{ marginTop: '2.25rem' }}>
            <a href="#enquire" className="mkt-btn-ink-l">Register your charity</a>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '4.5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 md:grid-cols-3" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {STATS.map(({ figure, label }) => (
            <div key={figure} style={{ textAlign: 'center', padding: '1.5rem' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 400, color: 'var(--teal-deep)', lineHeight: 1 }}>
                {figure}
              </p>
              <p style={{ margin: '.75rem 0 0', fontSize: '.875rem', lineHeight: 1.55, color: 'var(--mkt-stone)', maxWidth: '16rem', marginInline: 'auto' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.7rem', color: 'var(--mkt-stone-soft)' }}>
          Sources: Fundraising Institute Australia; Philanthropy Australia. September 2026.
        </p>
      </section>

      {/* ── The opportunity ────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <p style={LABEL}>The opportunity</p>
            <h2 style={{ margin: '1rem 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
              Most bequest programs reach people too late.
            </h2>
            <p style={{ margin: '1.25rem 0 1rem', fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
              Traditional bequest marketing tends to reach people years after they have made their Will, or not at all. By then, the conversation is harder and the Will is already signed.
            </p>
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
              Heirloom is different. We are present at the exact moment of decision - when someone is actively drafting their estate plan and choosing who to include. That is the highest-intent moment in bequest fundraising, and it has historically been out of reach for most charities.
            </p>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--mkt-line)', borderRadius: 14, padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {VALUE_PROPS.map(([title, body]) => (
              <div key={title} style={{ borderLeft: '2px solid var(--teal)', paddingLeft: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{title}</p>
                <p style={{ margin: '.4rem 0 0', fontSize: '.85rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: '#fff', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720, marginBottom: '3rem' }}>
          <p style={LABEL}>How it works</p>
          <h2 style={{ margin: '1rem 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
            Simple to join. No ongoing effort required.
          </h2>
        </div>
        <div className="md:px-10 md:grid-cols-3" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {HOW_IT_WORKS.map(([title, body], i) => (
            <div key={title} style={{ border: '1px solid var(--mkt-line)', borderRadius: 12, padding: '1.75rem', background: 'var(--mkt-surface)' }}>
              <span style={{ display: 'flex', width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 7, background: 'var(--teal)', color: '#fff', fontSize: '.75rem', fontWeight: 700 }}>
                {i + 1}
              </span>
              <h3 style={{ margin: '1rem 0 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{title}</h3>
              <p style={{ margin: '.65rem 0 0', fontSize: '.86rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Intake form ────────────────────────────────────────────────────── */}
      <section id="enquire" style={{ paddingBlock: '5.5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2 lg:gap-20" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3.5rem', alignItems: 'start' }}>
          <div>
            <p style={LABEL}>Register</p>
            <h2 style={{ margin: '1rem 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
              Ready to grow your bequest program?
            </h2>
            <p style={{ margin: '1.25rem 0 0', fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', maxWidth: '32rem' }}>
              Tell us about your organisation. We review all partner applications to make sure Heirloom is the right fit, and we&apos;ll be in touch within one business day.
            </p>
            <p style={{ margin: '1rem 0 0', fontSize: '.875rem', lineHeight: 1.65, color: 'var(--mkt-stone-soft)' }}>
              Already have a question?{' '}
              <a href="mailto:hello@heirloomlife.com.au" style={{ color: 'var(--teal-deep)', textDecoration: 'none' }}>
                hello@heirloomlife.com.au
              </a>
            </p>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--mkt-line)', borderRadius: 14, padding: '2.25rem' }}>
            <h3 style={{ margin: '0 0 .5rem', fontSize: '1.15rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>Tell us about your organisation</h3>
            <p style={{ margin: '0 0 1.75rem', fontSize: '.875rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>
              We&apos;ll follow up within one business day.
            </p>
            <CharityIntakeForm />
          </div>
        </div>
      </section>

      {/* ── Footer crosslink ───────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '3.5rem', background: '#fff' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 700, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>Writing your personal Will?</p>
            <p style={{ margin: '.35rem 0 0', fontSize: '.85rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>
              Learn how to include a charitable gift alongside your family.
            </p>
          </div>
          <Link href="/charity-wills" className="mkt-btn-ghost-l" style={{ whiteSpace: 'nowrap' }}>
            Charitable giving
          </Link>
        </div>
      </section>
    </>
  )
}

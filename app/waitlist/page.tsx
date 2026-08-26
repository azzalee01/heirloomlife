import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export const metadata = {
  title: 'Join the waitlist — Heirloom Life',
  description: 'Heirloom Life is currently available in NSW and VIC. Join the waitlist and we\'ll let you know when your state is added.',
}

const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }
const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

export default function WaitlistPage() {
  return (
    <>
      <MarketingNav />

      <section style={{ paddingTop: '8rem', paddingBottom: '6rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 640 }}>
          <span style={SECTION_LABEL}>Waitlist</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.25rem',
          }}>
            We&apos;re expanding state by state.
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', marginBottom: '2rem', maxWidth: '30rem' }}>
            Heirloom Life is currently available in <strong style={{ color: 'var(--mkt-ink-text)', fontWeight: 500 }}>NSW and VIC</strong>. Each state has its own requirements for Wills — we build to the standard of each state before opening it up, so we get it right rather than fast.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', marginBottom: '2.5rem', maxWidth: '30rem' }}>
            Email us with your state and we&apos;ll add you to the list. You&apos;ll hear from us as soon as your state is ready.
          </p>

          <a
            href="mailto:hello@heirloomlife.com.au?subject=Waitlist%20—%20please%20add%20me&body=Hi%2C%0A%0APlease%20add%20me%20to%20the%20waitlist.%0A%0AMy%20state%3A%20"
            className="mkt-btn-ink-m"
          >
            Email to join the waitlist
          </a>

          <p style={{ marginTop: '1.25rem', fontSize: '.82rem', color: 'var(--mkt-stone-soft)' }}>
            Already in NSW or VIC?{' '}
            <Link href="/start" style={{ color: 'var(--teal-deep)', textDecoration: 'underline' }}>
              Start your Will now
            </Link>
            .
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}

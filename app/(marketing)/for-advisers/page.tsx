const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

export default function ForAdvisersPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--mkt-surface-2)', overflow: 'hidden' }}>
        <div className="relative md:flex md:min-h-[30rem] md:items-center md:px-10" style={{ maxWidth: 1100, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <div className="relative z-10 md:w-[54%]" style={{ paddingBlock: '4rem 5.5rem' }}>
          <span style={SECTION_LABEL}>For Advisers</span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Refer your clients into an estate plan they&#8217;ll actually finish.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
            We&#8217;re building a referral programme for financial advisers, accountants, and estate planning professionals. Details are being finalised  -  this page will be updated when the programme is ready to launch.
          </p>
          </div>
          <EditorialBanner src="/images/editorial/advisers.jpg" alt="Professional advisers reviewing an estate plan together" />
        </div>
      </section>

      {/* Placeholder notice */}
      <section style={{ paddingBlock: '4rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ maxWidth: 640, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <div style={{ padding: '2rem', border: '1px solid var(--mkt-line)', borderRadius: 4 }}>
            <p style={{ fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '.75rem' }}>
              Coming soon
            </p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .75rem', letterSpacing: '-.01em' }}>
              The adviser programme is in development
            </h2>
            <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
              The referral and commission structure has not yet been finalised. We&#8217;re not publishing details until we can publish them accurately. If you&#8217;d like to be notified when the programme launches, or want to discuss a potential partnership, reach out directly.
            </p>
            <a
              href="mailto:hello@heirloomlife.com.au"
              className="mkt-btn-ink-sm"
              style={{ marginTop: '1.5rem' }}
            >
              hello@heirloomlife.com.au
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
import EditorialBanner from '@/components/marketing/EditorialBanner'

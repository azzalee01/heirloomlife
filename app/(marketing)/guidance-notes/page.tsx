export default function GuidanceNotesPage() {
  return (
    <section style={{ paddingTop: '4rem', paddingBottom: '8rem', background: 'var(--mkt-surface)' }}>
      <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
        <span style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block' }}>
          Guidance Notes
        </span>
        <h1 style={{
          fontFamily: "var(--font-body)",
          fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
          letterSpacing: '-.02em', fontWeight: 500,
          color: 'var(--mkt-ink-text)', margin: 0,
        }}>
          Plain-language legal reference  -  pending finalisation.
        </h1>
        <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
          Guidance Notes explain in plain English how Heirloom Life&#8217;s service works from a legal perspective  -  what we are, what we are not, and what that means for you as a customer.
        </p>

        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--mkt-line)', borderRadius: 4, background: '#fff' }}>
          <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .5rem' }}>
            Pending legal review
          </p>
          <p style={{ fontSize: '.88rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
            These notes are being drafted with counsel to ensure they accurately describe the legal relationship between Heirloom Life and its customers. We will publish them when they have been reviewed and approved. Publishing inaccurate legal information is worse than publishing nothing  -  so we are waiting until we can publish it correctly.
          </p>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--mkt-line)' }}>
          <p style={{ fontSize: '.85rem', color: 'var(--mkt-stone)', lineHeight: 1.65, margin: 0 }}>
            In the meantime, see our <a href="/faq" style={{ color: 'var(--teal-deep)', textDecoration: 'underline' }}>FAQ</a> for answers to common questions, or contact us at{' '}
            <a href="mailto:hello@heirloomlife.com.au" style={{ color: 'var(--teal-deep)', textDecoration: 'underline' }}>hello@heirloomlife.com.au</a>.
          </p>
        </div>
      </div>
    </section>
  )
}

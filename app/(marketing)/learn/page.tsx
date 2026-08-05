export default function LearnPage() {
  return (
    <section style={{ paddingTop: '4rem', paddingBottom: '8rem', background: 'var(--mkt-surface)' }}>
      <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
        <span style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block' }}>
          Learn
        </span>
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
          letterSpacing: '-.02em', fontWeight: 500,
          color: 'var(--mkt-ink-text)', margin: 0,
        }}>
          Guides, explainers, and Australian estate law — plainly written.
        </h1>
        <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
          Content is in production. Articles will cover Australian succession law fundamentals, life-stage planning, and NSW and VIC execution specifics. Check back soon.
        </p>

        <div style={{ marginTop: '3rem', padding: '2rem', border: '1px solid var(--mkt-line)', borderRadius: 4, background: '#fff' }}>
          <p style={{ fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '.75rem' }}>
            Coming soon
          </p>
          <p style={{ fontSize: '.9rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
            Planned content covers three pillars: legal fundamentals specific to Australian law, life-stage and readiness guides, and NSW/VIC execution specifics. We are not publishing generic estate planning content — everything will be Australian-law-specific and verified before publication.
          </p>
        </div>
      </div>
    </section>
  )
}

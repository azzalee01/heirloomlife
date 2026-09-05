import type { ReactNode } from 'react'

export type LegalSection = {
  title: string
  content: ReactNode
}

export default function LegalDocument({
  eyebrow,
  title,
  summary,
  effectiveDate,
  notice,
  sections,
}: {
  eyebrow: string
  title: string
  summary: string
  effectiveDate: string
  notice?: ReactNode
  sections: LegalSection[]
}) {
  return (
    <>
      <section style={{ paddingBlock: '4.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ maxWidth: 780, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <span style={{ display: 'block', marginBottom: '1.1rem', color: 'var(--teal-deep)', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
          <h1 style={{ margin: 0, color: 'var(--mkt-ink-text)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1.08 }}>
            {title}
          </h1>
          <p style={{ maxWidth: '42rem', margin: '1.1rem 0 0', color: 'var(--mkt-stone)', fontSize: '1.05rem', lineHeight: 1.65 }}>
            {summary}
          </p>
          <p style={{ margin: '1.5rem 0 0', color: 'var(--mkt-stone-soft)', fontSize: '.8rem' }}>
            Effective {effectiveDate}
          </p>
          {notice && (
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', border: '1px solid var(--mkt-line)', borderRadius: 4, background: '#fff', color: 'var(--mkt-stone)', fontSize: '.86rem', lineHeight: 1.65 }}>
              {notice}
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingBlock: '4rem 7rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ maxWidth: 780, marginInline: 'auto', paddingInline: '1.5rem' }}>
          {sections.map((section, index) => (
            <section
              key={section.title}
              aria-labelledby={`legal-section-${index + 1}`}
              style={{ paddingBlock: '2rem', borderBottom: index < sections.length - 1 ? '1px solid var(--mkt-line)' : 'none' }}
            >
              <h2 id={`legal-section-${index + 1}`} style={{ margin: '0 0 1rem', color: 'var(--mkt-ink-text)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-.01em' }}>
                {index + 1}. {section.title}
              </h2>
              <div className="legal-copy">{section.content}</div>
            </section>
          ))}
        </div>
      </section>
    </>
  )
}

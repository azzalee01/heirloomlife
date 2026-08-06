import Link from 'next/link'

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

const FAQS = [
  {
    q: 'Is a Heirloom Life Will legally valid in Australia?',
    a: "A Will produced through Heirloom Life is only legally valid once it is correctly signed and witnessed according to the requirements of your state. We walk you through those requirements step by step — but signing and witnessing is something you must do correctly. An unsigned or incorrectly witnessed Will has no legal effect.",
  },
  {
    q: 'How is this different from downloading a Will kit from a newsagent?',
    a: "A Will kit gives you a blank form and a set of instructions. Heirloom Life gives you a guided drafting process, a solicitor review, and a Vault to keep your estate current after you sign. The difference is not mainly the document — it's the process around it and the ongoing maintenance.",
  },
  {
    q: 'What if my estate is complicated — business interests, trusts, overseas assets?',
    a: "Complex estates are flagged during the drafting process. If your situation involves business succession, testamentary trusts, or overseas assets, the solicitor review step is specifically designed to catch what the questionnaire might not fully resolve. For highly complex estates, we may recommend working with a solicitor directly before finalising your Will through us.",
  },
  {
    q: 'How long does it take to complete a Will?',
    a: "Most people complete the guided questionnaire in 30–60 minutes. Solicitor review turnaround times are being confirmed before launch — we will publish specific SLAs when they reflect our operational commitment, not an estimate.",
  },
  {
    q: 'Can I update my Will after signing it?',
    a: "Yes. You can update your Will at any time. Changes require a new draft, a new solicitor review for high-severity clauses, and new signing and witnessing. The Living Vault membership tracks life events that might trigger a review and prompts you before an oversight becomes a problem.",
  },
  {
    q: 'What happens to my Will if I die?',
    a: "Your Will is stored in your Vault. Your executor — the person you name to carry out your wishes — is granted access after death certificate lodgement and identity verification. We do not release access automatically.",
  },
  {
    q: 'Is Heirloom Life providing legal advice?',
    a: "No. Heirloom Life provides a document drafting service and solicitor review. The solicitor review is conducted by a qualified practitioner who will identify issues with your draft — but using Heirloom Life does not create a solicitor–client relationship with Heirloom Life itself. See our Guidance Notes for a plain-language explanation of what this means.",
  },
  {
    q: 'What states do you support?',
    a: "The drafting process covers all eight Australian states and territories. State-specific rules — especially around execution, witnessing, and revocation — are accounted for based on the state you provide at the start of the questionnaire. NSW and VIC have the most state-specific complexity and have been prioritised in our review process.",
  },
]

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: '4rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <span style={SECTION_LABEL}>FAQ</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Answers to the questions people{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>actually ask</em>.
          </h1>
        </div>
      </section>

      {/* FAQ accordion */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          {FAQS.map(item => (
            <details
              key={item.q}
              style={{ borderTop: '1px solid var(--mkt-line)', paddingBlock: '1.4rem' }}
            >
              <summary
                style={{
                  cursor: 'pointer', fontWeight: 600, fontSize: '.98rem',
                  color: 'var(--mkt-ink-text)', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
                }}
              >
                <span>{item.q}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '.2rem', color: 'var(--mkt-stone)' }} aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </summary>
              <p style={{ marginTop: '.75rem', fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)', paddingRight: '2rem' }}>
                {item.a}
              </p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--mkt-line)' }}/>
        </div>
      </section>

      {/* More questions */}
      <section style={{ paddingBlock: '4rem', background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .75rem', letterSpacing: '-.01em' }}>
            Didn&#8217;t find what you were looking for?
          </h2>
          <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: '0 0 1.5rem' }}>
            Read our <Link href="/guidance-notes" style={{ color: 'var(--teal-deep)', textDecoration: 'underline' }}>Guidance Notes</Link> for a deeper look at how the legal side works, or get in touch directly.
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

import Link from 'next/link'

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

const FAQS = [
  {
    q: 'Is a Heirloom Life Will legally valid in Australia?',
    a: "A Will produced through Heirloom Life is only legally valid once it is correctly signed and witnessed according to the requirements of your state. We walk you through those requirements step by step  -  but signing and witnessing is something you must do correctly. An unsigned or incorrectly witnessed Will has no legal effect.",
  },
  {
    q: 'How is this different from downloading a Will kit from a newsagent?',
    a: "A Will kit gives you a blank form and a set of instructions. Heirloom Life gives you a guided drafting process, a Vault to keep your estate current, and a standard solicitor quality review before your Will is issued. The difference is not mainly the document  -  it's the process around it and the ongoing maintenance.",
  },
  {
    q: 'What if my estate is complicated  -  business interests, trusts, overseas assets?',
    a: "Complete your Will through the questionnaire  -  we'll flag the specific areas of concern in your Vault. Your Will also receives a standard solicitor quality review before being issued. For situations that need a more detailed bespoke engagement, we can connect you directly with our partner lawyers through your Vault. For very complex estates, a bespoke Will prepared entirely by a solicitor may be more appropriate, and we can refer you.",
  },
  {
    q: 'How long does it take to complete a Will?',
    a: "Most people complete the guided questionnaire in 30-60 minutes.",
  },
  {
    q: 'Can I update my Will after signing it?',
    a: "Yes. The $129 one-off Will includes three months of full Vault benefits. The $99 annual membership keeps those benefits active, including supported updates and life-event prompts. Every changed Will must be signed and witnessed again.",
  },
  {
    q: 'Do I pay for both the Will and membership?',
    a: "No. Choose either $129 once for the Will plus three months of full Vault benefits, or $99 a year with your Will and continuing membership included. If you cancel membership later, you can still download and retain your completed Will.",
  },
  {
    q: 'What happens to my Will if I die?',
    a: "Your Will is stored in your Vault. Your executor  -  the person you name to carry out your wishes  -  is granted access after death certificate lodgement and identity verification. We do not release access automatically.",
  },
  {
    q: 'Can I connect my bank accounts to my Vault?',
    a: "Yes. From your Vault dashboard you can connect bank accounts through Basiq, a Consumer Data Right (CDR) accredited data intermediary. You are redirected to Basiq's secure consent page to authenticate directly with your bank  -  Heirloom never sees your banking credentials. We request your account name, type and balance only. No transaction history is collected. Your consent lasts 12 months and can be revoked at any time from your Vault.",
  },
  {
    q: 'What is Basiq and why does Heirloom use it?',
    a: "Basiq is a CDR-accredited data intermediary regulated under Australia's Consumer Data Right framework. Using an accredited intermediary means your banking credentials are handled by a regulated third party, not Heirloom. The CDR logo and Basiq's name appear on the consent screen as required by law. You can read more about how bank connections work on our Security and Trust page.",
  },
  {
    q: 'Is Heirloom Life providing legal advice?',
    a: "No. Heirloom Life is not a law firm and does not provide legal advice. Your Will is prepared using established estate planning drafting standards. Every Will issued through Heirloom Life is subject to a standard solicitor quality review before being finalised. Using Heirloom Life does not create a solicitor-client relationship.",
  },
  {
    q: 'What states do you support?',
    a: "Heirloom Life is available across all Australian states and territories. Your Will is drafted to the specific legal requirements of your state. NSW members have access to remote AV witnessing  -  members in all other states complete the signing process in person with two witnesses, which we walk you through step by step.",
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
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Answers to the questions people{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>actually ask</em>.
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

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

const BANK_ITEMS = [
  {
    title: 'How bank connections work',
    body: 'When you connect a bank or super account, you are redirected to a consent page operated by Basiq, a Consumer Data Right accredited data intermediary. Heirloom never sees your banking credentials. You authenticate directly on Basiq\'s hosted page  -  not through any Heirloom screen.',
  },
  {
    title: 'What data we request',
    body: 'We request account name, type and balance only, under the CDR scope bank:accounts.basic:read. We do not request transaction history. Your consent covers this scope specifically and can be revoked from your Vault at any time.',
  },
  {
    title: 'Basiq\'s role',
    body: 'Basiq is named on the consent screen alongside the CDR logo. This is a regulatory requirement under the Consumer Data Right framework and cannot be removed. You are consenting to Basiq collecting data on Heirloom\'s behalf under that framework. Basiq\'s privacy policy governs data in transit.',
  },
]

const ITEMS = [
  {
    title: 'Data encryption',
    body: 'Your data is stored on encrypted, access-controlled cloud infrastructure. Data is encrypted at rest and all connections are enforced over TLS. We do not store Will content in plaintext outside the secured database.',
  },
  {
    title: 'Authentication',
    body: 'Access to your account is managed through a purpose-built authentication service. We support secure email and password login and issue short-lived, signed session tokens. No shared secrets, no persistent tokens stored in local storage.',
  },
  {
    title: 'Executor access controls',
    body: 'Your executor cannot access your Vault during your lifetime. Access is gated behind a verified death certificate lodgement and identity verification step. The exact verification process is documented in your Vault.',
  },
  {
    title: 'Solicitor review independence',
    body: 'Solicitor review is conducted by qualified Australian legal practitioners who are independent of Heirloom Life. Review is triggered by you or by high-severity flags in your Will  -  not automatically shared on document creation.',
  },
]

export default function SecurityTrustPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: '4rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <span style={SECTION_LABEL}>Security &amp; Trust</span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            What we can tell you,{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>accurately</em>.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
            Estate documents are among the most sensitive records you can hold. We have written this page to describe what is actually in place today  -  not to match the length of a competitor&#8217;s security marketing page.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                style={{
                  paddingBlock: '2rem',
                  borderBottom: i < ITEMS.length - 1 ? '1px solid var(--mkt-line)' : 'none',
                  display: 'grid', gridTemplateColumns: '1fr', gap: '.75rem',
                }}
                className="md:grid-cols-[240px_1fr]"
              >
                <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: 0, paddingTop: '.1rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bank connections */}
      <section style={{ paddingBlock: '5.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <span style={SECTION_LABEL}>Bank connections</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {BANK_ITEMS.map((item, i) => (
              <div
                key={item.title}
                style={{
                  paddingBlock: '2rem',
                  borderBottom: i < BANK_ITEMS.length - 1 ? '1px solid var(--mkt-line)' : 'none',
                  display: 'grid', gridTemplateColumns: '1fr', gap: '.75rem',
                }}
                className="md:grid-cols-[240px_1fr]"
              >
                <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: 0, paddingTop: '.1rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ paddingBlock: '4rem', background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .75rem', letterSpacing: '-.01em' }}>
            Questions about security?
          </h2>
          <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: '0 0 1.25rem' }}>
            If you have a specific security question that isn&#8217;t answered here, contact us directly. We&#8217;d rather acknowledge a gap than paper over it.
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

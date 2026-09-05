import Link from 'next/link'

const LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

const H2: React.CSSProperties = {
  fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-.01em',
  color: 'var(--mkt-ink-text)', margin: '0 0 .9rem',
}

const BODY: React.CSSProperties = {
  fontSize: '.96rem', lineHeight: 1.7, color: 'var(--mkt-stone)', margin: '0 0 1rem',
}

const CALLOUT: React.CSSProperties = {
  borderLeft: '2px solid var(--teal)', paddingLeft: '1.25rem',
  margin: '1.75rem 0', fontSize: '.93rem', lineHeight: 1.65, color: 'var(--mkt-stone)',
  fontStyle: 'italic',
}

const EVENTS = [
  {
    title: 'Getting married',
    body: 'In most Australian states, marriage automatically revokes a Will made before the marriage  -  unless the Will was explicitly made in contemplation of that marriage. If you wrote a Will before your wedding and have not updated it since, there is a real chance it no longer exists as a valid document. This applies even if the Will was made recently.',
    urgent: true,
  },
  {
    title: 'Separation or divorce',
    body: 'Divorce does not revoke your entire Will, but it does revoke gifts to a former spouse and removes them as executor in most states. If you separated but have not yet divorced, your former partner may still inherit under your existing Will. The moment a relationship ends is the moment to review your estate plan.',
    urgent: true,
  },
  {
    title: 'Having or adopting a child',
    body: 'Every new child in your family needs to be accounted for  -  both as a potential beneficiary and as a consideration for guardian appointments. A Will that names no guardian leaves the decision to a court. A Will that predates a child may unintentionally exclude them, depending on how the gifts are worded.',
    urgent: true,
  },
  {
    title: 'Buying property',
    body: 'Real estate is typically a significant portion of any estate. How you hold the property matters: property held as joint tenants passes automatically to the surviving owner and does not flow through your Will at all. Property held as tenants in common does form part of your estate. Check how your property is titled  -  and whether your Will reflects what you actually intend.',
    urgent: false,
  },
  {
    title: 'Starting or selling a business',
    body: 'A business interest creates complexity that most template Wills do not fully address. Who inherits the business? Do they have the skills or interest to run it? Is there a buy-sell agreement with co-owners that overrides your intentions? Business succession planning deserves specific attention  -  this is an area where a solicitor review adds real value.',
    urgent: false,
  },
  {
    title: 'Death of a named beneficiary or executor',
    body: 'If a person named in your Will predeceases you, the gift to them typically lapses unless you have named a substitute. If your executor dies, you may have no one appointed to administer your estate. Review your Will whenever someone important to it is no longer able to play their role.',
    urgent: false,
  },
  {
    title: 'Significant change in assets',
    body: 'A major inheritance, the sale of a business, a substantial investment, or a period of significant debt can all change what your estate looks like in ways your current Will does not account for. Even if the beneficiaries remain the same, the relative sizes of gifts may no longer reflect your intentions.',
    urgent: false,
  },
  {
    title: 'Moving overseas or acquiring foreign assets',
    body: 'Australian succession law applies to assets in Australia, but not automatically to assets held abroad. Some countries require a separate Will valid in their jurisdiction. If you move permanently overseas, your Will may also need to reflect your new place of domicile. A solicitor with international estate planning experience can advise on the specifics.',
    urgent: false,
  },
]

export default function WhenToUpdatePage() {
  return (
    <>
      <section style={{ paddingTop: '4rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <span style={LABEL}>Learn · Life stages</span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
          }}>
            When to{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
              update
            </em>{' '}
            your Will
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
            A Will is not a set-and-forget document. Life changes, and your estate plan should keep up. Some of those changes are more urgent than others.
          </p>
          <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
            Australian law · 7 min read
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>Review it regularly, update it when things change</h2>
          <p style={BODY}>
            As a general rule, review your Will every three to five years even if nothing major has changed. Beneficiaries grow up, relationships evolve, and the value of your estate shifts. A periodic review catches issues before they become problems.
          </p>
          <p style={BODY}>
            Beyond that baseline, certain life events require a prompt update. Some of them  -  marriage in particular  -  can invalidate your entire existing Will without you realising.
          </p>
          <blockquote style={CALLOUT}>
            Three of the events below  -  marriage, separation, and having a child  -  should be treated as urgent. The others are important but allow more time.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Events that require an update</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {EVENTS.map((event, i) => (
              <div
                key={event.title}
                style={{
                  paddingBlock: '1.75rem',
                  borderBottom: i < EVENTS.length - 1 ? '1px solid var(--mkt-line)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.55rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: 0 }}>
                    {event.title}
                  </h3>
                  {event.urgent && (
                    <span style={{
                      fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase',
                      fontWeight: 700, color: 'var(--teal-deep)',
                      border: '1px solid rgba(42,180,174,.35)', padding: '.15rem .55rem',
                    }}>
                      Update now
                    </span>
                  )}
                </div>
                <p style={{ ...BODY, margin: 0 }}>{event.body}</p>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>How to update your Will</h2>
          <p style={BODY}>
            Minor changes  -  correcting a name, adding a specific gift  -  can sometimes be made through a codicil: a short addendum that amends the existing Will without replacing it. A codicil must be executed with the same formality as the original Will (written, signed, and witnessed by two independent people).
          </p>
          <p style={BODY}>
            For any significant change  -  new beneficiaries, a change of executor, a change in how your estate is divided  -  it is cleaner to write a new Will entirely. A new Will should explicitly revoke all previous Wills to avoid ambiguity. Heirloom lets you do this at any time and produces a new document from your updated answers.
          </p>
          <p style={BODY}>
            Destroy old copies of any Will you have replaced. Keep only the current, signed original. Outdated versions stored alongside a new Will create unnecessary confusion for your executor.
          </p>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/your-will', label: 'What makes a Will legally valid' },
                { href: '/learn/superannuation', label: 'Superannuation and your estate' },
                { href: '/learn/intestacy', label: 'What happens without a Will' },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize: '.93rem', color: 'var(--teal-deep)', textDecoration: 'none' }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBlock: '5rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem', textAlign: 'center' }} className="md:px-10">
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 1rem' }}>
            Your Will, updated whenever you need
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            Heirloom stores your answers in your Vault. When life changes, update your Will in minutes  -  no re-entering everything from scratch.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

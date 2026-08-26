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

export default function IntestacyPage() {
  return (
    <>
      <section style={{ paddingTop: '4rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <span style={LABEL}>Learn · Will fundamentals</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
          }}>
            What happens to your estate{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
              without a Will
            </em>
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
            Dying without a valid Will is called dying intestate. Your estate does not go to the state — but it does get distributed according to a formula set by law, not by you.
          </p>
          <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
            Australian law · 6 min read
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>Intestacy: the default you didn&#8217;t choose</h2>
          <p style={BODY}>
            Every Australian state and territory has intestacy laws — a statutory formula that determines who inherits from an estate when there is no valid Will. The formula is fixed and predictable. It has no knowledge of your relationships, your intentions, or your preferences.
          </p>
          <p style={BODY}>
            The practical effect is that assets are distributed according to family proximity, not affection. The people you would have chosen may receive nothing; people you barely know may receive everything.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>How intestacy distribution works</h2>
          <p style={BODY}>
            Australian intestacy laws follow a priority order. The rules vary slightly between states, but the general structure is consistent:
          </p>

          {[
            {
              scenario: 'Spouse or de facto partner, no children',
              outcome: 'The entire estate passes to the surviving partner.',
            },
            {
              scenario: 'Spouse or de facto partner, with children',
              outcome: 'The spouse receives a statutory amount (this varies by state) plus a share of the remainder. Children share the rest. The exact split depends on whether the children are from the current relationship or a prior one.',
            },
            {
              scenario: 'Children only (no spouse)',
              outcome: 'The estate is divided equally between all children. Step-children and children not legally adopted are generally not included.',
            },
            {
              scenario: 'No spouse, no children',
              outcome: 'The estate passes to parents. If parents have predeceased, it passes to siblings. If no siblings, to grandparents, then aunts and uncles, then cousins.',
            },
            {
              scenario: 'No surviving family at all',
              outcome: 'In the rare case of no surviving relatives within the legal definition, the estate passes to the state government — a concept known as bona vacantia.',
            },
          ].map((row, i, arr) => (
            <div
              key={row.scenario}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
                paddingBlock: '1.25rem',
                borderBottom: i < arr.length - 1 ? '1px solid var(--mkt-line)' : 'none',
                alignItems: 'start',
              }}
            >
              <p style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: 0 }}>
                {row.scenario}
              </p>
              <p style={{ ...BODY, fontSize: '.9rem', margin: 0 }}>{row.outcome}</p>
            </div>
          ))}

          <blockquote style={{ ...CALLOUT, marginTop: '2rem' }}>
            De facto partners — including same-sex partners — are generally recognised under Australian intestacy law, but proving the relationship exists can require evidence and legal proceedings. A Will removes that uncertainty entirely.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Who intestacy consistently fails</h2>
          <p style={BODY}>
            The intestacy formula is designed for conventional family structures. It does not accommodate the full range of relationships and intentions that make up real lives.
          </p>

          {[
            {
              group: 'Long-term partners who are not married or de facto',
              detail: 'A partner who does not meet the legal definition of a de facto relationship — perhaps because you have not lived together continuously, or the relationship is recent — may receive nothing under intestacy, regardless of how significant the relationship is.',
            },
            {
              group: 'Step-children',
              detail: 'Step-children have no automatic right to inherit under intestacy unless they were legally adopted. A blended family where step-children are treated as equal members may be completely undone by intestacy law.',
            },
            {
              group: 'Close friends',
              detail: 'Friendships have no place in the intestacy formula. A lifelong friend who was your closest confidant and who you would have wanted to inherit something receives nothing.',
            },
            {
              group: 'Charities',
              detail: 'Any charitable gift you would have included in a Will disappears entirely if you die intestate.',
            },
            {
              group: 'Estranged relatives',
              detail: 'The formula does not know who you are on good terms with. A sibling you haven\'t spoken to in years may inherit ahead of a close friend or a chosen family member.',
            },
          ].map((item, i, arr) => (
            <div
              key={item.group}
              style={{
                paddingBlock: '1.5rem',
                borderBottom: i < arr.length - 1 ? '1px solid var(--mkt-line)' : 'none',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .4rem' }}>
                {item.group}
              </h3>
              <p style={{ ...BODY, margin: 0 }}>{item.detail}</p>
            </div>
          ))}

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>The practical cost of intestacy</h2>
          <p style={BODY}>
            Beyond the question of who inherits, dying without a Will makes estate administration significantly harder and more expensive.
          </p>
          <p style={BODY}>
            Without a named executor, the court must appoint an administrator — typically the closest next of kin. That person must apply for Letters of Administration rather than a standard grant of probate. The process is more complex, typically takes longer, and can involve greater legal costs.
          </p>
          <p style={BODY}>
            Banks and financial institutions may be unwilling to release funds without a formal grant. Property cannot be transferred. The estate is frozen while the legal process works through.
          </p>
          <p style={BODY}>
            For a family already managing grief, this administrative burden arrives at the worst possible time — and it is entirely avoidable.
          </p>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/your-will', label: 'What makes a Will legally valid' },
                { href: '/learn/choosing-an-executor', label: 'Choosing an executor' },
                { href: '/passing/estate-administration', label: 'Estate administration after a death' },
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
            Your intentions, in writing
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            A complete Will takes about twenty minutes. It removes any ambiguity about who gets what and who is responsible.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

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

export default function SuperannuationPage() {
  return (
    <>
      <section style={{ paddingTop: '4rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <span style={LABEL}>Learn · Assets</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
          }}>
            Superannuation and your{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
              estate
            </em>
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
            For most Australians, superannuation is their largest or second-largest asset. It also has almost nothing to do with your Will. Understanding the difference matters.
          </p>
          <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
            Australian law · 7 min read
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>Why super sits outside your Will</h2>
          <p style={BODY}>
            Superannuation is held in trust by your fund trustee  -  not by you directly. Legally, it is not part of your estate. When you die, the fund trustee has the power to decide who receives your superannuation death benefit, unless you have made a binding nomination that removes that discretion.
          </p>
          <p style={BODY}>
            This surprises many people. A Will is a comprehensive document that covers your financial affairs  -  but it cannot reach assets you don&#8217;t legally own. Your super fund has its own separate beneficiary nomination process, entirely independent of anything in your Will.
          </p>
          <blockquote style={CALLOUT}>
            Writing a Will without a current Binding Death Nomination means a potentially significant asset will be distributed entirely at the fund trustee&#8217;s discretion  -  not yours.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>What is a Binding Death Nomination?</h2>
          <p style={BODY}>
            A Binding Death Nomination (BDN) is a formal instruction to your super fund directing where your death benefit should go. Unlike a non-binding nomination  -  which is merely a suggestion the trustee can override  -  a valid BDN legally compels the trustee to distribute the benefit as you instructed.
          </p>
          <p style={BODY}>
            To make a BDN valid:
          </p>
          <ul style={{ paddingLeft: '1.4rem', margin: '0 0 1rem' }}>
            <li style={{ ...BODY, margin: '0 0 .5rem' }}>You must nominate only eligible dependants or your legal personal representative (your estate)</li>
            <li style={{ ...BODY, margin: '0 0 .5rem' }}>The nomination must be in writing and signed by you in front of two witnesses</li>
            <li style={{ ...BODY, margin: 0 }}>Most BDNs expire after three years and must be renewed  -  even if nothing in your life has changed</li>
          </ul>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Who can you nominate?</h2>
          <p style={BODY}>
            The Superannuation Industry (Supervision) Act restricts who can receive a death benefit directly. Eligible dependants include:
          </p>
          {[
            'Your spouse or de facto partner (including same-sex partners)',
            'Your children (biological, adopted, or step)',
            'Any person in an interdependency relationship with you  -  meaning you lived together, one or both provided financial and domestic support, and there was a close personal relationship',
            'Any person who was financially dependent on you at the time of your death',
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex', gap: '1rem',
                paddingBlock: '.9rem',
                borderBottom: '1px solid var(--mkt-line)',
              }}
            >
              <span style={{ color: 'var(--teal)', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', paddingTop: '.05rem', flexShrink: 0 }}> - </span>
              <p style={{ ...BODY, margin: 0 }}>{item}</p>
            </div>
          ))}
          <p style={{ ...BODY, marginTop: '1.25rem' }}>
            If you nominate your estate (your legal personal representative), the super proceeds will flow into your estate and be distributed under your Will  -  giving you more control but potentially triggering different tax treatment depending on who the ultimate beneficiaries are.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>The three-year renewal trap</h2>
          <p style={BODY}>
            Most Binding Death Nominations lapse after three years. If yours has expired, the nomination becomes non-binding and the trustee regains discretion over where your super goes.
          </p>
          <p style={BODY}>
            This catches people out. You may have made a BDN years ago, assumed it was taken care of, and never thought about it again  -  while three years quietly passed. Some funds offer non-lapsing BDNs; check with your fund.
          </p>
          <p style={BODY}>
            A practical habit: treat your BDN review the same way you treat your annual tax return. Check it each year alongside any changes to your personal circumstances.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>What about life insurance?</h2>
          <p style={BODY}>
            Many superannuation accounts include default life insurance. The same rules apply  -  the insurance payout is paid to your fund and then distributed according to your BDN or at the trustee&#8217;s discretion. It does not automatically flow to the beneficiaries named in your Will.
          </p>
          <p style={BODY}>
            If you hold life insurance outside of super (a standalone policy), the insurer will pay the benefit according to the beneficiary you nominated directly with them  -  again, completely separate from your Will.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>A note on tax</h2>
          <p style={BODY}>
            Superannuation death benefits may be taxed depending on who receives them and how they were held in the fund. Benefits paid to tax dependants (generally spouses, minor children, and financially dependent individuals) are tax-free. Benefits paid to adult children who were not financially dependent are typically taxed at up to 17% (including Medicare levy) on the taxable component.
          </p>
          <p style={BODY}>
            Routing super through your estate rather than directly to beneficiaries can affect tax outcomes. For larger superannuation balances, specialist tax advice is worth obtaining before deciding on your BDN strategy.
          </p>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/your-will', label: 'What makes a Will legally valid' },
                { href: '/learn/when-to-update', label: 'When to update your Will' },
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
            A Will is part of the picture
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            Start with a complete, state-specific Will  -  then check your BDN with your super fund.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

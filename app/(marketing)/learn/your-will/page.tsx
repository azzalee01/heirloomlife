import Link from 'next/link'
import EditorialBanner from '@/components/marketing/EditorialBanner'

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

export default function YourWillPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--mkt-surface-2)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }} className="relative md:flex md:min-h-[22rem] md:items-center md:px-10">
          <div className="relative z-10 md:w-[54%]" style={{ maxWidth: '38rem', paddingBlock: '5rem' }}>
            <span style={LABEL}>Learn · Will fundamentals</span>
            <h1 style={{
              fontFamily: "var(--font-body)",
              fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
              letterSpacing: '-.02em', fontWeight: 500,
              color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
            }}>
              What is a Will  -  and what makes it{' '}
              <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
                legally valid?
              </em>
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
              A Will is the legal document that says what happens to your assets after you die, and who should look after your children if you can&#8217;t. Without one, the state decides  -  not you.
            </p>
            <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
              Australian law · 6 min read
            </p>
          </div>
          <EditorialBanner src="/images/learn/your-will.jpg" alt="A Will document and fountain pen in a teal folder" />
        </div>
      </section>

      {/* Content */}
      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>What a Will actually does</h2>
          <p style={BODY}>
            A Will (formally, a Last Will and Testament) is a legal document that records your instructions for distributing your estate after you die. It appoints an executor  -  the person responsible for carrying out those instructions  -  and can name a guardian for any minor children.
          </p>
          <p style={BODY}>
            Your Will can specify who receives your property, money, investments, and personal possessions. It can include specific gifts to individuals or charities, set conditions on how assets are held for beneficiaries who are young, and capture your preferences around funeral arrangements.
          </p>
          <p style={BODY}>
            What it cannot do is override the law entirely. If you exclude a spouse or child, they may still have grounds to make a Family Provision claim against your estate  -  a topic worth discussing with a solicitor in complex situations.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Five requirements for a valid Will in Australia</h2>
          <p style={BODY}>
            Australian succession law is state-based, but the core requirements are consistent across all states and territories.
          </p>

          {[
            {
              n: '01',
              title: 'You must be 18 or older',
              body: 'Only adults can make a Will in Australia. There are limited exceptions  -  for example, a person on active military service  -  but these are narrow. If you are under 18 and in circumstances that warrant a Will, a solicitor can advise on a statutory Will application.',
            },
            {
              n: '02',
              title: 'You must have testamentary capacity',
              body: 'The law requires that you understand what a Will is and its effect, that you have a broad understanding of the assets you own, that you understand who might reasonably expect to inherit from you, and that you are not suffering from a disorder of the mind that affects your judgment. This is why Wills made late in life or during illness are sometimes challenged.',
            },
            {
              n: '03',
              title: 'Your Will must be in writing',
              body: 'Handwritten or typed  -  both are acceptable. Verbal instructions, voice recordings, and video messages are not legally binding as a Will in Australia, regardless of how clearly they express your intentions.',
            },
            {
              n: '04',
              title: 'You must sign it',
              body: 'Your signature (or a mark you make with intention to sign) must appear on the Will. If you are physically unable to sign, you may direct another person to sign on your behalf, provided they do so in your presence.',
            },
            {
              n: '05',
              title: 'Two independent witnesses must sign',
              body: 'Two witnesses  -  both 18 or older  -  must watch you sign and then sign the Will themselves, in your presence and in each other\'s presence. Witnesses should not be beneficiaries of your Will or the spouse of a beneficiary. If a witness is also a beneficiary, the gift to that person may fail even if the Will itself remains valid.',
            },
          ].map((req) => (
            <div
              key={req.n}
              style={{
                display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '1.25rem',
                paddingBlock: '1.75rem',
                borderBottom: '1px solid var(--mkt-line)',
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: '1.3rem', color: 'var(--teal)', fontStyle: 'italic', paddingTop: '.1rem' }}>
                {req.n}
              </span>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .5rem', letterSpacing: '-.01em' }}>
                  {req.title}
                </h3>
                <p style={{ ...BODY, margin: 0 }}>{req.body}</p>
              </div>
            </div>
          ))}

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>What a Will does not cover</h2>
          <p style={BODY}>
            Two of the most valuable assets most Australians own  -  superannuation and jointly held property  -  fall outside your Will entirely.
          </p>
          <p style={BODY}>
            Superannuation is held in trust by your fund trustee, not by you directly. It does not form part of your estate and cannot be distributed through your Will. To direct it, you need a separate Binding Death Nomination with your fund.
          </p>
          <p style={BODY}>
            Property owned as joint tenants  -  common for couples  -  automatically passes to the surviving owner by right of survivorship. It bypasses your Will and the probate process entirely.
          </p>
          <blockquote style={CALLOUT}>
            Life insurance, bank accounts held jointly, and assets held in a family trust follow similar rules. Your Will only controls assets in your own name, held individually.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>When does a Will become invalid?</h2>
          <p style={BODY}>
            Getting married automatically revokes a Will made before the marriage in most Australian states, unless the Will was made in contemplation of that marriage. This catches people out  -  particularly those who write a Will young and marry years later without thinking to update it.
          </p>
          <p style={BODY}>
            Divorce does not revoke an entire Will, but it does revoke any gifts made to a former spouse and removes them as executor in most states. If you wrote your Will before a divorce and never updated it, your former spouse likely no longer benefits  -  but your executor appointment may also be void, which can create complications.
          </p>
          <p style={BODY}>
            A Will that was never signed or witnessed, or was signed without two valid witnesses, is not legally valid. Courts can sometimes admit informal documents as a Will, but this is expensive, uncertain, and takes time.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>How long does a Will last?</h2>
          <p style={BODY}>
            A valid Will remains in effect until you revoke it, make a new one, or get married (which revokes it automatically in most states). There is no expiry date. A Will you wrote in your 30s is still your Will in your 60s  -  which is why reviewing it after major life events is important.
          </p>

          {/* Related articles */}
          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/choosing-an-executor', label: 'Choosing an executor' },
                { href: '/learn/guardians', label: 'Appointing a guardian for your children' },
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

      {/* CTA */}
      <section style={{ paddingBlock: '5rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem', textAlign: 'center' }} className="md:px-10">
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 1rem' }}>
            Ready to write your Will?
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            Answer seven guided questions and we&#8217;ll produce a complete, state-specific Will draft.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

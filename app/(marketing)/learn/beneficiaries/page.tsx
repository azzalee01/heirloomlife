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

export default function BeneficiariesPage() {
  return (
    <>
      <section style={{ background: 'var(--mkt-surface-2)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }} className="relative md:flex md:min-h-[22rem] md:items-center md:px-10">
          <div className="relative z-10 md:w-[54%]" style={{ maxWidth: '38rem', paddingBlock: '5rem' }}>
            <span style={LABEL}>Learn · People &amp; roles</span>
            <h1 style={{
              fontFamily: "var(--font-body)",
              fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
              letterSpacing: '-.02em', fontWeight: 500,
              color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
            }}>
              Choosing your{' '}
              <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
                beneficiaries
              </em>
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
              Your beneficiaries are the people  -  and organisations  -  who receive your estate. Choosing them carefully, and expressing your intentions clearly, prevents ambiguity and disputes.
            </p>
            <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
              Australian law · 6 min read
            </p>
          </div>
          <EditorialBanner src="/images/learn/beneficiaries.jpg" alt="Three envelopes beside a teal estate document wallet" />
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>Who can be a beneficiary?</h2>
          <p style={BODY}>
            Almost anyone. A beneficiary can be a family member, a friend, a de facto partner, a charity, an organisation, or a business. There is no legal requirement that beneficiaries be related to you. Your estate is yours to distribute as you see fit  -  subject to the Family Provision claims rules, discussed below.
          </p>
          <p style={BODY}>
            Minor children can be named as beneficiaries, but assets cannot be distributed directly to them until they reach adulthood (18 in most states). In the meantime, the assets are held and managed by a trustee  -  usually your executor  -  until the child reaches the specified age.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Two ways to leave gifts: residual and specific</h2>
          <p style={BODY}>
            Most Wills divide the estate using one or both of these approaches:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', margin: '1.25rem 0 1.75rem' }}>
            {[
              {
                title: 'Residual gifts',
                body: 'A residual beneficiary receives a share  -  often a percentage  -  of whatever is left in your estate after debts and specific gifts are paid. "I leave 60% of my estate to my partner and 40% to my two children in equal shares" is a residual distribution. It adjusts automatically as the value of your estate changes.',
              },
              {
                title: 'Specific gifts',
                body: 'A specific gift is a particular item or a fixed sum: "I leave my car to my brother" or "I leave $10,000 to the Cancer Council." If the item no longer exists when you die, the gift typically lapses. If assets have changed significantly, a specific dollar amount may represent a very different proportion of your estate than you intended.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{ padding: '1.25rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}
              >
                <p style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: '.04em', color: 'var(--mkt-ink-text)', margin: '0 0 .5rem' }}>
                  {item.title}
                </p>
                <p style={{ ...BODY, fontSize: '.88rem', margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
          <p style={BODY}>
            Most estates use both: specific gifts for meaningful items or sums, and a residual clause that captures everything else.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Name a substitute beneficiary</h2>
          <p style={BODY}>
            What happens if a beneficiary dies before you? If you haven&#8217;t named a substitute, the gift typically lapses and falls back into the residual estate. For significant gifts, this may not be what you intended.
          </p>
          <p style={BODY}>
            A substitute (or alternate) beneficiary takes the gift if the primary beneficiary cannot. "I leave my estate to my partner; if they predecease me, to my children in equal shares" is a common and practical structure. Think through the second-order scenario when naming each beneficiary.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Family Provision claims</h2>
          <p style={BODY}>
            Australian law gives certain people the right to challenge a Will if they believe they were inadequately provided for. These are called Family Provision claims, and eligible claimants include spouses, de facto partners, children (including adult children), and in some states, other dependants.
          </p>
          <p style={BODY}>
            This does not mean you must leave something to every family member. But if you intentionally exclude a close family member  -  particularly a spouse, partner, or financially dependent child  -  there is a real risk of a claim against your estate after your death.
          </p>
          <blockquote style={CALLOUT}>
            If you have complex family circumstances  -  a prior relationship, step-children, an estrangement, a dependent adult child  -  a solicitor can advise on how to structure your Will to minimise the risk of a successful Family Provision claim. This is flagged in your Vault if relevant.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Leaving a gift to charity</h2>
          <p style={BODY}>
            Charitable bequests are common and straightforward to include. You can leave a fixed dollar amount, a percentage of your estate, or a specific asset to a registered charity. Use the charity&#8217;s full legal name and ABN where possible to avoid ambiguity.
          </p>
          <p style={BODY}>
            Charitable gifts are exempt from capital gains tax and do not attract income tax for the receiving organisation. They also reduce the taxable value of your estate in some circumstances  -  worth clarifying with an accountant if you are considering a significant bequest.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Identify your beneficiaries precisely</h2>
          <p style={BODY}>
            Use full legal names, not nicknames or descriptions. "My daughter" is vague; "Sarah Emma Thompson, born 14 March 1991" is unambiguous. The same applies to organisations: use the registered legal name, not a common shorthand.
          </p>
          <p style={BODY}>
            Include contact details or addresses where practical. Your executor will need to locate and notify each beneficiary when the time comes.
          </p>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/your-will', label: 'What makes a Will legally valid' },
                { href: '/learn/choosing-an-executor', label: 'Choosing an executor' },
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
            Name your beneficiaries in minutes
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            Heirloom&#8217;s guided questionnaire walks you through residual distributions, specific gifts, and charity bequests.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

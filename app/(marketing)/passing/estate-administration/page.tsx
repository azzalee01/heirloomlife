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

const STEPS = [
  {
    n: '01',
    title: 'Register the death and obtain a death certificate',
    body: 'A death must be registered with the Births, Deaths and Marriages registry of the relevant state or territory. In most cases, the funeral director handles this as part of their service. The death certificate is an official document required for almost every subsequent step  -  obtain multiple certified copies.',
  },
  {
    n: '02',
    title: 'Locate the original Will',
    body: 'Only the original signed Will carries full legal weight. A photocopy or digital version is not sufficient for probate. Common storage locations include: with a solicitor, in a safe at home, at the Public Trustee, or lodged with the Supreme Court registry (in some states). If the Will cannot be found, the estate may be treated as intestate.',
  },
  {
    n: '03',
    title: 'Notify immediate family and beneficiaries',
    body: 'Beneficiaries have a legal right to be informed that they are named in a Will, and to be told of the executor\'s intention to apply for probate. This notification does not require sharing the full terms of the Will at this stage.',
  },
  {
    n: '04',
    title: 'Apply for a Grant of Probate (or Letters of Administration)',
    body: 'Probate is the formal court process by which the Will is validated and the executor is authorised to administer the estate. The application is made to the Supreme Court of the relevant state. It requires the original Will, the death certificate, and an inventory of assets and liabilities. If there is no Will, Letters of Administration are required instead  -  a more complex process. After lodgment, there is typically a 14-day period for objections before the court processes the application.',
  },
  {
    n: '05',
    title: 'Identify and secure all assets',
    body: 'The executor must identify every asset in the estate: bank accounts, property titles, investments, superannuation (noting this sits outside the estate unless nominated to the estate), vehicles, and personal property. Accounts should be noted but not accessed until probate is granted. Property should be secured and insured.',
  },
  {
    n: '06',
    title: 'Pay outstanding debts',
    body: 'Before distributing anything to beneficiaries, all debts must be settled: mortgages, personal loans, credit cards, tax obligations, and any final expenses. Beneficiaries have no legal claim to estate assets until debts are fully satisfied. An executor who distributes assets before clearing debts can be held personally liable for any shortfall.',
  },
  {
    n: '07',
    title: 'Lodge final tax returns',
    body: 'A final income tax return must be lodged for the deceased for the period up to their death. If the estate earns income during administration (rent, dividends), a trust tax return may also be required. The ATO should be notified of the death.',
  },
  {
    n: '08',
    title: 'Distribute the estate to beneficiaries',
    body: 'Once debts and taxes are settled, assets are distributed according to the Will. Property is transferred; bank accounts are closed and proceeds distributed; specific items are delivered to the named recipients. Beneficiaries should receive a final accounting of how the estate was administered.',
  },
]

export default function EstateAdministrationPage() {
  return (
    <>
      <section style={{ paddingTop: '4rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <span style={LABEL}>Passing · After a death</span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
          }}>
            What happens to an estate{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
              after someone dies
            </em>
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
            Estate administration is the legal and practical process of settling a person&#8217;s affairs after they die. It typically falls to the executor named in the Will. Here is what that process involves.
          </p>
          <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
            Australian law · 8 min read
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>How long does it take?</h2>
          <p style={BODY}>
            A straightforward estate  -  modest assets, no disputes, clear Will  -  can be fully administered in three to six months. More complex estates, particularly those involving property, business interests, overseas assets, or contested claims, routinely take twelve months or longer.
          </p>
          <p style={BODY}>
            The probate process itself typically adds six to eight weeks from application to grant. Everything else  -  settling debts, transferring assets, resolving tax  -  happens before and after.
          </p>
          <blockquote style={CALLOUT}>
            An estate cannot be distributed to beneficiaries until debts are settled and probate is granted. During this period, beneficiaries often have no access to estate funds  -  even for urgent expenses.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>The eight stages of estate administration</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                style={{
                  display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '1.25rem',
                  paddingBlock: '1.75rem',
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--mkt-line)' : 'none',
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: '1.3rem', color: 'var(--teal)', fontStyle: 'italic', paddingTop: '.1rem' }}>
                  {step.n}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .5rem', letterSpacing: '-.01em' }}>
                    {step.title}
                  </h3>
                  <p style={{ ...BODY, margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>When is probate not required?</h2>
          <p style={BODY}>
            Not every estate needs a grant of probate. For small estates, or estates that consist primarily of jointly held assets (which pass automatically to the surviving owner), probate may be unnecessary. Many banks will release accounts up to a certain threshold without a formal grant  -  typically between $10,000 and $100,000 depending on the institution.
          </p>
          <p style={BODY}>
            Check with each institution directly. Where significant assets are involved, a grant of probate is almost always required and protects the executor from personal liability.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>What happens if there is no Will?</h2>
          <p style={BODY}>
            Without a valid Will, no executor has been appointed, and the estate must be administered under intestacy law. The next of kin  -  typically a spouse or adult child  -  must apply to the court for Letters of Administration, a more involved process than standard probate.
          </p>
          <p style={BODY}>
            The administrator has the same responsibilities as an executor but is bound by the intestacy formula rather than the deceased&#8217;s instructions. Who inherits, and in what proportions, is determined by law rather than by the person&#8217;s actual intentions.
          </p>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/choosing-an-executor', label: 'Choosing an executor' },
                { href: '/learn/intestacy', label: 'What happens without a Will' },
                { href: '/learn/your-will', label: 'What makes a Will legally valid' },
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
            Make it straightforward for your executor
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            A clear Will with a named executor removes almost every source of delay and uncertainty. Start yours today.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

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

export default function ExecutorPage() {
  return (
    <>
      <section style={{ paddingTop: '4rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <span style={LABEL}>Learn · People &amp; roles</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
          }}>
            Choosing an{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
              executor
            </em>
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
            Your executor is the person who carries out your Will. They handle everything from applying for probate to distributing your assets and settling your debts. It&#8217;s one of the most consequential appointments in your Will.
          </p>
          <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
            Australian law · 7 min read
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>What an executor actually does</h2>
          <p style={BODY}>
            An executor&#8217;s job begins at death and ends when the estate is fully distributed — a process that typically takes six to twelve months for straightforward estates, and longer for complex ones.
          </p>
          <p style={BODY}>
            The core tasks include: registering the death, locating the original Will, applying for a grant of probate, notifying banks and institutions, identifying all assets and liabilities, paying outstanding debts and taxes, and distributing what remains to beneficiaries according to your instructions.
          </p>
          <p style={BODY}>
            Along the way, an executor may need to manage property, deal with a business interest, handle family disagreements, and make judgment calls where your Will is ambiguous. They act in a fiduciary capacity — legally bound to prioritise the interests of the estate and its beneficiaries, not their own.
          </p>
          <blockquote style={CALLOUT}>
            An executor who mismanages an estate — delays distribution without good reason, favours some beneficiaries over others, or fails to pay outstanding debts before distributing assets — can be held personally liable.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>What to look for in an executor</h2>
          <p style={BODY}>
            There is no legal requirement to appoint a solicitor or financial professional. Most people appoint a trusted family member or close friend. What matters is not their background but their qualities.
          </p>

          {[
            {
              title: 'Trustworthiness',
              body: 'Your executor will have full access to your estate and financial information. The most important quality is someone your beneficiaries also trust — not just you.',
            },
            {
              title: 'Organisational ability',
              body: 'Estate administration involves paperwork, deadlines, correspondence with institutions, and sometimes contested beneficiaries. A capable executor keeps things moving.',
            },
            {
              title: 'Availability',
              body: 'Consider whether the person you have in mind has the time and mental bandwidth for this. Administering an estate on top of full-time work and family commitments is demanding. Many people appoint someone slightly older and established rather than a friend at the same life stage.',
            },
            {
              title: 'Impartiality',
              body: 'If your executor is also a beneficiary — common when a spouse or sibling is appointed — they must still act in the interests of all beneficiaries equally. This can be difficult in practice when family relationships are strained.',
            },
            {
              title: 'Willingness',
              body: 'Ask them before you appoint them. An executor can renounce the role after your death, but it creates delay and complications. Someone who has agreed in advance and understands broadly what is involved is far better prepared.',
            },
          ].map((item, i, arr) => (
            <div
              key={item.title}
              style={{
                paddingBlock: '1.5rem',
                borderBottom: i < arr.length - 1 ? '1px solid var(--mkt-line)' : 'none',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .45rem' }}>
                {item.title}
              </h3>
              <p style={{ ...BODY, margin: 0 }}>{item.body}</p>
            </div>
          ))}

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Can you appoint more than one executor?</h2>
          <p style={BODY}>
            Yes. You can name co-executors who act jointly, or an alternate executor who steps in if your first choice is unable or unwilling to act. Both are worth considering.
          </p>
          <p style={BODY}>
            Co-executors must agree on decisions, which can slow things down if they disagree. Naming one primary executor and one alternate is often simpler. The alternate takes over automatically if the first is deceased, incapacitated, or formally renounces the role.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Personal executor vs professional executor</h2>
          <p style={BODY}>
            Some people appoint a professional — a solicitor or trustee company — as their executor, either as the primary appointee or alongside a family member.
          </p>
          <p style={BODY}>
            A professional executor brings experience, impartiality, and no emotional involvement. They are useful when family relationships are complicated, when the estate is large or complex, or when there is no obvious personal candidate. The cost is typically charged against the estate — often between 1% and 3% of the estate&#8217;s value plus hourly rates.
          </p>
          <p style={BODY}>
            A personal executor pays no fee (though they are entitled to claim reasonable out-of-pocket expenses) and often has better practical knowledge of your family and intentions. The tradeoff is that they may lack experience in probate procedures and be more affected emotionally by the process.
          </p>
          <p style={BODY}>
            Many estates are best served by a personal executor supported by a solicitor engaged to handle the probate application — combining trust with expertise without committing to full professional executor fees.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>The conversation you need to have</h2>
          <p style={BODY}>
            Naming someone as your executor without telling them is a poor plan. Beyond common courtesy, an unprepared executor may not know where your Will is, what your assets are, or who your beneficiaries are — information that becomes urgently needed at an already difficult time.
          </p>
          <p style={BODY}>
            A straightforward conversation is all it takes: tell them you&#8217;ve named them, where your Will is kept, and broadly what your estate looks like. You don&#8217;t need to share every detail. A brief conversation now prevents months of confusion later.
          </p>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/your-will', label: 'What makes a Will legally valid' },
                { href: '/learn/beneficiaries', label: 'Choosing your beneficiaries' },
                { href: '/passing/estate-administration', label: 'What happens after someone dies' },
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
            Name your executor in minutes
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            Heirloom guides you through appointing an executor and alternate as part of your Will questionnaire.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

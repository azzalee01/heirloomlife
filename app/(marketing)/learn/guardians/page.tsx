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

export default function GuardiansPage() {
  return (
    <>
      <section style={{ paddingTop: '4rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <span style={LABEL}>Learn · People &amp; roles</span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
          }}>
            Appointing a{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
              guardian
            </em>{' '}
            for your children
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
            If both parents die while a child is still a minor, a guardian takes on legal responsibility for their care. Your Will is where you record who that person should be. Without it, a court decides.
          </p>
          <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: 'var(--mkt-stone-soft)' }}>
            Australian law · 6 min read
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">

          <h2 style={H2}>What a guardian appointment means</h2>
          <p style={BODY}>
            A testamentary guardian  -  one named in a Will  -  is appointed to take on parental responsibility for minor children if both legal parents die. That means day-to-day care, decisions about education, healthcare, living arrangements, and the child&#8217;s general welfare.
          </p>
          <p style={BODY}>
            The appointment only applies to children who are under 18 at the time of both parents&#8217; deaths. Once a child turns 18, the appointment has no further effect.
          </p>
          <p style={BODY}>
            It is also worth knowing that a testamentary guardian is separate from the executor of your estate. The executor manages your financial affairs; the guardian manages your children. You can appoint the same person to both roles, or different people  -  what matters is who is best suited to each task.
          </p>
          <blockquote style={CALLOUT}>
            A guardian does not automatically control your children&#8217;s inheritance. Assets left for minor children are typically held by a trustee  -  often the executor  -  until the children reach a specified age.
          </blockquote>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>What happens without a guardian named</h2>
          <p style={BODY}>
            If neither parent named a guardian, or if there is no valid Will at all, any person  -  a grandparent, an aunt, a family friend  -  can apply to the Family Court for guardianship. The court will decide based on the child&#8217;s best interests, which may or may not align with what you would have chosen.
          </p>
          <p style={BODY}>
            In the worst case, if no suitable family member comes forward, a child may be placed in state care temporarily while the court process resolves. This is rare, but the risk alone is worth avoiding with a clearly named guardian.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>How to choose the right person</h2>
          <p style={BODY}>
            This is one of the hardest decisions in a Will  -  and the one most people delay because of it. There is no perfect candidate. Focus on what your child needs, not what feels fair between competing family members.
          </p>

          {[
            {
              title: 'Shared values and approach to life',
              body: 'The guardian will raise your child in their household, with their beliefs, routines, and priorities. Consider whether their approach to education, religion, and family life aligns broadly with yours.',
            },
            {
              title: 'Capacity to take on the role',
              body: 'A willing grandparent may be the obvious choice emotionally, but consider their age, health, and energy levels over the next decade. A sibling with young children of their own may be better placed practically.',
            },
            {
              title: 'Geographic stability',
              body: 'Uprooting a child to a different city or country adds difficulty to an already traumatic situation. A guardian who lives nearby  -  or who is willing to stay  -  reduces disruption.',
            },
            {
              title: 'Relationship with your children',
              body: 'The best guardian is someone your children already know and trust. A person they see rarely, however well-meaning, will take longer to provide the stability a child needs.',
            },
            {
              title: 'Their own willingness',
              body: 'Like an executor, a guardian should know they\'ve been named and have agreed. This is not a decision to make unilaterally.',
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

          <h2 style={H2}>Can you name more than one guardian?</h2>
          <p style={BODY}>
            Yes  -  you can name joint guardians (a couple, for instance) or a primary guardian with an alternate in case the first is unable to act. Joint guardians must make decisions together, which works well for couples but can create conflict between two individuals.
          </p>
          <p style={BODY}>
            You can also include a letter of wishes alongside your Will  -  a separate, non-binding document that shares your hopes for how your child is raised, what values you want them to hold, and any specific preferences around schooling or faith. This letter has no legal weight, but a good guardian will want it.
          </p>

          <div style={{ height: 1, background: 'var(--mkt-line)', margin: '2.5rem 0' }} />

          <h2 style={H2}>Financial provision for your children</h2>
          <p style={BODY}>
            Naming a guardian answers the question of who cares for your children. A separate question is whether they have the financial means to do so.
          </p>
          <p style={BODY}>
            Your Will can establish a testamentary trust that holds assets for your children until they reach a specified age. The trustee manages and distributes funds for the child&#8217;s benefit in the meantime. This keeps assets protected and ensures the guardian has resources to draw on.
          </p>
          <p style={BODY}>
            Life insurance is another tool worth considering: a policy that names your children&#8217;s testamentary trust as beneficiary can provide a lump sum that covers the costs of their upbringing regardless of what else is in your estate.
          </p>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 1rem' }}>
              Related guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { href: '/learn/your-will', label: 'What makes a Will legally valid' },
                { href: '/learn/choosing-an-executor', label: 'Choosing an executor' },
                { href: '/learn/when-to-update', label: 'When to update your Will' },
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
            Your child deserves a named guardian
          </h2>
          <p style={{ fontSize: '.95rem', color: 'var(--mkt-stone)', margin: '0 0 2rem' }}>
            Write your Will in minutes. Guardian appointments are part of the standard questionnaire.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
          </Link>
        </div>
      </section>
    </>
  )
}

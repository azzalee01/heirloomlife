import Image from 'next/image'
import Link from 'next/link'
import EditorialBanner from '@/components/marketing/EditorialBanner'

const LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

const ARTICLES = [
  {
    category: 'Will fundamentals',
    items: [
      {
        href: '/learn/your-will',
        image: '/images/learn/your-will.jpg',
        imageAlt: 'A Will document and fountain pen in a teal folder',
        title: 'What is a Will  -  and what makes it legally valid?',
        summary: 'The five requirements every Australian Will must meet, what a Will can and cannot cover, and when it becomes invalid.',
      },
      {
        href: '/learn/intestacy',
        image: '/images/learn/intestacy.jpg',
        imageAlt: 'A family table with an estate document folder',
        title: 'What happens to your estate without a Will',
        summary: 'How intestacy law distributes assets when there is no valid Will, who misses out entirely, and the practical cost for the people you leave behind.',
      },
      {
        href: '/learn/when-to-update',
        image: '/images/learn/when-to-update.jpg',
        imageAlt: 'Life-event keepsakes arranged beside an open planner',
        title: 'When to update your Will',
        summary: 'The life events that require a Will update  -  some urgently  -  and how to make changes without starting from scratch.',
      },
    ],
  },
  {
    category: 'People & roles',
    items: [
      {
        href: '/learn/choosing-an-executor',
        image: '/images/learn/choosing-an-executor.jpg',
        imageAlt: 'Two trusted people reviewing estate documents together',
        title: 'Choosing an executor',
        summary: 'What an executor actually does, what qualities matter, and how to have the conversation before you name someone.',
      },
      {
        href: '/learn/guardians',
        image: '/images/learn/guardians.jpg',
        imageAlt: 'An adult and child walking hand in hand through a garden',
        title: 'Appointing a guardian for your children',
        summary: 'What a guardian appointment means legally, how courts decide without one, and how to choose the right person.',
      },
      {
        href: '/learn/beneficiaries',
        image: '/images/learn/beneficiaries.jpg',
        imageAlt: 'Three envelopes beside a teal estate document wallet',
        title: 'Choosing your beneficiaries',
        summary: 'Residual gifts vs specific bequests, naming substitutes, Family Provision claims, and leaving a gift to charity.',
      },
    ],
  },
  {
    category: 'Assets',
    items: [
      {
        href: '/learn/superannuation',
        image: '/images/learn/superannuation.jpg',
        imageAlt: 'Retirement documents, glasses and a calculator on a desk',
        title: 'Superannuation and your estate',
        summary: 'Why super sits outside your Will, what a Binding Death Nomination does, the three-year renewal trap, and who you can nominate.',
      },
    ],
  },
]

export default function LearnPage() {
  return (
    <>
      <section style={{ background: 'var(--mkt-surface-2)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }} className="relative md:flex md:min-h-[28rem] md:items-center md:px-10">
          <div className="relative z-10 md:w-[54%]" style={{ maxWidth: '38rem', paddingBlock: '4rem 5rem' }}>
            <span style={LABEL}>Learn</span>
            <h1 style={{
              fontFamily: "var(--font-body)",
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
              letterSpacing: '-.02em', fontWeight: 500,
              color: 'var(--mkt-ink-text)', margin: 0,
            }}>
              Australian estate law,{' '}
              <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
                plainly written
              </em>
            </h1>
            <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
              Guides covering Will fundamentals, life-stage planning, and the people and roles in your estate plan. No jargon, no generic advice  -  Australian law specific.
            </p>
          </div>
          <EditorialBanner src="/images/editorial/learn.jpg" alt="An approachable estate-planning reading and workspace" />
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {ARTICLES.map((group) => (
              <div key={group.category}>
                <p style={{ ...LABEL, marginBottom: '1.5rem' }}>{group.category}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'var(--mkt-line)', border: '1px solid var(--mkt-line)' }}>
                  {group.items.map((article) => (
                    <Link
                      key={article.href}
                      href={article.href}
                      style={{
                        display: 'flex', flexDirection: 'column', textDecoration: 'none',
                        background: '#fff',
                        transition: 'background 120ms',
                      }}
                      className="hover:bg-[var(--mkt-surface)]"
                    >
                      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--mkt-surface-2)' }}>
                        <Image src={article.image} alt={article.imageAlt} fill sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw" style={{ objectFit: 'cover' }} />
                        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 58%, rgba(14, 44, 42, .12) 100%)' }} />
                      </div>
                      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '1.5rem 1.75rem 1.75rem' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .6rem', lineHeight: 1.35, letterSpacing: '-.01em' }}>
                          {article.title}
                        </h2>
                        <p style={{ fontSize: '.88rem', lineHeight: 1.6, color: 'var(--mkt-stone)', margin: '0 0 1rem' }}>
                          {article.summary}
                        </p>
                        <span style={{ marginTop: 'auto', fontSize: '.85rem', color: 'var(--teal-deep)', fontWeight: 500 }}>
                          Read →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Passing section link */}
          <div style={{ marginTop: '4rem', padding: '2rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <span style={{ ...LABEL, marginBottom: '.5rem' }}>Passing</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .6rem', letterSpacing: '-.01em' }}>
              Guides for after a death
            </h2>
            <p style={{ fontSize: '.92rem', lineHeight: 1.6, color: 'var(--mkt-stone)', margin: '0 0 1.25rem', maxWidth: '36rem' }}>
              Estate administration, probate, and what families and executors need to know when navigating what comes after  -  kept in a separate section.
            </p>
            <Link href="/passing" style={{ fontSize: '.93rem', color: 'var(--teal-deep)', textDecoration: 'none', fontWeight: 500 }}>
              Browse Passing guides →
            </Link>
          </div>
        </div>
      </section>

      <section style={{ paddingBlock: '5rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 1.5rem' }}>
            Ready to write your Will?
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/start" className="mkt-btn-ink-l">
              Start your Will
            </Link>
            <Link href="/how-it-works" className="mkt-btn-ghost-l">
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

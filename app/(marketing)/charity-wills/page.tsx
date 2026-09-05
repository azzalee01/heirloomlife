import Link from 'next/link'
import EditorialBanner from '@/components/marketing/EditorialBanner'

const W: React.CSSProperties = { maxWidth: 1100, marginInline: 'auto', paddingInline: '1.5rem' }

export const metadata = {
  title: 'Charity-sponsored Wills — Heirloom Life',
  description: 'Create a $0 charity-sponsored Will when you include an eligible charitable gift, or choose a standard paid Heirloom Will.',
}

export default function CharityWillsPage() {
  return (
    <>
        <section style={{ paddingBlock: '7rem 5.5rem', background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)' }}>
          <div className="md:px-10" style={W}>
            <p style={{ margin: 0, color: 'var(--teal-deep)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>Charity-sponsored Wills</p>
            <h1 style={{ margin: '1.25rem 0 0', maxWidth: '48rem', fontFamily: "var(--font-display)", fontSize: 'clamp(2.7rem, 5.5vw, 5rem)', lineHeight: 1.02, fontWeight: 400, color: 'var(--mkt-ink-text)' }}>Leave something meaningful behind—and receive your Will for <em style={{ color: 'var(--teal-deep)', fontWeight: 400 }}>$0</em>.</h1>
            <p style={{ margin: '1.5rem 0 0', maxWidth: '36rem', fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>Include a gift to an eligible registered charity and the cost of your standard Will is sponsored. Prefer not to include a gift? Choose $129 once with three months of Vault benefits, or $99 a year with your Will and continuing membership included.</p>
            <div style={{ marginTop: '2.25rem', display: 'flex', gap: '.85rem', flexWrap: 'wrap' }}>
              <Link href="/start?path=sponsored" className="mkt-btn-ink-l">Start a sponsored Will</Link>
              <Link href="/pricing" className="mkt-btn-ghost-l">Compare paid options</Link>
            </div>
            <EditorialBanner src="/images/editorial/charity-wills.jpg" alt="Two generations planting a native seedling together" />
          </div>
        </section>

        <section style={{ paddingBlock: '5rem', background: '#fff' }}>
          <div className="md:px-10 md:grid-cols-3" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {[
              ['1', 'Plan before choosing', 'Complete the guided questions and review the people, assets and wishes in your estate plan.'],
              ['2', 'Include a charity', 'Name an eligible registered charity, provide its ABN and choose a positive share that reflects your intentions.'],
              ['3', 'Complete for $0', 'A valid-format ABN and positive charitable share unlock the sponsored path. Campaign eligibility conditions may also apply.'],
            ].map(([number, title, body]) => (
              <div key={number} style={{ border: '1px solid var(--mkt-line)', borderRadius: 12, padding: '1.75rem', background: 'var(--mkt-surface)' }}>
                <span style={{ display: 'flex', width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 7, background: 'var(--teal)', color: '#fff', fontSize: '.75rem', fontWeight: 700 }}>{number}</span>
                <h2 style={{ margin: '1rem 0 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{title}</h2>
                <p style={{ margin: '.65rem 0 0', fontSize: '.86rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingBlock: '5rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
          <div className="md:px-10 lg:grid-cols-2" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
            <div>
              <p style={{ margin: '0 0 1rem', color: 'var(--teal-deep)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>Built around your choice</p>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: '2.4rem', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>Your Will remains your decision.</h2>
              <p style={{ margin: '1rem 0 0', fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>The sponsored price is conditional, but the testamentary choices remain yours. Heirloom does not select a charity or gift percentage for you. The charity does not see your Will or family beneficiaries through this process.</p>
            </div>
            <div style={{ borderLeft: '2px solid var(--teal)', paddingLeft: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>Participating-charity campaigns are being introduced progressively. The platform validates ABN format; campaign terms may apply once a charity partner is formally onboarded.</p>
              <p style={{ margin: '1rem 0 0', fontSize: '.78rem', lineHeight: 1.6, color: 'var(--mkt-stone-soft)' }}>Heirloom provides a structured self-service process, not personal legal advice. Complex circumstances may require a solicitor.</p>
            </div>
          </div>
        </section>
    </>
  )
}

import Link from 'next/link'
import EditorialBanner from '@/components/marketing/EditorialBanner'

const W: React.CSSProperties = { maxWidth: 1100, marginInline: 'auto', paddingInline: '1.5rem' }
const LABEL: React.CSSProperties = {
  margin: 0, color: 'var(--teal-deep)', fontSize: '.72rem',
  fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
}

export const metadata = {
  title: 'Leave a gift to charity in your Will — Heirloom Life',
  description: 'Include a charitable gift in your Will and leave something meaningful behind. Heirloom makes it straightforward to name a charity as part of your estate plan.',
}

export default function CharityWillsPage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--mkt-surface-2)', borderBottom: '1px solid var(--mkt-line)', overflow: 'hidden' }}>
        <div className="relative md:flex md:min-h-[34rem] md:items-center md:px-10" style={W}>
          <div className="relative z-10 md:w-[55%]" style={{ paddingBlock: '7rem 5.5rem' }}>
            <p style={LABEL}>Charitable giving</p>
            <h1 style={{ margin: '1.25rem 0 0', maxWidth: '48rem', fontFamily: "var(--font-display)", fontSize: 'clamp(2.7rem, 5.5vw, 5rem)', lineHeight: 1.02, fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
              Leave a gift to charity in your{' '}
              <em style={{ color: 'var(--teal-deep)', fontWeight: 400 }}>Will</em>.
            </h1>
            <p style={{ margin: '1.5rem 0 0', maxWidth: '36rem', fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
              A charitable gift in your Will is one of the most considered acts of generosity available to you. Heirloom makes it straightforward to include a cause you care about alongside the people you love.
            </p>
            <div style={{ marginTop: '2.25rem', display: 'flex', gap: '.85rem', flexWrap: 'wrap' }}>
              <Link href="/start" className="mkt-btn-ink-l">Start your Will</Link>
              <Link href="/pricing" className="mkt-btn-ghost-l">See pricing</Link>
            </div>
          </div>
          <EditorialBanner src="/images/editorial/charity-wills.jpg" alt="Two generations planting a native seedling together" />
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: '#fff' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720, marginBottom: '3rem' }}>
          <p style={LABEL}>How it works</p>
          <h2 style={{ margin: '1rem 0 0', fontFamily: "var(--font-display)", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
            Name a charity the same way you name any beneficiary.
          </h2>
        </div>
        <div className="md:px-10 md:grid-cols-3" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {[
            ['1', 'Draft your Will', 'Work through the guided questions at your own pace. Cover your executors, guardians, specific gifts, and the people who matter most.'],
            ['2', 'Add a charitable beneficiary', 'In the residuary estate step, name a registered charity alongside your family. Set the share that feels right to you - you stay in control.'],
            ['3', 'Download when ready', 'Pay once to receive your solicitor-reviewed, signed-ready Will. Your charitable gift is part of it - no separate process required.'],
          ].map(([number, title, body]) => (
            <div key={number} style={{ border: '1px solid var(--mkt-line)', borderRadius: 12, padding: '1.75rem', background: 'var(--mkt-surface)' }}>
              <span style={{ display: 'flex', width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 7, background: 'var(--teal)', color: '#fff', fontSize: '.75rem', fontWeight: 700 }}>{number}</span>
              <h3 style={{ margin: '1rem 0 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{title}</h3>
              <p style={{ margin: '.65rem 0 0', fontSize: '.86rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why it matters ─────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10 lg:grid-cols-2" style={{ ...W, display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <p style={LABEL}>Why people do it</p>
            <h2 style={{ margin: '1rem 0 0', fontFamily: "var(--font-display)", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
              A final act that reflects what you stood for.
            </h2>
            <p style={{ margin: '1.25rem 0 0', fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', maxWidth: '32rem' }}>
              Many people find that writing a Will prompts them to think seriously about what they want to leave behind - not just for family, but for the world. A gift to a cause you care about is a way of making that intention permanent.
            </p>
            <p style={{ margin: '1rem 0 0', fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', maxWidth: '32rem' }}>
              It doesn&apos;t need to be large. A small percentage of an estate, multiplied across many Wills, can have a meaningful impact on the organisations that depend on bequest income.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              ['Your choices remain yours', 'Heirloom does not select a charity or suggest a share. You name the cause and set the percentage that feels right.'],
              ['It sits alongside your family', 'A charitable gift is a share of your residuary estate. Your family beneficiaries are named in the same clause - there is no conflict.'],
              ['It is legally recognised', 'A bequest to a registered charity is a standard testamentary gift, treated the same way as any other beneficiary gift under Australian law.'],
            ].map(([title, body]) => (
              <div key={title} style={{ borderLeft: '2px solid var(--teal)', paddingLeft: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{title}</p>
                <p style={{ margin: '.4rem 0 0', fontSize: '.85rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 600, textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--mkt-ink-text)' }}>
            Start for free. Add a charity when you&apos;re ready.
          </h2>
          <p style={{ margin: '1.25rem 0 2rem', fontSize: '1rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Draft your complete Will at your own pace. The charitable beneficiary step is part of the standard guided process - no separate form, no extra cost.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">Start your Will</Link>
          <p style={{ marginTop: '1.1rem', fontSize: '.78rem', color: 'var(--mkt-stone-soft)' }}>
            Free to draft. Pay $129 to download your solicitor-reviewed Will.
          </p>
        </div>
      </section>

      {/* ── For charities crosslink ─────────────────────────────────────────── */}
      <section style={{ paddingBlock: '3.5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 700, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>Are you a charity?</p>
            <p style={{ margin: '.35rem 0 0', fontSize: '.85rem', lineHeight: 1.6, color: 'var(--mkt-stone)' }}>
              Learn how Heirloom can help grow your bequest program.
            </p>
          </div>
          <Link href="/for-charities" className="mkt-btn-ghost-l" style={{ whiteSpace: 'nowrap' }}>
            For charities
          </Link>
        </div>
      </section>

    </>
  )
}

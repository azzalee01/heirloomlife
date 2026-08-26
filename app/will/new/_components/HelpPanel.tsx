import type { WizardStepId } from '../_types'

interface HelpItem {
  type: 'tip' | 'definition' | 'guide'
  title: string
  body: string
}

const HELP: Partial<Record<string, HelpItem[]>> = {
  eligibility: [
    { type: 'guide', title: 'Why state matters', body: 'Will law is state-based in Australia. Each state has its own requirements for valid execution — we localise your document to the rules that apply to you.' },
    { type: 'tip', title: 'NSW & VIC at launch', body: "We're starting with NSW and VIC, where we've completed our legal template review. More states are being added — join the waitlist if yours isn't listed yet." },
  ],
  personal: [
    { type: 'definition', title: 'Testator', body: "That's you — the person making the Will. The Will speaks from your perspective and is legally yours alone." },
    { type: 'tip', title: 'Use your legal name', body: 'Enter the name on your official ID (passport or driver\'s licence). Any alias or maiden name can be noted in the document, but the primary name must match your legal identity.' },
    { type: 'guide', title: 'Previous wills', body: 'Your new Will automatically revokes any earlier ones once properly executed. Still, if you know where an old Will is kept, noting its location helps your executor confirm it has been superseded.' },
  ],
  spouse: [
    { type: 'tip', title: 'Separate Wills are standard', body: 'Even if you and your partner intend to leave everything to each other, you each need your own Will. Mutual or joint Wills create legal complications and are rarely advisable.' },
    { type: 'definition', title: 'De facto partner', body: 'Australian law recognises de facto relationships (including same-sex partnerships) in inheritance. Select "domestic partner" if you\'ve been living together in a genuine domestic relationship, regardless of whether you\'ve formalised it.' },
  ],
  children: [
    { type: 'definition', title: 'Dependent child', body: 'A child who relies on you financially — typically anyone under 18, or an adult child still in full-time education or with a disability. A dependent child\'s inheritance is usually held in trust until they reach a specified age.' },
    { type: 'guide', title: 'Testamentary trust for minors', body: 'Rather than an outright gift (which can\'t be paid to a minor), you set an age at which the funds vest — 18, 21, or 25. A trustee (usually your executor) manages the funds in the meantime.' },
    { type: 'tip', title: 'Naming a guardian', body: 'The guardian you name is a statement of your wishes — the court still makes the final decision, but a clearly expressed preference carries significant weight. Choose someone who shares your values and has the practical means to care for your children.' },
  ],
  executors: [
    { type: 'definition', title: 'Executor', body: 'The person responsible for carrying out your Will — collecting assets, paying debts, distributing the estate, and dealing with probate. It\'s an administrative role, not a legal or financial qualification.' },
    { type: 'tip', title: 'Who to choose', body: 'Pick someone organised, trustworthy, and younger than you. They don\'t need legal knowledge — they\'ll hire professionals as needed. Your spouse or an adult child is common; a professional trustee company is an alternative if your family dynamics are complex.' },
    { type: 'guide', title: 'Why you need a backup', body: 'If your primary executor is unwilling or unable to act, the court appoints a substitute — which takes time and costs money. Naming an alternate yourself means your estate can be administered immediately.' },
  ],
  assets: [
    { type: 'definition', title: 'Residual estate', body: 'Everything you own that isn\'t dealt with by a specific gift or by a binding nomination elsewhere. This is what gets divided between your beneficiaries according to the percentages you set.' },
    { type: 'guide', title: 'Super & life insurance pass outside your Will', body: 'Superannuation and life insurance go to whoever you\'ve nominated with the fund or insurer — your Will doesn\'t control them. If you haven\'t made a binding death benefit nomination, the trustee has discretion. Check your nominations separately.' },
    { type: 'definition', title: 'Joint tenancy', body: 'If you own property as joint tenants, your share passes automatically to the surviving owner(s) — it doesn\'t form part of your estate and can\'t be directed by your Will. Tenants in common is different: each owner\'s share forms part of their estate.' },
  ],
  beneficiaries: [
    { type: 'definition', title: 'Residual estate', body: 'The balance of your estate after debts, funeral expenses, taxes, and specific gifts have been paid. Your beneficiary percentages divide this remainder.' },
    { type: 'definition', title: 'Backup beneficiary', body: 'If a beneficiary doesn\'t survive you by the survivorship period (typically 30 days), their share needs somewhere to go. The next screen will ask you to name a backup for each person.' },
    { type: 'tip', title: 'Percentages must total 100%', body: 'The bar below shows your running total. You can\'t proceed until the percentages add up to exactly 100%. Small rounding differences (e.g. 33/33/34) are perfectly valid.' },
  ],
  gifts: [
    { type: 'definition', title: 'Specific gift', body: 'A particular item or cash sum left to a named person, separate from the main estate division. Common examples: a piece of jewellery to a sibling, $5,000 to a friend, a car to an adult child.' },
    { type: 'guide', title: 'What if the asset no longer exists?', body: 'If you leave a specific item that you\'ve sold or given away before you die, the gift simply fails — the recipient gets nothing extra from the residue. This is called ademption. If you want to protect against it, a cash gift is safer than leaving a specific object.' },
    { type: 'tip', title: 'Keep the residue intact', body: 'Specific gifts are paid first, before the residue is divided. Very large specific gifts can significantly reduce what\'s left for your main beneficiaries. Consider whether a percentage share might serve your intentions better.' },
  ],
  wishes: [
    { type: 'definition', title: 'Survivorship period', body: 'A buffer that prevents double-administration if you and a beneficiary die close together. If the beneficiary doesn\'t outlive you by this many days, their share passes to their backup instead.' },
    { type: 'guide', title: 'Right to reside', body: 'Common in blended families: you give a partner the right to live in your home for their lifetime (or until they remarry), after which the property passes to your children. The life tenant can\'t sell the property without the remainder beneficiary\'s consent.' },
    { type: 'tip', title: 'Overseas assets', body: 'An Australian Will can reference overseas assets, but it may not be recognised or sufficient for probate in another jurisdiction. Flag overseas holdings here so your executor knows to take local legal advice for each country.' },
  ],
  review: [
    { type: 'guide', title: 'What happens next', body: 'Download your Will — then sign it in the presence of two witnesses (both present at the same time, neither a beneficiary). NSW members can use Heirloom\'s remote AV witness pool. Once signed, store the original somewhere safe and tell your executor where it is.' },
    { type: 'tip', title: 'Review every few years', body: 'Your Will should reflect your current life. Key trigger events: marriage (revokes a previous Will in most states), divorce, new children, significant change in assets, or the death of a named person.' },
    { type: 'definition', title: 'Pending review', body: 'Your Will\'s status shows "under review" until our legal team confirms the document is coherent and complete. This is a drafting check, not legal advice — your solicitor review (if you\'ve added it) is a separate step.' },
  ],
}

function getHelpForStep(stepId: WizardStepId): HelpItem[] {
  if (typeof stepId === 'string' && stepId.startsWith('backup_')) {
    return [
      { type: 'definition', title: 'Lapse fallback', body: 'If a beneficiary dies before you (or within the survivorship period), their share "lapses". You need to say who should receive it instead — otherwise a court will decide.' },
      { type: 'guide', title: 'Options', body: '"Their children equally" is the most common choice. "My other beneficiaries, pro-rata" keeps your existing split intact. Or you can name a specific person — useful if the beneficiary is your only child and you want the share to go elsewhere.' },
      { type: 'tip', title: 'Testamentary trust for minors', body: 'If a backup beneficiary is or might be under 18, their share will be held in trust until the vesting age you set. No further action required — the Will handles it automatically.' },
    ]
  }
  return HELP[stepId] ?? []
}

const TYPE_CONFIG = {
  tip: { label: 'Tip', color: 'var(--teal)', bg: 'rgba(42,180,174,0.06)' },
  definition: { label: 'Definition', color: '#6366f1', bg: 'rgba(99,102,241,0.06)' },
  guide: { label: 'Guide', color: '#0ea5e9', bg: 'rgba(14,165,233,0.06)' },
}

export default function HelpPanel({ stepId }: { stepId: WizardStepId }) {
  const items = getHelpForStep(stepId)
  if (items.length === 0) return null

  return (
    <aside className="space-y-3" aria-label="Helpful information">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
        Helpful notes
      </p>
      {items.map((item, i) => {
        const cfg = TYPE_CONFIG[item.type]
        return (
          <div
            key={i}
            className="px-4 py-3 space-y-1 border-l-2"
            style={{ borderColor: cfg.color, background: cfg.bg }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                style={{ color: cfg.color, background: `${cfg.bg}` }}
              >
                {cfg.label}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{item.title}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>{item.body}</p>
          </div>
        )
      })}
    </aside>
  )
}

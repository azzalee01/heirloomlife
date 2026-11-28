/**
 * The Will-wizard path matrix: combinations are GENERATED, not hand-written.
 *
 * `allCombos()` is the full nightly matrix; `smokeCombos()` is the ~10-combo subset that
 * runs on every PR. `willAssertions(text)` holds the section-4 checks every generated
 * Will must satisfy. `fillWill(page, combo)` is the step-walker the spec drives.
 */

export interface WizardCombo {
  state: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT'
  relationship: 'single' | 'married' | 'domestic_partner' | 'separated' | 'widowed'
  children: 'none' | 'adult' | 'minor' | 'mixed'
  assetOwnership: 'sole' | 'joint_tenants' | 'tenants_in_common' | 'entity'
  overseasAsset: boolean
  beneficiaries: 'one' | 'several' | 'minor' | 'charity'
  gifts: 'none' | 'one' | 'several'
  executors: 'sole' | 'joint' | 'substitute'
  trustWishes: boolean
}

const STATES: WizardCombo['state'][] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']
const RELATIONSHIPS: WizardCombo['relationship'][] = ['single', 'married', 'domestic_partner', 'separated', 'widowed']
const CHILDREN: WizardCombo['children'][] = ['none', 'adult', 'minor', 'mixed']
const OWNERSHIP: WizardCombo['assetOwnership'][] = ['sole', 'joint_tenants', 'tenants_in_common', 'entity']
const BENEFICIARIES: WizardCombo['beneficiaries'][] = ['one', 'several', 'minor', 'charity']
const GIFTS: WizardCombo['gifts'][] = ['none', 'one', 'several']
const EXECUTORS: WizardCombo['executors'][] = ['sole', 'joint', 'substitute']

/** Full matrix (deduplicated by the dimensions that matter per axis). */
export function allCombos(): WizardCombo[] {
  const out: WizardCombo[] = []
  for (const state of STATES)
    for (const relationship of RELATIONSHIPS)
      for (const children of CHILDREN)
        for (const assetOwnership of OWNERSHIP)
          for (const overseasAsset of [false, true])
            for (const beneficiaries of BENEFICIARIES)
              for (const gifts of GIFTS)
                for (const executors of EXECUTORS)
                  out.push({ state, relationship, children, assetOwnership, overseasAsset, beneficiaries, gifts, executors, trustWishes: children === 'minor' })
  return out
}

/** ~10 representative combos for the per-PR smoke run. */
export function smokeCombos(): WizardCombo[] {
  return [
    { state: 'NSW', relationship: 'single', children: 'none', assetOwnership: 'sole', overseasAsset: false, beneficiaries: 'one', gifts: 'none', executors: 'sole', trustWishes: false },
    { state: 'NSW', relationship: 'married', children: 'minor', assetOwnership: 'joint_tenants', overseasAsset: false, beneficiaries: 'several', gifts: 'one', executors: 'substitute', trustWishes: true },
    { state: 'VIC', relationship: 'married', children: 'mixed', assetOwnership: 'tenants_in_common', overseasAsset: false, beneficiaries: 'charity', gifts: 'several', executors: 'joint', trustWishes: true },
    { state: 'QLD', relationship: 'domestic_partner', children: 'adult', assetOwnership: 'sole', overseasAsset: false, beneficiaries: 'one', gifts: 'none', executors: 'sole', trustWishes: false },
    { state: 'WA', relationship: 'married', children: 'none', assetOwnership: 'sole', overseasAsset: false, beneficiaries: 'several', gifts: 'one', executors: 'substitute', trustWishes: false }, // WA + partner → review flag
    { state: 'SA', relationship: 'widowed', children: 'adult', assetOwnership: 'entity', overseasAsset: false, beneficiaries: 'one', gifts: 'none', executors: 'sole', trustWishes: false }, // entity → solicitor gate
    { state: 'TAS', relationship: 'separated', children: 'none', assetOwnership: 'sole', overseasAsset: true, beneficiaries: 'one', gifts: 'none', executors: 'sole', trustWishes: false }, // overseas → solicitor gate
    { state: 'ACT', relationship: 'single', children: 'minor', assetOwnership: 'sole', overseasAsset: false, beneficiaries: 'minor', gifts: 'none', executors: 'substitute', trustWishes: true },
    { state: 'NT', relationship: 'married', children: 'mixed', assetOwnership: 'joint_tenants', overseasAsset: false, beneficiaries: 'several', gifts: 'several', executors: 'joint', trustWishes: true },
    { state: 'VIC', relationship: 'single', children: 'none', assetOwnership: 'entity', overseasAsset: false, beneficiaries: 'charity', gifts: 'one', executors: 'sole', trustWishes: false },
  ]
}

/**
 * Section-4 Will assertions. Pure string checks so they can run against the generated
 * document text in the spec. (The deeper DB checks — clause status='production',
 * minor_vesting_age matches the text, needs_review flags — are asserted in the spec
 * against the TEST Supabase branch.)
 */
export function willAssertions(text: string, combo: WizardCombo): string[] {
  const failures: string[] = []
  if (/\{\{/.test(text)) failures.push('unresolved {{variable}}')
  for (const junk of ['undefined', 'NaN', '[object']) if (text.includes(junk)) failures.push(`contains "${junk}"`)
  const nums = [...text.matchAll(/^(\d+)\.\s+[A-Z]/gm)].map((m) => parseInt(m[1], 10))
  for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[i - 1] + 1) failures.push(`clause numbering gap at ${nums[i - 1]}→${nums[i]}`)
  const isNsw = combo.state === 'NSW'
  const nswRefs = /\(NSW\)|New South Wales|Succession Act|Trustee Act|Status of Children Act|Probate and Administration Act/
  if (!isNsw && nswRefs.test(text)) failures.push('non-NSW Will contains NSW statutory reference')
  return failures
}

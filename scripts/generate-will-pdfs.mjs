/**
 * scripts/generate-will-pdfs.mjs
 * Runs test profiles through the deterministic clause assembler and renders
 * each to a styled PDF via Playwright.
 *
 * Usage:
 *   node scripts/generate-will-pdfs.mjs              # all profiles
 *   node scripts/generate-will-pdfs.mjs 1            # profile 1 only
 *   node scripts/generate-will-pdfs.mjs 1 3 5        # profiles 1, 3, 5
 *
 * Output: scripts/will-pdfs/<label>.pdf + <label>.txt
 *
 * Requires: .env.development.local  (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 */

import { chromium } from 'playwright'
import { createRequire } from 'module'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, 'will-pdfs')
mkdirSync(OUT_DIR, { recursive: true })

// ── Env ───────────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '../.env.development.local')
  try {
    const lines = readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const [key, ...rest] = line.split('=')
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
    }
  } catch {
    // fall through — env vars may already be set
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.development.local')
  return { url, key }
}

const { url: SUPABASE_URL, key: SUPABASE_KEY } = loadEnv()

const require = createRequire(import.meta.url)
const { createClient } = require(resolve(__dirname, '../node_modules/@supabase/supabase-js'))
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

// ── Merge engine ──────────────────────────────────────────────────────────────

function merge(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

// ── Clause fetcher ────────────────────────────────────────────────────────────

async function fetchClauseTexts(codes) {
  const unique = [...new Set(codes)]
  const { data, error } = await supabase
    .from('clause_versions')
    .select('clauses!inner(clause_code), clause_text')
    .in('clauses.clause_code', unique)
    .eq('status', 'draft')
    .order('version', { ascending: false })
  if (error) throw new Error(`clause_versions fetch failed: ${error.message}`)
  const map = new Map()
  for (const row of data ?? []) {
    const code = row.clauses.clause_code
    if (!map.has(code)) map.set(code, row.clause_text)
  }
  return map
}

// ── Variable helpers ──────────────────────────────────────────────────────────

function resolveSub(sentinel, beneficiaryName) {
  if (sentinel === '__their_children__') return `the children of ${beneficiaryName}, in equal shares`
  if (sentinel === '__other_beneficiaries__') return 'the remaining beneficiaries, in proportion to their existing shares'
  return sentinel
}

function buildResidueText(f) {
  const all = [
    ...f.beneficiariesData.people.map(p => ({
      label: `${p.name} (${p.relationship})`, name: p.name, pct: p.percentage, sub: p.substituteBeneficiary,
    })),
    ...f.beneficiariesData.charities.map(c => ({
      label: `${c.name}${c.abn ? ` (ABN ${c.abn})` : ''}`, name: c.name, pct: c.percentage, sub: c.substituteBeneficiary,
    })),
  ]
  if (!all.length) return '[no beneficiaries named]'
  if (all.length === 1) {
    const b = all[0]
    let s = `to ${b.label} absolutely`
    if (b.sub) s += `. If ${b.label} does not survive me by ${f.survivorshipDays || '30'} days, this share passes instead to ${resolveSub(b.sub, b.name)}`
    return s
  }
  return `as follows:\n\n${all.map(b => {
    let line = `  - ${b.pct}% to ${b.label}`
    if (b.sub) line += `; if ${b.label} does not survive me by ${f.survivorshipDays || '30'} days, this share passes instead to ${resolveSub(b.sub, b.name)}`
    return line
  }).join('\n')}`
}

function buildGiftList(f) {
  return f.specificGifts.map(g => {
    const desc = g.type === 'cash' ? `the sum of $${g.amount}` : g.description
    return `  - ${desc} to ${g.recipientName}${g.recipientRelationship ? ` (${g.recipientRelationship})` : ''}`
  }).join('\n')
}

function fullName(pd) {
  return [pd.firstName, pd.middleName, pd.lastName].filter(Boolean).join(' ')
}

function lifeInterestEndCondition(condition) {
  if (condition === 'death') return 'their death'
  if (condition === 'remarriage') return 'their remarriage or entering a new de facto relationship'
  return 'their death, remarriage, or entry into a new de facto relationship, whichever occurs first'
}

// ── Clause selector ───────────────────────────────────────────────────────────

function selectClauses(f) {
  const pd = f.personalDetails
  const ed = f.executorsData
  const cd = f.childrenData
  const hasDependent = cd.hasChildren === 'yes' && cd.children.some(c => c.isDependent)
  const survivorshipDays = f.survivorshipDays || '30'
  const tname = fullName(pd)
  const primaryExec = `${ed.primary.firstName} ${ed.primary.lastName}`
  const backupExec = `${ed.alternate?.firstName} ${ed.alternate?.lastName}`
  const instances = []
  let n = 0

  instances.push({ code: 'REV-01',  heading: `${++n}. REVOCATION`, vars: {} })
  instances.push({ code: 'EXEC-01', heading: `${++n}. APPOINTMENT OF EXECUTOR`, vars: { executor_name: primaryExec } })

  if (ed.hasAlternate && ed.alternate?.firstName) {
    instances.push({ code: 'EXEC-02', heading: `${++n}. SUBSTITUTE EXECUTOR`, vars: { primary_executor_name: primaryExec, backup_executor_name: backupExec } })
  }

  if (hasDependent && cd.guardian?.firstName) {
    instances.push({ code: 'GUARD-01', heading: `${++n}. APPOINTMENT OF GUARDIAN`, vars: { guardian_name: `${cd.guardian.firstName} ${cd.guardian.lastName}` } })
  }

  instances.push({ code: 'DEBT-01', heading: `${++n}. DEBTS AND EXPENSES`, vars: {} })

  if (f.specificGifts?.length > 0) {
    instances.push({ code: 'GIFT-SPEC-01', heading: `${++n}. SPECIFIC GIFTS`, vars: { gift_list: buildGiftList(f) } })
  }

  const { people, charities } = f.beneficiariesData
  if (people.length > 0 || charities.length > 0) {
    instances.push({ code: 'RES-01', heading: `${++n}. RESIDUARY ESTATE`, vars: { residuary_disposition: buildResidueText(f) } })
  }

  for (const c of charities.filter(c => c.substituteBeneficiary)) {
    instances.push({ code: 'GIFT-CHARITY-SUB-01', heading: `${++n}. CHARITABLE GIFT SUBSTITUTION — ${c.name.toUpperCase()}`, vars: { charity_name: c.name } })
  }

  instances.push({ code: 'COMMON-GIFT-01', heading: `${++n}. SURVIVORSHIP AND GIFT RULES`, vars: { survivorship_days: survivorshipDays } })

  if (hasDependent) {
    instances.push({ code: 'MIN-01', heading: `${++n}. MINOR BENEFICIARY TRUST`, vars: { vesting_age: cd.ageOfVesting || '25' } })
    instances.push({ code: 'MIN-02', heading: `${++n}. ADVANCEMENT POWERS`, vars: {} })
  }

  if (f.lifeInterest?.enabled) {
    const li = f.lifeInterest
    instances.push({ code: 'LIFE-INT-01', heading: `${++n}. LIFE INTEREST / RIGHT TO RESIDE`, vars: {
      life_interest_property_description: li.propertyDescription,
      life_tenant_name: li.lifeTenantName,
      life_interest_end_condition: lifeInterestEndCondition(li.condition),
      remainder_beneficiary_name: li.remainderBeneficiaryName,
    }})
  }

  if (f.petCare?.hasPets === 'yes') {
    const pc = f.petCare
    instances.push({ code: 'PET-01', heading: `${++n}. CARE OF PETS`, vars: {
      pet_guardian_name: pc.caregiverName, pet_description: pc.description,
      pet_name: pc.description, pet_care_amount: pc.careFundAmount || '0',
    }})
  }

  if (f.assets?.some(a => a.assetType === 'digital_asset')) {
    const d = f.assets.find(a => a.assetType === 'digital_asset')
    instances.push({ code: 'DIGITAL-01', heading: `${++n}. DIGITAL ASSETS`, vars: { digital_access_document_location: d?.accessLocation || '[location not specified]' } })
  }

  instances.push({ code: 'EXEC-03',           heading: `${++n}. EXECUTOR POWERS`,      vars: {} })
  instances.push({ code: 'TRUST-POWERS-01',   heading: `${++n}. TRUSTEE POWERS`,       vars: {} })
  instances.push({ code: 'TRUSTEE-APPOINT-01',heading: `${++n}. TRUSTEE APPOINTMENT`,  vars: {} })
  instances.push({ code: 'APPROPRIATION-01',  heading: `${++n}. APPROPRIATION POWER`,  vars: {} })
  instances.push({ code: 'DELEGATE-01',       heading: `${++n}. DELEGATION POWER`,     vars: {} })
  instances.push({ code: 'INDEMNITY-01',      heading: `${++n}. EXECUTOR INDEMNITY`,   vars: {} })
  instances.push({ code: 'DEFN-01',           heading: `${++n}. DEFINITIONS`,          vars: {} })
  instances.push({ code: 'INTERP-01',         heading: `${++n}. INTERPRETATION`,       vars: {} })

  if (f.assets?.some(a => a.assetType === 'superannuation')) {
    instances.push({ code: 'SUPER-01', heading: `${++n}. SUPERANNUATION NOTE`, vars: {} })
  }
  if (f.assets?.some(a => a.assetType === 'life_insurance')) {
    instances.push({ code: 'INSUR-01', heading: `${++n}. LIFE INSURANCE NOTE`, vars: {} })
  }

  instances.push({ code: 'DIVORCE-01', heading: `${++n}. MARRIAGE AND DIVORCE`, vars: {} })

  const tf = f.triageFlags || {}
  if (tf.hasBusinessInterest) {
    instances.push({ code: 'BIZ-01', heading: `${++n}. BUSINESS SUCCESSION`, vars: { business_name: '[business name — solicitor to complete]', business_successor_name: '[successor — solicitor to complete]', business_entity_name: '[entity name — solicitor to complete]', business_abn_acn: '[ABN/ACN — solicitor to complete]' } })
    instances.push({ code: 'BIZ-02', heading: `${++n}. POWER TO CARRY ON BUSINESS`, vars: { business_wind_up_period: '12 months' } })
  }
  if (f.assetsOutsideAustralia) {
    instances.push({ code: 'FOREIGN-01', heading: `${++n}. FOREIGN ASSETS`, vars: { foreign_asset_description: f.otherJurisdictions || '[overseas assets — solicitor to complete]', foreign_jurisdiction: f.otherJurisdictions || '[jurisdiction — solicitor to complete]', foreign_asset_beneficiary_name: '[beneficiary — solicitor to complete]' } })
  }
  if (tf.hasVulnerableBeneficiary) {
    instances.push({ code: 'DISABILITY-01', heading: `${++n}. SPECIAL DISABILITY TRUST`, vars: { sdt_gift_description: '[gift — solicitor to complete]', sdt_trustee_name: '[trustee — solicitor to complete]', sdt_beneficiary_name: '[beneficiary — solicitor to complete]', sdt_residual_beneficiary_name: '[residual beneficiary — solicitor to complete]' } })
  }
  if (tf.hasComplexTrusts) {
    instances.push({ code: 'TRUST-TESTAMENTARY-01', heading: `${++n}. TESTAMENTARY TRUST`, vars: { testamentary_trust_share: 'whole', trustee_name: primaryExec, primary_trust_beneficiaries: '[beneficiaries — solicitor to complete]', trust_vesting_beneficiary: '[vesting beneficiary — solicitor to complete]' } })
  }
  if (tf.hasExclusionIntent) {
    instances.push({ code: 'EXCL-01', heading: `${++n}. EXCLUSION`, vars: { excluded_person_name: '[excluded person — solicitor to complete]', exclusion_reasons: '[reasons — solicitor to complete]' } })
  }

  instances.push({ code: 'EXEC-ATTEST-01', heading: `${++n}. EXECUTION AND ATTESTATION`, vars: { testator_name: tname } })

  return instances
}

// ── Document assembler ────────────────────────────────────────────────────────

async function assembleWill(f) {
  const instances = selectClauses(f)
  const clauseTexts = await fetchClauseTexts(instances.map(i => i.code))

  const pd = f.personalDetails
  const addr = [pd.addressLine1, pd.suburb, pd.state, pd.postcode].filter(Boolean).join(', ')
  const maritalLabel = { single: 'single', married: 'married', domestic_partner: 'in a domestic partnership', divorced: 'divorced', separated: 'separated', widowed: 'widowed' }[pd.maritalStatus] || ''

  const sections = [
    `LAST WILL AND TESTAMENT OF ${fullName(pd).toUpperCase()}\n\nI, ${fullName(pd)}${addr ? `, of ${addr}` : ''}, ${maritalLabel ? `being ${maritalLabel},` : ''} declare this to be my Last Will and Testament.`
  ]

  for (const inst of instances) {
    const raw = clauseTexts.get(inst.code)
    if (!raw) {
      sections.push(`${inst.heading}\n\n[Clause ${inst.code} not yet available — solicitor to insert.]`)
      continue
    }
    sections.push(`${inst.heading}\n\n${merge(raw, inst.vars)}`)
  }

  sections.push(
    'IMPORTANT NOTICE\n\n' +
    'This Will was prepared using Heirloom Life\'s clause assembly platform. ' +
    'It must be signed in the presence of two witnesses to be legally valid. ' +
    'If your circumstances involve overseas assets, business ownership, a blended family, or any other complex matter flagged above, ' +
    'a solicitor review is strongly recommended before execution.'
  )

  const doc = sections.join('\n\n')
  const unresolved = [...new Set([...doc.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]))]
  return { doc, clauseCount: instances.length, wordCount: doc.split(/\s+/).length, unresolved }
}

// ── HTML renderer ─────────────────────────────────────────────────────────────

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderInline(s) {
  return escHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
}

function docToHtml(doc) {
  const lines = doc.split('\n')
  let html = ''
  let inSig = false

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (i === 0)                             { html += `<h1>${escHtml(t)}</h1>\n`; continue }
    if (!t)                                  { if (!inSig) html += '<p class="spacer"></p>\n'; continue }
    if (/^\d+\.\s+[A-Z]/.test(t))           { html += `<h2>${escHtml(t)}</h2>\n`; continue }
    if (t === 'IMPORTANT NOTICE')            { html += `<h2 class="notice-heading">${escHtml(t)}</h2>\n`; continue }
    if (t.startsWith('Signature:') || t.startsWith('Full name:') || t.startsWith('Address:') || t.startsWith('Date signed:') || t.startsWith('Date:')) {
      html += `<p class="sig-field">${escHtml(t)}</p>\n`; inSig = true; continue
    }
    if (t === '---')                         { html += `<hr class="sig-rule"/>\n`; inSig = false; continue }
    if (t.startsWith('- '))                  { html += `<li>${renderInline(t.slice(2))}</li>\n`; continue }
    if (/^\(([a-z])\)/.test(t))             { html += `<p class="lettered">${renderInline(t)}</p>\n`; continue }
    html += `<p>${renderInline(t)}</p>\n`
  }

  // No body padding — PDF margin options (left/right) handle text offset.
  // No @media print override that would strip margins.
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
    font-size: 11.5pt;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fff;
  }
  h1 {
    font-family: 'Inter', sans-serif;
    font-size: 13pt;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 1.4em;
    padding-bottom: 0.6em;
    border-bottom: 2px solid #1a1a1a;
  }
  h2 {
    font-family: 'Inter', sans-serif;
    font-size: 9.5pt;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 1.6em;
    margin-bottom: 0.6em;
    padding-top: 0.4em;
    border-top: 1px solid #ccc;
    color: #222;
    page-break-after: avoid;
  }
  h2.notice-heading { margin-top: 2em; border-top: 2px solid #1a1a1a; }
  p { margin-bottom: 0.55em; text-align: justify; }
  p.spacer { margin-bottom: 0.3em; }
  p.lettered { margin-left: 1.5em; margin-bottom: 0.4em; }
  li { margin-left: 2em; margin-bottom: 0.35em; list-style: disc; }
  hr.sig-rule { margin: 1.2em 0; border: none; border-top: 1px solid #999; }
  p.sig-field { font-family: 'Inter', sans-serif; font-size: 10pt; margin-bottom: 0.3em; }
  strong { font-weight: 600; }
  em { font-style: italic; }
</style>
</head>
<body>
${html}
</body>
</html>`
}

// ── Footer template ───────────────────────────────────────────────────────────
// Full page width; internal padding mirrors the PDF content margins (left:28mm right:22mm).

function buildFooterTemplate(testatorName) {
  return `<div style="
    width: 100%;
    padding: 0 22mm 0 28mm;
    box-sizing: border-box;
    border-top: 1.5px solid #DDE8E7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 7.5pt;
    color: #8A9B99;
    height: 100%;
  ">
    <div style="display:flex; align-items:center; gap:7px;">
      <div style="
        width: 20px; height: 20px;
        border-radius: 4px;
        background: #0E1514;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      ">
        <span style="font-family:Georgia,'Times New Roman',serif; font-size:13px; color:#fff; line-height:1;">H</span>
      </div>
      <span style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:9pt; color:#2AB4AE; letter-spacing:0.01em;">Heirloom Life</span>
    </div>
    <div style="color:#8A9B99; font-size:7pt; letter-spacing:0.02em; text-align:center;">
      Confidential &mdash; prepared for ${testatorName.toUpperCase()} &nbsp;|&nbsp; www.heirloomlife.com.au
    </div>
    <div style="font-size:7.5pt; color:#8A9B99; white-space:nowrap;">
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
  </div>`
}

// ── Test profiles ─────────────────────────────────────────────────────────────

const profiles = [

  // 1. Married, no children, simple
  {
    label: '1-sarah-jane-mitchell',
    name: 'Sarah Jane Mitchell',
    formData: {
      personalDetails: { firstName: 'Sarah', middleName: 'Jane', lastName: 'Mitchell', dateOfBirth: '1985-04-12', addressLine1: '42 Banksia Drive', suburb: 'Surry Hills', state: 'NSW', postcode: '2010', maritalStatus: 'married' },
      childrenData: { hasChildren: 'no', children: [], guardian: { firstName: '', lastName: '' }, ageOfVesting: '25' },
      executorsData: { primary: { firstName: 'Tom', lastName: 'Mitchell', relationship: 'Spouse' }, hasAlternate: true, alternate: { firstName: 'Claire', lastName: 'Patterson', relationship: 'Sister' } },
      assets: [],
      beneficiariesData: { people: [{ id: '1', name: 'Tom Mitchell', relationship: 'Spouse', percentage: '100', substituteBeneficiary: '__their_children__' }], charities: [] },
      specificGifts: [],
      triageFlags: { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasComplexTrusts: false },
      assetsOutsideAustralia: false, otherJurisdictions: '', survivorshipDays: '30',
      petCare: { hasPets: 'no' }, lifeInterest: { enabled: false },
    },
  },

  // 2. Married, three minor children, guardian, super, specific gifts
  {
    label: '2-james-priya-osullivan',
    name: "James Patrick O'Sullivan",
    formData: {
      personalDetails: { firstName: 'James', middleName: 'Patrick', lastName: "O'Sullivan", dateOfBirth: '1979-11-03', addressLine1: '18 Rosebery Avenue', suburb: 'Balmain', state: 'NSW', postcode: '2041', maritalStatus: 'married' },
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: "Liam O'Sullivan", dateOfBirth: '2012-03-14', isDependent: true },
          { id: '2', name: "Aoife O'Sullivan", dateOfBirth: '2015-07-29', isDependent: true },
          { id: '3', name: "Cian O'Sullivan", dateOfBirth: '2019-01-05', isDependent: true },
        ],
        guardian: { firstName: 'Brendan', lastName: "O'Sullivan", relationship: 'Brother' },
        ageOfVesting: '25',
      },
      executorsData: { primary: { firstName: 'Priya', lastName: "O'Sullivan", relationship: 'Spouse' }, hasAlternate: true, alternate: { firstName: 'Brendan', lastName: "O'Sullivan", relationship: 'Brother' } },
      assets: [
        { id: '2', assetType: 'superannuation', fundName: 'Hostplus', memberNumber: 'HP99001', hasDeathBenefitNomination: true, deathBenefitNominees: "Priya O'Sullivan (spouse)" },
        { id: '3', assetType: 'life_insurance', insurerName: 'TAL', policyNumber: 'TAL-2021-44892', coverAmount: '1000000' },
      ],
      beneficiariesData: { people: [{ id: '1', name: "Priya O'Sullivan", relationship: 'Spouse', percentage: '100', substituteBeneficiary: '__their_children__' }], charities: [] },
      specificGifts: [
        { id: '1', type: 'item', description: "my grandfather's Omega Seamaster watch", recipientName: "Brendan O'Sullivan", recipientRelationship: 'Brother', substituteBeneficiary: '' },
        { id: '2', type: 'cash', amount: '10000', recipientName: 'St Vincent de Paul Society NSW', recipientRelationship: 'Charity', substituteBeneficiary: '' },
      ],
      triageFlags: { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasComplexTrusts: false },
      assetsOutsideAustralia: false, otherJurisdictions: '', survivorshipDays: '30',
      petCare: { hasPets: 'no' }, lifeInterest: { enabled: false },
    },
  },

  // 3. Widowed, adult children (non-dependent), super + charity + pets
  {
    label: '3-margaret-eleanor-davidson',
    name: 'Margaret Eleanor Davidson',
    formData: {
      personalDetails: { firstName: 'Margaret', middleName: 'Eleanor', lastName: 'Davidson', dateOfBirth: '1951-08-17', addressLine1: '7 Jacaranda Place', suburb: 'Woollahra', state: 'NSW', postcode: '2025', maritalStatus: 'widowed' },
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: 'Robert Davidson', dateOfBirth: '1978-04-20', isDependent: false },
          { id: '2', name: 'Susan Nguyen', dateOfBirth: '1981-11-02', isDependent: false },
        ],
        guardian: { firstName: '', lastName: '' }, ageOfVesting: '25',
      },
      executorsData: { primary: { firstName: 'Robert', lastName: 'Davidson', relationship: 'Son' }, hasAlternate: true, alternate: { firstName: 'Susan', lastName: 'Nguyen', relationship: 'Daughter' } },
      assets: [
        { id: '2', assetType: 'superannuation', fundName: 'Australian Retirement Trust', memberNumber: 'ART-20334', hasDeathBenefitNomination: true, deathBenefitNominees: 'Robert Davidson (son)' },
      ],
      beneficiariesData: {
        people: [
          { id: '1', name: 'Robert Davidson', relationship: 'Son', percentage: '40', substituteBeneficiary: '__their_children__' },
          { id: '2', name: 'Susan Nguyen', relationship: 'Daughter', percentage: '40', substituteBeneficiary: '__their_children__' },
        ],
        charities: [
          { id: '3', name: "Alzheimer's Australia NSW", abn: '27 572 512 219', percentage: '20', substituteBeneficiary: '' },
        ],
      },
      specificGifts: [
        { id: '1', type: 'item', description: 'my pearl necklace and diamond engagement ring', recipientName: 'Susan Nguyen', recipientRelationship: 'Daughter', substituteBeneficiary: '' },
        { id: '2', type: 'item', description: 'my complete collection of first-edition Australian novels', recipientName: 'Robert Davidson', recipientRelationship: 'Son', substituteBeneficiary: '' },
        { id: '3', type: 'cash', amount: '5000', recipientName: 'Woollahra Library Foundation', recipientRelationship: 'Charity', substituteBeneficiary: '' },
      ],
      triageFlags: { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasComplexTrusts: false },
      assetsOutsideAustralia: false, otherJurisdictions: '', survivorshipDays: '30',
      petCare: { hasPets: 'yes', description: 'Maisie, a golden retriever', caregiverName: 'Susan Nguyen', caregiverRelationship: 'Daughter', careFundAmount: '3000' },
      lifeInterest: { enabled: false },
    },
  },

  // 4. Married, business interest + overseas assets (escalation clauses)
  {
    label: '4-daniel-chen-escalation',
    name: 'Daniel Wei Chen',
    formData: {
      personalDetails: { firstName: 'Daniel', middleName: 'Wei', lastName: 'Chen', dateOfBirth: '1968-02-28', addressLine1: '210 Pacific Highway', suburb: 'St Leonards', state: 'NSW', postcode: '2065', maritalStatus: 'married' },
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: 'Sophia Chen', dateOfBirth: '2005-05-11', isDependent: true },
          { id: '2', name: 'Lucas Chen', dateOfBirth: '2008-08-30', isDependent: true },
        ],
        guardian: { firstName: 'Mei', lastName: 'Chen', relationship: 'Spouse' }, ageOfVesting: '30',
      },
      executorsData: { primary: { firstName: 'Mei', lastName: 'Chen', relationship: 'Spouse' }, hasAlternate: true, alternate: { firstName: 'Henry', lastName: 'Chen', relationship: 'Brother' } },
      assets: [
        { id: '2', assetType: 'superannuation', fundName: 'Aware Super', memberNumber: 'AS-44521', hasDeathBenefitNomination: true, deathBenefitNominees: 'Mei Chen (spouse)' },
      ],
      beneficiariesData: {
        people: [
          { id: '1', name: 'Mei Chen', relationship: 'Spouse', percentage: '60', substituteBeneficiary: '__their_children__' },
          { id: '2', name: 'Sophia Chen', relationship: 'Daughter', percentage: '20', substituteBeneficiary: '__their_children__' },
          { id: '3', name: 'Lucas Chen', relationship: 'Son', percentage: '20', substituteBeneficiary: '__their_children__' },
        ],
        charities: [],
      },
      specificGifts: [
        { id: '1', type: 'item', description: 'my jade collection and family heirlooms', recipientName: 'Mei Chen', recipientRelationship: 'Spouse', substituteBeneficiary: '' },
      ],
      triageFlags: { hasBusinessInterest: true, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasComplexTrusts: false },
      assetsOutsideAustralia: true, otherJurisdictions: 'China', survivorshipDays: '30',
      petCare: { hasPets: 'no' }, lifeInterest: { enabled: false },
    },
  },

  // 5. Married, life interest for surviving spouse, adult children
  {
    label: '5-robert-beatrice-hartley',
    name: 'Robert George Hartley',
    formData: {
      personalDetails: { firstName: 'Robert', middleName: 'George', lastName: 'Hartley', dateOfBirth: '1943-12-01', addressLine1: '3 Fernleigh Road', suburb: 'Pymble', state: 'NSW', postcode: '2073', maritalStatus: 'married' },
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: 'Charles Hartley', dateOfBirth: '1972-06-08', isDependent: false },
          { id: '2', name: 'Diana Hartley-Walsh', dateOfBirth: '1975-09-23', isDependent: false },
        ],
        guardian: { firstName: '', lastName: '' }, ageOfVesting: '25',
      },
      executorsData: { primary: { firstName: 'Charles', lastName: 'Hartley', relationship: 'Son' }, hasAlternate: true, alternate: { firstName: 'Diana', lastName: 'Hartley-Walsh', relationship: 'Daughter' } },
      assets: [
        { id: '2', assetType: 'superannuation', fundName: 'Colonial First State', memberNumber: 'CFS-88102', hasDeathBenefitNomination: true, deathBenefitNominees: 'Beatrice Hartley (spouse)' },
      ],
      beneficiariesData: {
        people: [
          { id: '1', name: 'Charles Hartley', relationship: 'Son', percentage: '50', substituteBeneficiary: '__their_children__' },
          { id: '2', name: 'Diana Hartley-Walsh', relationship: 'Daughter', percentage: '50', substituteBeneficiary: '__their_children__' },
        ],
        charities: [],
      },
      specificGifts: [
        { id: '1', type: 'item', description: 'my complete law library and judicial robes', recipientName: 'Charles Hartley', recipientRelationship: 'Son', substituteBeneficiary: '' },
        { id: '2', type: 'item', description: 'my gold cufflinks and dress watch collection', recipientName: 'Charles Hartley', recipientRelationship: 'Son', substituteBeneficiary: '' },
        { id: '3', type: 'cash', amount: '25000', recipientName: "Pymble Ladies' College Foundation", recipientRelationship: 'Charity', substituteBeneficiary: '' },
      ],
      triageFlags: { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasComplexTrusts: false },
      assetsOutsideAustralia: false, otherJurisdictions: '', survivorshipDays: '30',
      petCare: { hasPets: 'no' },
      lifeInterest: {
        enabled: true,
        propertyDescription: 'my real property at 3 Fernleigh Road, Pymble NSW 2073',
        lifeTenantName: 'Beatrice Anne Hartley',
        lifeTenantRelationship: 'Spouse',
        condition: 'death_or_remarriage',
        remainderBeneficiaryName: 'Charles Hartley and Diana Hartley-Walsh in equal shares',
      },
    },
  },

]

// ── Main ──────────────────────────────────────────────────────────────────────

const requested = process.argv.slice(2).map(Number).filter(Boolean)
const toRun = requested.length > 0
  ? profiles.filter((_, i) => requested.includes(i + 1))
  : profiles

if (toRun.length === 0) {
  console.error(`No matching profiles for: ${process.argv.slice(2).join(', ')}`)
  process.exit(1)
}

const browser = await chromium.launch({ headless: true })

for (const profile of toRun) {
  process.stdout.write(`\nAssembling: ${profile.name}...`)
  const { doc, clauseCount, wordCount, unresolved } = await assembleWill(profile.formData)

  if (unresolved.length > 0) console.log(`\n  ⚠  Unresolved vars: ${unresolved.join(', ')}`)
  console.log(` ${clauseCount} clauses, ${wordCount} words`)

  writeFileSync(`${OUT_DIR}/${profile.label}.txt`, doc)

  const page = await browser.newPage()
  await page.setContent(docToHtml(doc), { waitUntil: 'networkidle' })

  const pdfPath = `${OUT_DIR}/${profile.label}.pdf`
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    // Content margins — left/right managed here, not in body CSS.
    margin: { top: '20mm', bottom: '22mm', left: '28mm', right: '22mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: buildFooterTemplate(profile.name),
  })
  await page.close()
  console.log(`  → ${pdfPath}`)
}

await browser.close()
console.log('\nDone.\n')

/**
 * scripts/generate-will-pdfs.ts
 * Generates test Will PDFs using the same code path as the production dashboard.
 *
 * Usage:
 *   npx tsx scripts/generate-will-pdfs.ts              # all profiles
 *   npx tsx scripts/generate-will-pdfs.ts 1            # profile 1 only
 *   npx tsx scripts/generate-will-pdfs.ts 1 3 5        # profiles 1, 3, 5
 *
 * Output: scripts/will-pdfs/<label>.pdf + <label>.txt
 */

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { assembleWillDocument } from '../app/will/new/_assembly'
import { renderWillPdf } from '../src/lib/pdf/renderWillPdf'
import type { WillFormData } from '../app/will/new/_types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, 'will-pdfs')
mkdirSync(OUT_DIR, { recursive: true })

// ── Blank stubs (avoids repeating empty strings throughout profiles) ──────────

const blankExecutor = { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' }
const blankGuardian = { firstName: '', lastName: '', relationship: '', phone: '', email: '' }
const blankSpouse   = { firstName: '', middleName: '', lastName: '', dateOfBirth: '', addressLine1: '', suburb: '', state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '' as const, previousWillLocation: '' }
const blankWishes   = { funeralType: '' as const, funeralRestingPlace: '', funeralAdditionalWishes: '', hasFuneralPlan: false, funeralPlanDetails: '' }
const blankLife     = { enabled: false, propertyDescription: '', lifeTenantName: '', lifeTenantRelationship: '', condition: '' as const, remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '' }
const blankPet      = { hasPets: 'no' as const, petName: '', petDescription: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' }
const blankTriage   = { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasBeneficiaryFinancialChallenges: false, hasComplexTrusts: false }

// ── Test profiles ─────────────────────────────────────────────────────────────

const profiles: { label: string; name: string; formData: WillFormData }[] = [

  // 1. Married, no children, simple
  {
    label: '1-sarah-jane-mitchell',
    name: 'Sarah Jane Mitchell',
    formData: {
      willId: null,
      personalDetails: {
        firstName: 'Sarah', middleName: 'Jane', lastName: 'Mitchell',
        dateOfBirth: '1985-04-12', addressLine1: '42 Banksia Drive',
        suburb: 'Surry Hills', state: 'NSW', postcode: '2010',
        phoneMobile: '', email: '', occupation: '',
        maritalStatus: 'married', previousWill: 'no', previousWillLocation: '',
      },
      spouseDetails: { ...blankSpouse, firstName: 'Tom', lastName: 'Mitchell' },
      childrenData: { hasChildren: 'no', children: [], guardian: blankGuardian, ageOfVesting: '25' },
      executorsData: {
        primary:   { firstName: 'Tom',   lastName: 'Mitchell',  relationship: 'Spouse', phone: '', email: '', address: '' },
        hasAlternate: true,
        alternate: { firstName: 'Claire', lastName: 'Patterson', relationship: 'Sister', phone: '', email: '', address: '' },
      },
      assets: [],
      beneficiariesData: {
        people: [{ id: '1', name: 'Tom Mitchell', relationship: 'Spouse', percentage: '100', substituteBeneficiary: '__their_children__' }],
        charities: [],
      },
      specificGifts: [],
      triageFlags: blankTriage,
      assetsOutsideAustralia: false, otherJurisdictions: '',
      importantDocumentsLocation: '', survivorshipDays: '30',
      petCare: blankPet, lifeInterest: blankLife, personalWishes: blankWishes,
    },
  },

  // 2. Married, three minor children, guardian, super + life insurance, specific gifts
  {
    label: '2-james-priya-osullivan',
    name: "James Patrick O'Sullivan",
    formData: {
      willId: null,
      personalDetails: {
        firstName: 'James', middleName: 'Patrick', lastName: "O'Sullivan",
        dateOfBirth: '1979-11-03', addressLine1: '18 Rosebery Avenue',
        suburb: 'Balmain', state: 'NSW', postcode: '2041',
        phoneMobile: '', email: '', occupation: '',
        maritalStatus: 'married', previousWill: 'no', previousWillLocation: '',
      },
      spouseDetails: { ...blankSpouse, firstName: 'Priya', lastName: "O'Sullivan" },
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: "Liam O'Sullivan",  dateOfBirth: '2012-03-14', isDependent: true },
          { id: '2', name: "Aoife O'Sullivan", dateOfBirth: '2015-07-29', isDependent: true },
          { id: '3', name: "Cian O'Sullivan",  dateOfBirth: '2019-01-05', isDependent: true },
        ],
        guardian: { firstName: 'Brendan', lastName: "O'Sullivan", relationship: 'Brother', phone: '', email: '' },
        ageOfVesting: '25',
      },
      executorsData: {
        primary:   { firstName: 'Priya',   lastName: "O'Sullivan", relationship: 'Spouse',  phone: '', email: '', address: '' },
        hasAlternate: true,
        alternate: { firstName: 'Brendan', lastName: "O'Sullivan", relationship: 'Brother', phone: '', email: '', address: '' },
      },
      assets: [
        { id: '2', assetType: 'superannuation', ownershipType: 'sole', propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '', fundName: 'Hostplus', memberNumber: 'HP99001', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '', coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '', hasDeathBenefitNomination: true, deathBenefitNominees: "Priya O'Sullivan (spouse)", isOverseas: false, overseasCountry: '' },
        { id: '3', assetType: 'life_insurance', ownershipType: 'sole', propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '', fundName: '', memberNumber: '', companyName: '', numberOfShares: '', insurerName: 'TAL', policyNumber: 'TAL-2021-44892', coverAmount: '1000000', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '', hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '' },
      ],
      beneficiariesData: {
        people: [{ id: '1', name: "Priya O'Sullivan", relationship: 'Spouse', percentage: '100', substituteBeneficiary: '__their_children__' }],
        charities: [],
      },
      specificGifts: [
        { id: '1', type: 'item', description: "my grandfather's Omega Seamaster watch", amount: '', recipientName: "Brendan O'Sullivan", recipientRelationship: 'Brother', substituteBeneficiary: '' },
        { id: '2', type: 'cash', description: '', amount: '10000', recipientName: 'St Vincent de Paul Society NSW', recipientRelationship: 'Charity', substituteBeneficiary: '' },
      ],
      triageFlags: blankTriage,
      assetsOutsideAustralia: false, otherJurisdictions: '',
      importantDocumentsLocation: '', survivorshipDays: '30',
      petCare: blankPet, lifeInterest: blankLife, personalWishes: blankWishes,
    },
  },

  // 3. Widowed, adult children (non-dependent), super + charity + pets
  {
    label: '3-margaret-eleanor-davidson',
    name: 'Margaret Eleanor Davidson',
    formData: {
      willId: null,
      personalDetails: {
        firstName: 'Margaret', middleName: 'Eleanor', lastName: 'Davidson',
        dateOfBirth: '1951-08-17', addressLine1: '7 Jacaranda Place',
        suburb: 'Woollahra', state: 'NSW', postcode: '2025',
        phoneMobile: '', email: '', occupation: '',
        maritalStatus: 'widowed', previousWill: 'no', previousWillLocation: '',
      },
      spouseDetails: blankSpouse,
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: 'Robert Davidson', dateOfBirth: '1978-04-20', isDependent: false },
          { id: '2', name: 'Susan Nguyen',     dateOfBirth: '1981-11-02', isDependent: false },
        ],
        guardian: blankGuardian, ageOfVesting: '25',
      },
      executorsData: {
        primary:   { firstName: 'Robert', lastName: 'Davidson', relationship: 'Son',      phone: '', email: '', address: '' },
        hasAlternate: true,
        alternate: { firstName: 'Susan',  lastName: 'Nguyen',   relationship: 'Daughter', phone: '', email: '', address: '' },
      },
      assets: [
        { id: '2', assetType: 'superannuation', ownershipType: 'sole', propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '', fundName: 'Australian Retirement Trust', memberNumber: 'ART-20334', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '', coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '', hasDeathBenefitNomination: true, deathBenefitNominees: 'Robert Davidson (son)', isOverseas: false, overseasCountry: '' },
      ],
      beneficiariesData: {
        people: [
          { id: '1', name: 'Robert Davidson', relationship: 'Son',      percentage: '40', substituteBeneficiary: '__their_children__' },
          { id: '2', name: 'Susan Nguyen',     relationship: 'Daughter', percentage: '40', substituteBeneficiary: '__their_children__' },
        ],
        charities: [
          { id: '3', name: "Alzheimer's Australia NSW", abn: '27 572 512 219', percentage: '20', substituteBeneficiary: '' },
        ],
      },
      specificGifts: [
        { id: '1', type: 'item', description: 'my pearl necklace and diamond engagement ring',         amount: '', recipientName: 'Susan Nguyen',   recipientRelationship: 'Daughter', substituteBeneficiary: '' },
        { id: '2', type: 'item', description: 'my complete collection of first-edition Australian novels', amount: '', recipientName: 'Robert Davidson', recipientRelationship: 'Son',      substituteBeneficiary: '' },
        { id: '3', type: 'cash', description: '', amount: '5000', recipientName: 'Woollahra Library Foundation', recipientRelationship: 'Charity', substituteBeneficiary: '' },
      ],
      triageFlags: blankTriage,
      assetsOutsideAustralia: false, otherJurisdictions: '',
      importantDocumentsLocation: '', survivorshipDays: '30',
      petCare: { hasPets: 'yes', petName: 'Maisie', petDescription: 'golden retriever', caregiverName: 'Susan Nguyen', caregiverRelationship: 'Daughter', careFundAmount: '3000' },
      lifeInterest: blankLife, personalWishes: blankWishes,
    },
  },

  // 4. ADVERSARIAL — Married, overseas assets + business interest → SOLICITOR_REQUIRED gate
  {
    label: '4-daniel-wei-chen',
    name: 'Daniel Wei Chen',
    formData: {
      willId: null,
      personalDetails: {
        firstName: 'Daniel', middleName: 'Wei', lastName: 'Chen',
        dateOfBirth: '1968-02-28', addressLine1: '210 Pacific Highway',
        suburb: 'St Leonards', state: 'NSW', postcode: '2065',
        phoneMobile: '', email: '', occupation: '',
        maritalStatus: 'married', previousWill: 'no', previousWillLocation: '',
      },
      spouseDetails: { ...blankSpouse, firstName: 'Mei', lastName: 'Chen' },
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: 'Sophia Chen', dateOfBirth: '2005-05-11', isDependent: true },
          { id: '2', name: 'Lucas Chen',  dateOfBirth: '2008-08-30', isDependent: true },
        ],
        guardian: { firstName: 'Mei', lastName: 'Chen', relationship: 'Spouse', phone: '', email: '' },
        ageOfVesting: '30',
      },
      executorsData: {
        primary:   { firstName: 'Mei',   lastName: 'Chen', relationship: 'Spouse',  phone: '', email: '', address: '' },
        hasAlternate: true,
        alternate: { firstName: 'Henry', lastName: 'Chen', relationship: 'Brother', phone: '', email: '', address: '' },
      },
      assets: [
        { id: '2', assetType: 'superannuation', ownershipType: 'sole', propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '', fundName: 'Aware Super', memberNumber: 'AS-44521', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '', coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '', hasDeathBenefitNomination: true, deathBenefitNominees: 'Mei Chen (spouse)', isOverseas: false, overseasCountry: '' },
      ],
      beneficiariesData: {
        people: [
          { id: '1', name: 'Mei Chen',    relationship: 'Spouse',   percentage: '60', substituteBeneficiary: '__their_children__' },
          { id: '2', name: 'Sophia Chen', relationship: 'Daughter', percentage: '20', substituteBeneficiary: '__their_children__' },
          { id: '3', name: 'Lucas Chen',  relationship: 'Son',      percentage: '20', substituteBeneficiary: '__their_children__' },
        ],
        charities: [],
      },
      specificGifts: [
        { id: '1', type: 'item', description: 'my jade collection and family heirlooms', amount: '', recipientName: 'Mei Chen', recipientRelationship: 'Spouse', substituteBeneficiary: '' },
      ],
      triageFlags: { ...blankTriage, hasBusinessInterest: true },
      assetsOutsideAustralia: true, otherJurisdictions: 'China',
      importantDocumentsLocation: '', survivorshipDays: '30',
      petCare: blankPet, lifeInterest: blankLife, personalWishes: blankWishes,
    },
  },

  // 5. ADVERSARIAL — Married, adult children, life interest → SOLICITOR_REQUIRED gate
  {
    label: '5-robert-george-hartley',
    name: 'Robert George Hartley',
    formData: {
      willId: null,
      personalDetails: {
        firstName: 'Robert', middleName: 'George', lastName: 'Hartley',
        dateOfBirth: '1943-12-01', addressLine1: '3 Fernleigh Road',
        suburb: 'Pymble', state: 'NSW', postcode: '2073',
        phoneMobile: '', email: '', occupation: '',
        maritalStatus: 'married', previousWill: 'no', previousWillLocation: '',
      },
      spouseDetails: { ...blankSpouse, firstName: 'Beatrice', lastName: 'Hartley' },
      childrenData: {
        hasChildren: 'yes',
        children: [
          { id: '1', name: 'Charles Hartley',       dateOfBirth: '1972-06-08', isDependent: false },
          { id: '2', name: 'Diana Hartley-Walsh',   dateOfBirth: '1975-09-23', isDependent: false },
        ],
        guardian: blankGuardian, ageOfVesting: '25',
      },
      executorsData: {
        primary:   { firstName: 'Charles', lastName: 'Hartley',       relationship: 'Son',      phone: '', email: '', address: '' },
        hasAlternate: true,
        alternate: { firstName: 'Diana',   lastName: 'Hartley-Walsh', relationship: 'Daughter', phone: '', email: '', address: '' },
      },
      assets: [
        { id: '2', assetType: 'superannuation', ownershipType: 'sole', propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '', fundName: 'Colonial First State', memberNumber: 'CFS-88102', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '', coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '', hasDeathBenefitNomination: true, deathBenefitNominees: 'Beatrice Hartley (spouse)', isOverseas: false, overseasCountry: '' },
      ],
      beneficiariesData: {
        people: [
          { id: '1', name: 'Charles Hartley',     relationship: 'Son',      percentage: '50', substituteBeneficiary: '__their_children__' },
          { id: '2', name: 'Diana Hartley-Walsh', relationship: 'Daughter', percentage: '50', substituteBeneficiary: '__their_children__' },
        ],
        charities: [],
      },
      specificGifts: [
        { id: '1', type: 'item', description: 'my complete law library and judicial robes',  amount: '', recipientName: 'Charles Hartley',       recipientRelationship: 'Son',      substituteBeneficiary: '' },
        { id: '2', type: 'item', description: 'my gold cufflinks and dress watch collection', amount: '', recipientName: 'Charles Hartley',       recipientRelationship: 'Son',      substituteBeneficiary: '' },
        { id: '3', type: 'cash', description: '', amount: '25000',                            recipientName: "Pymble Ladies' College Foundation", recipientRelationship: 'Charity',  substituteBeneficiary: '' },
      ],
      triageFlags: blankTriage,
      assetsOutsideAustralia: false, otherJurisdictions: '',
      importantDocumentsLocation: '', survivorshipDays: '30',
      petCare: blankPet,
      lifeInterest: {
        enabled: true,
        propertyDescription: '3 Fernleigh Road, Pymble',
        lifeTenantName: 'Beatrice Hartley',
        lifeTenantRelationship: 'Spouse',
        condition: 'death',
        remainderBeneficiaryName: 'Charles Hartley',
        remainderBeneficiaryRelationship: 'Son',
      },
      personalWishes: blankWishes,
    },
  },

]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const requested = process.argv.slice(2).map(Number).filter(Boolean)
  const toRun = requested.length > 0
    ? profiles.filter((_, i) => requested.includes(i + 1))
    : profiles

  if (toRun.length === 0) {
    console.error(`No matching profiles for: ${process.argv.slice(2).join(', ')}`)
    process.exit(1)
  }

  for (const profile of toRun) {
    process.stdout.write(`\nRendering: ${profile.name}...`)

    let documentText: string
    try {
      documentText = await assembleWillDocument(profile.formData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('requires solicitor')) {
        console.log(`\n  ✓ CORRECTLY BLOCKED — complexity gate fired (${profile.label})`)
        console.log(`    ${msg.split('.')[0]}.`)
        continue
      }
      throw err
    }

    const wordCount = documentText.split(/\s+/).length
    console.log(` ${wordCount} words`)

    writeFileSync(`${OUT_DIR}/${profile.label}.txt`, documentText)

    const pdfPath = `${OUT_DIR}/${profile.label}.pdf`
    const bytes = await renderWillPdf(documentText, { testatorName: profile.name })
    writeFileSync(pdfPath, Buffer.from(bytes as ArrayBuffer))
    console.log(`  → ${pdfPath}`)
  }

  console.log('\nDone.\n')
}

main().catch(err => { console.error(err); process.exit(1) })

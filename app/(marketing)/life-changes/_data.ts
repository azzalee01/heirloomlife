export type LifeChange = {
  slug: string
  title: string
  shortTitle: string
  eyebrow: string
  summary: string
  introduction: string
  legalRule: string
  considerations: { title: string; body: string }[]
  checklist: string[]
  advice: string
  accent: string
  productStep: string
  sources: { label: string; href: string }[]
}

const WILLS_SOURCE = {
  label: 'Legal Aid WA: Wills and relationship changes',
  href: 'https://www.legalaid.wa.gov.au/find-legal-answers/managing-your-affairs/wills-and-estates/wills',
}

const SUPER_SOURCE = {
  label: 'Australian Taxation Office: Superannuation death benefits',
  href: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/superannuation-death-benefits',
}

const NSW_SUCCESSION = { label: 'NSW Succession Act 2006, sections 12–13', href: 'https://legislation.nsw.gov.au/view/html/inforce/current/act-2006-80' }
const QLD_SUCCESSION = { label: 'Queensland Succession Act 1981, sections 14–15B', href: 'https://www.legislation.qld.gov.au/view/html/inforce/current/act-1981-069' }
const SA_SUCCESSION = { label: 'South Australia Succession Act 2023, sections 18–19', href: 'https://www.legislation.sa.gov.au/_legislation-documents/lz/c/a/succession-act-2023/current/2023.30.auth.pdf' }
const TAS_WILLS = { label: 'Tasmania Wills Act 2008, sections 16–17', href: 'https://www.legislation.tas.gov.au/view/html/inforce/current/act-2008-058' }
const WA_WILLS = { label: 'Western Australia Wills Act 1970', href: 'https://www.legislation.wa.gov.au/legislation/statutes.nsf/main_mrtitle_1081_homepage.html' }
const ACT_WILLS = { label: 'ACT Wills Act 1968', href: 'https://www.legislation.act.gov.au/a/1968-11' }
const VIC_WILLS = { label: 'Victoria Wills Act 1997', href: 'https://www.legislation.vic.gov.au/in-force/acts/wills-act-1997' }
const NT_WILLS = { label: 'Northern Territory Wills Act 2000', href: 'https://legislation.nt.gov.au/en/Legislation/WILLS-ACT-2000' }

export const LIFE_CHANGES: LifeChange[] = [
  {
    slug: 'getting-married',
    title: 'Getting married or committing to a partner',
    shortTitle: 'Getting married',
    eyebrow: 'Relationships',
    summary: 'Bring your Will, beneficiaries and important appointments into your new chapter.',
    introduction: 'Marriage can affect an existing Will, but the result depends on the law that applies and how the Will was prepared. A new relationship can also change who you want to provide for and who should act for you.',
    legalRule: 'Marriage revokes an existing Will in every Australian state and territory. The principal exception is a Will made in contemplation of that marriage. Statutes also preserve limited provisions in some jurisdictions, including certain gifts or appointments benefiting the person you marry.',
    considerations: [
      { title: 'Your existing Will', body: 'In several Australian jurisdictions, marriage can revoke an earlier Will unless it was made in contemplation of that marriage. Confirm the position that applies to you.' },
      { title: 'People and appointments', body: 'Review beneficiaries, executors, guardians and substitute appointments so they reflect your current relationships and intentions.' },
      { title: 'Assets outside the Will', body: 'Superannuation, insurance and jointly owned property may follow separate nomination or ownership rules and should be reviewed alongside the Will.' },
    ],
    checklist: ['Locate and review your current signed Will', 'Confirm how property is owned', 'Review superannuation and insurance nominations', 'Update beneficiaries, executors and guardians', 'Record the new relationship in your estate information'],
    advice: 'Get legal advice if you are part of a blended family, have children from an earlier relationship, own assets overseas, use trusts or companies, or are uncertain whether marriage affected an existing Will.',
    accent: '#fdf2f8',
    productStep: 'personal',
    sources: [NSW_SUCCESSION, QLD_SUCCESSION, SA_SUCCESSION, TAS_WILLS, WA_WILLS, ACT_WILLS, VIC_WILLS, NT_WILLS, WILLS_SOURCE, SUPER_SOURCE],
  },
  {
    slug: 'separation-divorce',
    title: 'Separation or divorce',
    shortTitle: 'Separation or divorce',
    eyebrow: 'Relationships',
    summary: 'Review the people, gifts and decision-making roles that may no longer reflect your intentions.',
    introduction: 'Separation and divorce are not the same legal event. Their effect on a Will and other arrangements differs between jurisdictions, and waiting for a divorce to become final may leave outdated choices in place.',
    legalRule: 'For a married couple, separation does not revoke the Will or remove the separated spouse. Divorce has a statutory effect. In Western Australia it revokes the Will as a whole unless a contrary intention is established. In NSW, Queensland, South Australia, Tasmania, Victoria, the ACT and Northern Territory, it generally revokes gifts and appointments involving the former spouse and the Will operates as if that person had died first, subject to statutory exceptions and contrary intention. Queensland separately provides for the end of a de facto relationship.',
    considerations: [
      { title: 'Timing matters', body: 'Separation alone may not remove a former partner from a Will. Divorce may affect particular gifts and appointments or have a broader effect, depending on the jurisdiction.' },
      { title: 'More than the Will', body: 'Check superannuation nominations, insurance, powers of attorney, jointly owned assets and trusted contacts separately.' },
      { title: 'Family provision risk', body: 'Changing a document does not necessarily remove another person’s ability to make a claim. Individual advice is especially important where financial relationships continue.' },
    ],
    checklist: ['Get a copy of your current Will', 'Review executors and beneficiaries', 'Check joint ownership and account access', 'Review super and insurance nominations', 'Replace outdated emergency and trusted contacts'],
    advice: 'Prompt legal advice is strongly recommended during separation, especially where there are children, jointly owned property, family businesses, trusts, financial dependency or safety concerns.',
    accent: '#fff7ed',
    productStep: 'personal',
    sources: [NSW_SUCCESSION, QLD_SUCCESSION, SA_SUCCESSION, TAS_WILLS, WA_WILLS, ACT_WILLS, VIC_WILLS, NT_WILLS, WILLS_SOURCE, SUPER_SOURCE],
  },
  {
    slug: 'new-child',
    title: 'Having or adopting a child',
    shortTitle: 'A new child',
    eyebrow: 'Family',
    summary: 'Revisit guardianship, financial provision and the people responsible for carrying out your wishes.',
    introduction: 'A new child changes both who you may want to provide for and who may need to care for them. Your estate plan should reflect the whole family and include suitable backup arrangements.',
    legalRule: 'The birth or adoption of a child does not revoke a Will. Whether the child benefits depends on the Will’s language and succession law. Naming a preferred guardian records an important testamentary choice, but it does not displace the court’s overriding responsibility for the child’s best interests.',
    considerations: [
      { title: 'Guardianship wishes', body: 'A Will can record who you wish to act as guardian, but suitability and the child’s best interests remain important. Name alternatives where appropriate.' },
      { title: 'How children receive gifts', body: 'Consider whether children are covered as a class, what happens for future children, and who manages property for a child before they reach the chosen age.' },
      { title: 'Financial protection', body: 'Review life insurance and superannuation nominations alongside the Will, particularly if household income or care responsibilities changed.' },
    ],
    checklist: ['Add the child to your family record', 'Review guardians and backup guardians', 'Check how gifts for children are held and managed', 'Review insurance and superannuation', 'Update practical care and contact information'],
    advice: 'Seek advice for blended families, children with disability or additional needs, informal care arrangements, overseas guardians, trusts or significant concerns about future claims.',
    accent: '#eff6ff',
    productStep: 'children',
    sources: [SUPER_SOURCE],
  },
  {
    slug: 'buying-selling-property',
    title: 'Buying or selling property',
    shortTitle: 'Property bought or sold',
    eyebrow: 'Property',
    summary: 'Check ownership, specific gifts and whether your estate record still matches your largest assets.',
    introduction: 'Property is often a household’s largest asset. Buying, selling or changing ownership can alter what forms part of an estate and whether a gift in an existing Will can still operate as intended.',
    legalRule: 'Property held as joint tenants passes automatically to the surviving joint tenant and does not pass under the deceased owner’s Will. A tenant in common owns a distinct share; that share forms part of the estate and can pass under the Will. If specifically gifted property is sold before death, the gift will ordinarily fail because the property is no longer in the estate.',
    considerations: [
      { title: 'Ownership structure', body: 'Joint tenancy and tenancy in common can produce different succession outcomes. Confirm the title rather than relying on who contributed to the purchase.' },
      { title: 'Specific gifts', body: 'If a Will names a particular property that is later sold, the intended recipient may not receive an equivalent replacement unless the document provides for it.' },
      { title: 'Debt and affordability', body: 'Mortgages and other liabilities affect the net value available to beneficiaries. Record the lender, ownership and key documents without storing unsafe access credentials.' },
    ],
    checklist: ['Confirm the registered owners and ownership type', 'Add or remove the property in your Vault', 'Review property-specific gifts', 'Record the mortgage and relevant documents', 'Check insurance and nominated contacts'],
    advice: 'Obtain advice where ownership is unequal, a property is held through a trust or company, someone has a right to live there, the asset is overseas, or the intended gift may create tax or cash-flow issues.',
    accent: '#ecfdf5',
    productStep: 'assets',
    sources: [],
  },
  {
    slug: 'serious-illness',
    title: 'A serious diagnosis or change in health',
    shortTitle: 'Serious illness',
    eyebrow: 'Health',
    summary: 'Make important information accessible and check that your documents still express your wishes.',
    introduction: 'A serious health change can make estate planning feel urgent. It is important to act while you can make and communicate your own decisions, without pressure from others.',
    legalRule: 'Illness or diagnosis does not itself invalidate a Will. The Will-maker must have testamentary capacity and intend the document to operate as a Will when it is executed. A Will obtained through coercion or undue influence can be challenged. Powers of attorney operate during life and end on death; a Will operates after death.',
    considerations: [
      { title: 'Capacity and free choice', body: 'A Will maker must understand and approve the document and act voluntarily. Where capacity may be questioned, independent legal and medical evidence can become important.' },
      { title: 'Documents for life', body: 'A Will operates after death. Powers of attorney, guardianship or health-planning documents deal with decisions while you are alive and differ by jurisdiction.' },
      { title: 'Access and practical instructions', body: 'Make sure trusted people know where original documents and essential information can be found without exposing sensitive passwords.' },
    ],
    checklist: ['Review your signed Will and appointments', 'Consider powers of attorney and health documents', 'Confirm original-document storage', 'Update trusted and emergency contacts', 'Organise assets, liabilities and practical instructions'],
    advice: 'Use an independent solicitor where capacity may be questioned, a beneficiary is involved in arranging the Will, family conflict exists, or urgent execution is required. Medical urgency should never be used to pressure a person.',
    accent: '#fef2f2',
    productStep: 'personal',
    sources: [WILLS_SOURCE],
  },
  {
    slug: 'starting-selling-business',
    title: 'Starting, buying or selling a business',
    shortTitle: 'A business change',
    eyebrow: 'Business',
    summary: 'Connect business ownership and succession arrangements with your personal estate plan.',
    introduction: 'A business can involve companies, trusts, partnerships, loans and agreements that do not simply pass under a personal Will. A major business change deserves a coordinated review.',
    legalRule: 'A company owns its own assets; a shareholder’s Will disposes of the shares, not the company’s property. Trust property belongs to the trustee on the terms of the trust and is not personally owned by a beneficiary. Partnership, shareholder and buy-sell agreements can create rights and obligations that operate separately from the Will.',
    considerations: [
      { title: 'What you actually own', body: 'Record shares, units, loan accounts and personal assets separately. Business assets may belong to an entity rather than to you personally.' },
      { title: 'Succession agreements', body: 'Shareholder, partnership or buy-sell arrangements may determine what happens on death and how an interest is valued or funded.' },
      { title: 'Operational continuity', body: 'Executors may need access to advisers and records, but should not receive passwords or informal authority that creates a security risk.' },
    ],
    checklist: ['Map the entities and interests you own', 'Locate shareholder, trust and buy-sell documents', 'Record key advisers and business contacts', 'Review insurance used for succession funding', 'Coordinate the business plan with your Will'],
    advice: 'Business succession is usually outside a simple template Will. Coordinate advice from an estate-planning solicitor, accountant and financial adviser before relying on a document update alone.',
    accent: '#f5f3ff',
    productStep: 'assets',
    sources: [],
  },
  {
    slug: 'receiving-inheritance',
    title: 'Receiving an inheritance',
    shortTitle: 'Receiving an inheritance',
    eyebrow: 'Assets',
    summary: 'Review how new wealth changes your estate, intentions, risks and record-keeping needs.',
    introduction: 'An inheritance can materially change the size and composition of your estate. Even if the people you want to benefit remain the same, fixed gifts and percentages may now produce different outcomes.',
    legalRule: 'An inherited asset that becomes your personal property forms part of your estate unless it is later held through an arrangement that passes outside the estate, such as joint tenancy or an applicable trust structure. A residuary gift generally captures property remaining after debts, expenses and specific gifts; a fixed-dollar gift does not increase merely because the estate becomes larger.',
    considerations: [
      { title: 'Balance between gifts', body: 'Check whether fixed amounts, specific assets and the residue still produce the balance you intended after the estate changed.' },
      { title: 'How the inheritance is held', body: 'Ownership, trusts, jointly held assets and superannuation can affect whether an asset is controlled by the Will.' },
      { title: 'New complexity', body: 'A larger estate can increase tax, asset-protection, family-provision and administration considerations that need professional input.' },
    ],
    checklist: ['Record the inherited assets and liabilities', 'Review fixed gifts and percentages', 'Check ownership and supporting documents', 'Update adviser and institution details', 'Consider whether the estate now needs professional review'],
    advice: 'Seek legal, tax and financial advice before restructuring inherited assets or making significant new gifts, particularly where trusts, overseas assets, vulnerable beneficiaries or family disputes are involved.',
    accent: '#f0fdfa',
    productStep: 'assets',
    sources: [],
  },
  {
    slug: 'moving-interstate',
    title: 'Moving interstate or overseas',
    shortTitle: 'Moving jurisdiction',
    eyebrow: 'Moving',
    summary: 'Check jurisdiction-specific documents, execution requirements and assets in more than one place.',
    introduction: 'A move does not necessarily invalidate an Australian Will, but succession, family-provision, appointment and signing rules are not identical everywhere. Overseas residence or assets can add another legal system.',
    legalRule: 'Moving from one Australian state or territory to another does not revoke a valid Will. The law governing administration, family-provision claims and certain assets can nevertheless change. Moving overseas or acquiring foreign property raises choice-of-law questions and can require coordinated Wills in more than one jurisdiction.',
    considerations: [
      { title: 'Applicable law', body: 'Your residence, domicile and the location of assets can affect which law applies. Update your address and obtain advice if more than one country is involved.' },
      { title: 'Appointments made under state law', body: 'Powers of attorney, guardianship and health documents are jurisdiction-specific and may need review after an interstate move.' },
      { title: 'Signing and storage', body: 'Use the execution requirements that apply when you sign and keep the original document accessible to the appropriate executor.' },
    ],
    checklist: ['Update your address and asset locations', 'Review state-based appointment documents', 'Check signing and witnessing instructions', 'Record overseas property or accounts', 'Tell an appropriate person where originals are stored'],
    advice: 'Obtain specialist advice when you live, hold assets or have beneficiaries in more than one country. Multiple Wills must be coordinated so one does not unintentionally revoke another.',
    accent: '#f8fafc',
    productStep: 'personal',
    sources: [WILLS_SOURCE],
  },
]

export function getLifeChange(slug: string) {
  return LIFE_CHANGES.find((event) => event.slug === slug)
}

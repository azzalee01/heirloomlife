import type { Metadata } from 'next'
import Link from 'next/link'
import LegalDocument, { type LegalSection } from '@/components/marketing/LegalDocument'

export const metadata: Metadata = {
  title: 'Privacy Policy | Heirloom Life',
  description: 'How Heirloom Life collects, uses, stores and discloses personal information.',
}

const sections: LegalSection[] = [
  {
    title: 'Scope and our commitment',
    content: <><p>This Privacy Policy explains how Heirloom Life Pty Ltd (Heirloom Life, we, us or our) handles personal information when you visit our website, create or update a Will, use the Living Vault or estate assistant, arrange witnessing, make a payment, contact us, or otherwise use our services.</p><p>We aim to manage personal information consistently with the Privacy Act 1988 (Cth) and the Australian Privacy Principles where they apply to us. This policy should be read with our <Link href="/terms">Terms of Service</Link> and any collection notice shown when information is collected.</p></>,
  },
  {
    title: 'Information we collect',
    content: <><p>Depending on how you use Heirloom Life, we may collect your name, contact details, date of birth, address, marital and family circumstances, account details, communications, subscription and transaction records, support requests, technical and usage information, and identity or verification information where reasonably required.</p><p>Estate-planning information may include your assets and liabilities, superannuation and insurance details, business or overseas interests, gifts, wishes, uploaded documents, Will drafts and versions, and information about executors, beneficiaries, guardians, children, partners, pets, witnesses and other people you name. Some information may be sensitive because of its nature or context.</p></>,
  },
  {
    title: 'Information about other people',
    content: <><p>You may provide personal information about another person when naming an executor, beneficiary, guardian, partner, child or witness. We collect that information indirectly from you to prepare documents, maintain your estate plan, coordinate witnessing or provide related services.</p><p>Only provide information you are authorised to share. Where reasonable, tell that person you have provided their information and direct them to this policy. Information about minors should be limited to what is reasonably necessary for estate planning.</p></>,
  },
  {
    title: 'How we collect information',
    content: <><p>We collect information directly when you enter it, upload a document, use the estate assistant, create an account, pay, join a witnessing session or contact us. We also collect information automatically through authentication cookies, server logs and security or diagnostic records.</p><p>We may receive limited information from service providers, such as authentication details from Supabase, transaction and customer references from Stripe, email-delivery status from Resend, and video-room or recording information from Daily. We do not receive or store your full payment-card number from Stripe.</p></>,
  },
  {
    title: 'Why we collect and use it',
    content: <><p>We use personal information to create and update your account and estate documents; save and display your information; provide AI-assisted drafting and amendments; assess template suitability and surface risk flags; process payments and subscriptions; coordinate witnessing; send service emails; provide support; protect accounts; prevent misuse; troubleshoot and improve the platform; keep required business records; and comply with law.</p><p>We may use de-identified or aggregated information for analytics, service improvement and research where it is no longer reasonably identifiable. We will not use identifiable Will content for unrelated advertising.</p></>,
  },
  {
    title: 'AI processing',
    content: <><p>When you use AI-assisted drafting, legal-risk triage or the estate assistant, relevant prompts, answers, Will content and conversation history may be sent to Anthropic to generate a response. This may include information about you and people named in your estate plan.</p><p>Use these features only if you are comfortable with that processing. AI output can be inaccurate and should be reviewed. We do not represent that information sent to an AI service is protected by legal professional privilege.</p></>,
  },
  {
    title: 'Who we disclose information to',
    content: <><p>We may disclose information to personnel and contractors who need it to operate the service; Supabase for database hosting and authentication; Anthropic for AI processing; Stripe for payments and subscriptions; Daily for video witnessing and recordings; Resend for transactional email; professional advisers, insurers and auditors; a solicitor you separately ask us to connect you with; and regulators, courts or law-enforcement bodies where authorised or required by law.</p><p>We may also disclose information with your direction or consent, including to a witness or another person through a link or sharing feature. If our business or assets are reorganised or transferred, information may be disclosed to advisers and a prospective or actual successor subject to appropriate confidentiality protections.</p></>,
  },
  {
    title: 'Overseas processing',
    content: <><p>Some providers are based overseas or operate global infrastructure, so personal information may be processed in the United States and other countries where those providers or their subprocessors operate. The precise locations can change over time.</p><p>Where the Australian Privacy Principles apply, we take reasonable steps appropriate to the circumstances before disclosing personal information overseas. Overseas privacy protections may differ from Australian law. Contact us if you want current information about provider locations relevant to your use of the service.</p></>,
  },
  {
    title: 'Cookies and technical data',
    content: <><p>We use cookies and similar browser storage that are necessary for login sessions, security, anonymous Will progress, preferences and core platform operation. Our servers and providers may record IP address, browser and device information, timestamps, referring pages, errors and feature interactions.</p><p>You can restrict cookies in your browser, but essential account and progress-saving features may then stop working. If we introduce non-essential advertising or analytics cookies, we will update our notices and provide choices where required.</p></>,
  },
  {
    title: 'Storage, security and retention',
    content: <><p>We use administrative, technical and organisational safeguards designed to protect personal information, including access controls and the security features provided by our hosting and service providers. No internet or storage system is completely secure, and we cannot guarantee absolute security.</p><p>We retain information while needed to provide the services, maintain Will and transaction history, resolve disputes, enforce agreements and meet legal, tax, accounting, fraud-prevention and backup requirements. Retention depends on the record and your relationship with us. When information is no longer required, we take reasonable steps to delete or de-identify it, subject to lawful exceptions and backup cycles.</p></>,
  },
  {
    title: 'Access, correction and deletion requests',
    content: <><p>You may ask for access to personal information we hold about you or request correction if it is inaccurate, out of date, incomplete, irrelevant or misleading. You may also ask us to close your account or delete information, although legal, security, backup and record-keeping obligations may require us to retain some records.</p><p>Send a request to <a href="mailto:hello@heirloomlife.com.au">hello@heirloomlife.com.au</a>. We may need to verify your identity. If we refuse a request where the law allows, we will generally explain why and available complaint options.</p></>,
  },
  {
    title: 'Service messages and direct marketing',
    content: <><p>We may send transactional messages needed to operate the service, such as login, resume, payment, document, security and witness-invitation emails. Where permitted, we may separately send information about Heirloom Life products or estate-planning resources.</p><p>You can opt out of marketing using the unsubscribe method in the message or by contacting us. Opting out of marketing does not stop essential service communications.</p></>,
  },
  {
    title: 'Privacy complaints and data incidents',
    content: <><p>Send privacy questions or complaints to <a href="mailto:hello@heirloomlife.com.au">hello@heirloomlife.com.au</a> with enough detail for us to investigate. We will acknowledge and respond within a reasonable period.</p><p>If you are not satisfied and the Privacy Act applies, you may complain to the Office of the Australian Information Commissioner at <a href="https://www.oaic.gov.au/privacy/privacy-complaints" rel="noreferrer">oaic.gov.au</a>. We assess suspected data breaches and make notifications where required by the Notifiable Data Breaches scheme.</p></>,
  },
  {
    title: 'Changes and contact',
    content: <><p>We may update this policy as our services, providers or legal obligations change. The current version will be published here with a revised effective date. We will provide additional notice of material changes where appropriate.</p><p>Contact Heirloom Life Pty Ltd at <a href="mailto:hello@heirloomlife.com.au">hello@heirloomlife.com.au</a>. You may request a copy of this policy in another reasonably available form.</p></>,
  },
]

export default function PrivacyPage() {
  return <LegalDocument eyebrow="Legal" title="Privacy Policy" summary="How Heirloom Life collects, uses, stores and discloses personal information, including estate-planning information about you and the people you name." effectiveDate="5 September 2026" notice={<>Estate information can be deeply personal. This policy identifies the service providers currently visible in our implementation and avoids unverified claims about hosting location or security certifications.</>} sections={sections} />
}

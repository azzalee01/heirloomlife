import type { Metadata } from 'next'
import Link from 'next/link'
import LegalDocument, { type LegalSection } from '@/components/marketing/LegalDocument'

export const metadata: Metadata = {
  title: 'Terms of Service | Heirloom Life',
  description: 'Terms governing access to and use of the Heirloom Life website, Will tools, Living Vault and related services.',
}

const sections: LegalSection[] = [
  {
    title: 'About these terms',
    content: <><p>These Terms of Service form an agreement between you and Heirloom Life Pty Ltd (Heirloom Life, we, us or our). They apply when you visit our website, create an account, prepare or update a Will, use the Living Vault, arrange a witnessing session, purchase a service, or otherwise use the Heirloom Life platform and related services.</p><p>By creating an account, purchasing a service, or continuing to use the platform, you agree to these terms and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the platform.</p></>,
  },
  {
    title: 'Eligibility and your authority',
    content: <><p>You must be at least 18, have legal capacity to enter this agreement, and use the platform for yourself. A Will maker must have testamentary capacity and act freely, without undue influence or duress.</p><p>You may help another person use the platform only with their knowledge and permission. The Will maker must review and understand their document and personally decide whether to sign it. You must be authorised to provide any information you enter about another person, including a beneficiary, executor, guardian or witness.</p></>,
  },
  {
    title: 'What Heirloom Life provides',
    content: <><p>Heirloom Life is a technology platform that helps users prepare template-based estate-planning documents from the information they provide. Features may include guided questions, document generation, plain-language guidance, amendment tools, AI-assisted drafting, document storage, subscription features and witnessing coordination.</p><p>Features described as coming soon, beta, optional, or available only in a particular jurisdiction are not part of the service until we make them available to you. We may improve, replace, limit or discontinue features on reasonable notice where practicable.</p></>,
  },
  {
    title: 'Not a law firm or legal adviser',
    content: <><p>Heirloom Life is not a law firm. Unless you separately retain an identified independent or partner solicitor under that solicitor&apos;s own engagement terms, we do not provide legal, financial or taxation advice and no lawyer-client relationship or legal professional privilege arises between you and Heirloom Life.</p><p>Our questions, guidance, automated checks, risk flags and AI-generated material are general information and document-automation tools. They do not consider every aspect of your circumstances and are not a substitute for advice from a qualified professional.</p></>,
  },
  {
    title: 'When a template Will may not be suitable',
    content: <><p>A template-based Will may not be suitable for every person or cover every eventuality. Obtain independent legal advice if you are unsure, and particularly where your circumstances involve a blended family, a potential family-provision claim, a person with disability or financial vulnerability, trusts, a self-managed super fund, business succession, overseas assets or domicile, customary law, questions about capacity, or any other complex arrangement.</p><p>A warning or risk flag does not identify every legal issue. The absence of a warning does not mean your Will is suitable or that legal advice is unnecessary.</p></>,
  },
  {
    title: 'Your information and responsibilities',
    content: <><p>You are responsible for providing complete, accurate and current information; checking names, relationships, gifts, shares and instructions; reviewing the generated document; and correcting errors before signing. You must update your Will when relevant laws or circumstances change.</p><p>You must follow all signing, witnessing and storage instructions that apply in your jurisdiction. A generated or downloaded document does not become an effective Will merely because it was created online. Validity depends on matters including capacity, intention, document content and correct execution. Keep the original signed document securely and tell an appropriate person where it can be found.</p></>,
  },
  {
    title: 'AI-assisted features',
    content: <><p>Some drafting, review and amendment features use artificial intelligence. AI output may be incomplete, inaccurate or unsuitable. You must review it before relying on it or applying a proposed change. Do not use the estate assistant for legal, financial, tax, medical or emergency advice.</p><p>We may send the information needed to perform an AI request, including relevant Will answers or document content, to our AI service provider. How we handle this information is explained in our Privacy Policy.</p></>,
  },
  {
    title: 'Accounts and acceptable use',
    content: <><p>Keep your login details confidential and notify us promptly if you suspect unauthorised access. You are responsible for activity through your account unless caused by our failure to use reasonable care.</p><p>You must not misuse the platform, interfere with its security or operation, upload malicious code, access another person&apos;s information without authority, scrape or reverse engineer the service except where law permits, use it to infringe rights or break the law, or resell it without our written permission. We may suspend access where reasonably necessary to protect users, comply with law, investigate misuse or address a material breach.</p></>,
  },
  {
    title: 'Prices, subscriptions and cancellation',
    content: <><p>Prices, billing periods and included features are shown before purchase and are in Australian dollars unless stated otherwise. Payments are processed by Stripe. A recurring Living Vault membership continues for the billing period shown at checkout until cancelled. Cancellation stops future renewals and access continues until the end of the paid period unless we tell you otherwise.</p><p>Nothing in these terms excludes rights or remedies that cannot lawfully be excluded, including under the Australian Consumer Law. Any refund policy is subject to those rights. Contact <a href="mailto:hello@heirloomlife.com.au">hello@heirloomlife.com.au</a> about billing, cancellation or a service that was not supplied as promised.</p></>,
  },
  {
    title: 'Third-party services and witnessing',
    content: <><p>The platform relies on third parties for hosting, authentication, payments, email, AI processing and video meetings. Their own terms and privacy practices may also apply. We are not responsible for third-party services beyond the extent required by law.</p><p>Witnessing availability and requirements vary by jurisdiction. You are responsible for ensuring each witness is eligible and that the signing process satisfies current law. A video session or recording does not by itself make a Will valid, and a recording is not a substitute for the original properly executed document.</p></>,
  },
  {
    title: 'Intellectual property and your content',
    content: <><p>We or our licensors own the platform, branding, software, templates and general content. We grant you a personal, limited, non-exclusive and non-transferable right to use the platform and documents generated for your own estate-planning purposes.</p><p>You retain rights in information and documents you upload. You give us and our service providers a limited licence to host, copy, process, adapt and transmit that content only as reasonably necessary to provide, secure and improve the services, comply with law, and exercise our rights under these terms.</p></>,
  },
  {
    title: 'Availability, disclaimers and liability',
    content: <><p>We use reasonable care in providing the platform but do not promise uninterrupted or error-free access, permanent availability of any feature, or that a generated document will be suitable for every circumstance or accepted without question by a court or other person.</p><p>To the maximum extent permitted by law, we exclude implied terms that may lawfully be excluded. Where a guarantee or liability cannot be excluded, our liability is limited only to the extent the law permits. We are not liable for loss caused by inaccurate or incomplete user information, failure to follow execution instructions, use after relevant circumstances or law change, unauthorised account use not caused by us, or reliance on general or AI-generated information as professional advice.</p></>,
  },
  {
    title: 'Ending access and preserving documents',
    content: <><p>You may stop using the service at any time and may ask us to close your account, subject to legal, billing, backup and record-retention requirements. Before cancelling or closing an account, download anything you need. We may terminate this agreement or access to the platform for a material breach, unlawful use, unacceptable security risk, or discontinuation of the service, giving reasonable notice where practicable.</p></>,
  },
  {
    title: 'Changes, governing law and contact',
    content: <><p>We may update these terms to reflect changes to the service, law or business practices. We will publish the revised terms and update the effective date. If a material change adversely affects a paid subscription, we will provide reasonable notice where practicable.</p><p>These terms are governed by the laws applicable to Heirloom Life in Australia. You and Heirloom Life submit to the non-exclusive jurisdiction of the Australian courts that have jurisdiction over this agreement. If a provision is unenforceable, it is severed only to the extent necessary and the remaining provisions continue.</p><p>Questions or notices may be sent to <a href="mailto:hello@heirloomlife.com.au">hello@heirloomlife.com.au</a>.</p></>,
  },
]

export default function TermsPage() {
  return <LegalDocument eyebrow="Legal" title="Terms of Service" summary="The terms that govern your use of the Heirloom Life website, Will tools, Living Vault and related services." effectiveDate="5 September 2026" sections={sections} />
}

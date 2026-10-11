import type { Metadata } from 'next'
import Link from 'next/link'
import { PRICING } from '@/src/lib/pricing'
import LegalDocument, { type LegalSection } from '@/components/marketing/LegalDocument'

export const metadata: Metadata = {
  title: 'Refund Policy | Heirloom Life',
  description: 'Our refund and returns policy for Will purchases and Unlimited Updates subscriptions.',
  alternates: { canonical: 'https://www.heirloomlife.com.au/refund-policy' },
  openGraph: {
    title: 'Refund Policy | Heirloom Life',
    description: 'Our refund and returns policy for Will purchases and Unlimited Updates subscriptions.',
    url: 'https://www.heirloomlife.com.au/refund-policy',
    siteName: 'Heirloom Life',
    type: 'website',
  },
}

const sections: LegalSection[] = [
  {
    title: 'Australian Consumer Law',
    content: (
      <p>
        Our services come with consumer guarantees under the Australian Consumer Law (ACL) that cannot be excluded. Nothing in this policy limits any right or remedy you have under the ACL. If a service is not supplied as promised, you may be entitled to a remedy — including a refund — under the ACL. To exercise those rights, contact us at{' '}
        <a href="mailto:hello@heirloomlife.com.au">hello@heirloomlife.com.au</a>.
      </p>
    ),
  },
  {
    title: 'The Will — one-off payment',
    content: (
      <>
        <p>
          The Will is a one-off payment of ${PRICING.willAud}. This covers preparation of your reviewed Will document and, for NSW addresses, one remote witnessing session.
        </p>
        <p>
          Because the Will document is generated and made available for download immediately on payment, we generally cannot offer a change-of-mind refund once you have downloaded your Will. If you have not yet downloaded your Will and wish to cancel, contact us within 7 days of purchase and we will assess your request.
        </p>
        <p>
          If there is a material error in your Will caused by a fault in our platform (not by information you provided), we will correct it at no charge or, if a correction is not possible, provide a full refund.
        </p>
      </>
    ),
  },
  {
    title: 'Unlimited Updates — annual subscription',
    content: (
      <>
        <p>
          Unlimited Updates is an optional subscription at ${PRICING.updatesAudPerYear} per year. You can cancel at any time from your dashboard. Cancelling stops future renewals; your access continues until the end of the current paid period, and you keep your completed Will and all versions.
        </p>
        <p>
          If you cancel within 14 days of a renewal charge and have not made any Will changes during that renewal period, contact us and we will refund the renewal payment in full.
        </p>
        <p>
          Refunds for renewals beyond 14 days are assessed on a case-by-case basis, taking into account your usage and the ACL.
        </p>
      </>
    ),
  },
  {
    title: 'Re-witnessing sessions',
    content: (
      <p>
        Re-witnessing sessions are non-refundable once the session has been completed. If a session could not proceed due to a fault on our end, we will provide a credit or reschedule at no charge.
      </p>
    ),
  },
  {
    title: 'How to request a refund',
    content: (
      <>
        <p>
          Email <a href="mailto:hello@heirloomlife.com.au">hello@heirloomlife.com.au</a> with your name, the email address used to purchase, and a description of the issue. We aim to respond within 2 business days.
        </p>
        <p>
          Approved refunds are returned to your original payment method via Stripe. Processing times depend on your card issuer (typically 5–10 business days).
        </p>
      </>
    ),
  },
  {
    title: 'Changes to this policy',
    content: (
      <p>
        We may update this policy from time to time. The current version is always available at{' '}
        <Link href="/refund-policy">heirloomlife.com.au/refund-policy</Link>. Changes do not affect purchases made before the update.
      </p>
    ),
  },
]

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Refund Policy"
      summary="When you can get a refund, how to request one, and your rights under the Australian Consumer Law."
      effectiveDate="7 October 2026"
      sections={sections}
    />
  )
}

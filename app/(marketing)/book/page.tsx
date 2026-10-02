import type { Metadata } from 'next'
import BookingFlow from './_components/BookingFlow'

export const metadata: Metadata = {
  title: 'Book a guided call | Heirloom Life',
  description:
    'Prefer to talk it through? Book a video call and we’ll walk you through your Will step by step, reading each question aloud.',
}

export default function BookPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--teal-deep)' }}>
        Guided call
      </p>
      <h1 className="mt-2 text-4xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        We’ll talk you through it.
      </h1>
      <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--mkt-stone)' }}>
        Book a video call and a member of our team will read each question aloud and help you enter your answers.
        It works on a phone, tablet or computer, and there’s nothing to install. We’ll email you a link to join.
      </p>
      <ul className="mt-5 space-y-2 text-base" style={{ color: 'var(--ink)' }}>
        <li>• You can bring a family member along if you’d like.</li>
        <li>• The call is recorded, with your agreement, so there’s an accurate record of how your Will was prepared.</li>
        <li>• Your guide can’t give legal advice. The choices are always yours.</li>
      </ul>

      <div className="mt-10">
        <BookingFlow />
      </div>
    </div>
  )
}

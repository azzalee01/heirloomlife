import type { Metadata } from 'next'
import BookingFlow from './_components/BookingFlow'

export const metadata: Metadata = {
  title: 'Book a guided call | Heirloom Life',
  description:
    "Prefer to talk it through? Book a video call and we’ll walk you through your Will step by step, reading each question aloud.",
}

export default function BookPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <p className="text-base font-semibold" style={{ color: 'var(--teal-deep)' }}>
        Guided call
      </p>
      <h1 className="mt-2 text-5xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        We&rsquo;ll talk you through it.
      </h1>
      <p className="mt-4 text-lg leading-relaxed" style={{ color: ‘var(--mkt-stone)’, maxWidth: ‘32rem’ }}>
        A member of our team walks you through your Will on video. We&rsquo;ll email you a link to join.
      </p>

      <div className="mt-12">
        <BookingFlow />
      </div>
    </div>
  )
}

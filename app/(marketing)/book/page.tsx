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
      <p className="mt-5 text-xl leading-relaxed" style={{ color: 'var(--mkt-stone)' }}>
        Book a video call and a member of our team will read each question aloud and help you enter your answers.
        It works on a phone, tablet or computer — nothing to install. We&rsquo;ll email you a link to join.
      </p>
      <ul className="mt-6 space-y-3">
        {[
          "You can bring a family member along if you’d like.",
          "The call is recorded, with your agreement, so there’s an accurate record of how your Will was prepared.",
          "Your guide can’t give legal advice. The choices are always yours.",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-lg" style={{ color: 'var(--ink)' }}>
            <span className="mt-1 shrink-0 text-base" style={{ color: 'var(--teal)' }}>&#10003;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <BookingFlow />
      </div>
    </div>
  )
}

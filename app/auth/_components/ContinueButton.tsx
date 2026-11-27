'use client'

import { useFormStatus } from 'react-dom'

// Submit button for the interstitial form. The parent <form action={...}> only
// fires its server action on this click (a user-initiated POST), so the token is
// never consumed by a GET pre-fetch.
export default function ContinueButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ backgroundColor: 'var(--teal)' }}
    >
      {pending ? 'One moment…' : label}
    </button>
  )
}

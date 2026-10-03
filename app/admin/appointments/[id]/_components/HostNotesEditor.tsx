'use client'

import { useRef, useState } from 'react'
import { saveHostNotes } from '../../_actions'

interface Props {
  appointmentId: string
  initialNotes: string | null
}

export function HostNotesEditor({ appointmentId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function save(value: string) {
    setSaved(false)
    setError(null)
    const r = await saveHostNotes(appointmentId, value)
    if (r.ok) {
      setSaved(true)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setSaved(false), 3000)
    } else {
      setError(r.error)
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={(e) => save(e.target.value)}
        rows={5}
        maxLength={5000}
        placeholder="Preparation notes, post-call summary, action items…"
        className="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
        style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => save(notes)}
          className="btn btn-secondary text-sm"
          style={{ height: 36 }}
        >
          Save notes
        </button>
        {saved && <span className="text-sm" style={{ color: 'var(--teal-deep)' }}>Saved</span>}
        {error && <span className="text-sm" style={{ color: '#b91c1c' }}>{error}</span>}
      </div>
    </div>
  )
}

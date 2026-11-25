'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProfileName, changeEmail } from '../_actions'

const inp =
  'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const btn =
  'px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed'

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null
  return (
    <p className="text-xs mt-2" role="status" style={{ color: m.ok ? 'var(--teal-deep)' : '#dc2626' }}>
      {m.text}
    </p>
  )
}

export default function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const router = useRouter()

  const [name, setName] = useState(initialName)
  const [nameBusy, setNameBusy] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault()
    setNameBusy(true)
    setNameMsg(null)
    const res = await saveProfileName(name)
    setNameBusy(false)
    if (res.ok) {
      setNameMsg({ ok: true, text: 'Saved.' })
      router.refresh()
    } else {
      setNameMsg({ ok: false, text: res.error ?? 'Could not save.' })
    }
  }

  async function onChangeEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailBusy(true)
    setEmailMsg(null)
    const res = await changeEmail(newEmail)
    setEmailBusy(false)
    if (res.ok) {
      setEmailMsg({ ok: true, text: `We've sent a confirmation link to ${newEmail.trim()}. Your email changes once you click it.` })
      setNewEmail('')
    } else {
      setEmailMsg({ ok: false, text: res.error ?? 'Could not change email.' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Name */}
      <form onSubmit={onSaveName}>
        <label htmlFor="full_name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
          Full name
        </label>
        <div className="flex gap-2">
          <input id="full_name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inp} autoComplete="name" />
          <button type="submit" disabled={nameBusy || name.trim() === initialName} className={btn} style={{ backgroundColor: 'var(--teal)' }}>
            {nameBusy ? 'Saving…' : 'Save'}
          </button>
        </div>
        <Msg m={nameMsg} />
      </form>

      {/* Email */}
      <form onSubmit={onChangeEmail}>
        <label htmlFor="new_email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
          Email address
        </label>
        <p className="text-xs mb-2" style={{ color: 'var(--neutral)' }}>
          Current: <span style={{ color: 'var(--ink)' }}>{email}</span>
        </p>
        <div className="flex gap-2">
          <input id="new_email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inp} placeholder="new@email.com" autoComplete="email" />
          <button type="submit" disabled={emailBusy || !newEmail.trim()} className={btn} style={{ backgroundColor: 'var(--teal)' }}>
            {emailBusy ? 'Sending…' : 'Change'}
          </button>
        </div>
        <Msg m={emailMsg} />
      </form>
    </div>
  )
}

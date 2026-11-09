'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPartner } from '../_actions'

const inp = 'w-full px-3 py-2 border text-sm outline-none focus:border-[var(--teal)] bg-white'
const lbl = 'block text-xs font-medium mb-1'

export default function NewPartnerForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function action(formData: FormData) {
    setSaving(true)
    setError(null)
    try {
      await createPartner(formData)
      formRef.current?.reset()
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form ref={formRef} action={action} className="rounded border bg-white p-4 space-y-3" style={{ borderColor: 'var(--line)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Add a partner charity</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={lbl} style={{ color: 'var(--ink)' }}>Charity name *</label>
          <input name="name" required className={inp} style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} placeholder="Royal Flying Doctor Service" />
        </div>
        <div>
          <label className={lbl} style={{ color: 'var(--ink)' }}>Verified ABN *</label>
          <input name="abn" required className={inp} style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} placeholder="XX XXX XXX XXX" />
          <p className="text-[11px] mt-1" style={{ color: 'var(--neutral)' }}>Verify against ACNC before adding — this goes into the Will.</p>
        </div>
        <div>
          <label className={lbl} style={{ color: 'var(--ink)' }}>Contact email</label>
          <input name="contact_email" type="email" className={inp} style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} placeholder="partnerships@charity.org.au" />
        </div>
        <div>
          <label className={lbl} style={{ color: 'var(--ink)' }}>Referral code</label>
          <input name="referral_code" className={inp} style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} placeholder="Auto-derived from name if blank" />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl} style={{ color: 'var(--ink)' }}>Logo URL</label>
          <input name="logo_url" type="url" className={inp} style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} placeholder="https://… (square logo works best)" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--ink)' }}>
        <input type="checkbox" name="active" defaultChecked className="w-4 h-4 accent-[var(--teal)]" />
        Active — show in the Will charity picker now
      </label>

      {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center px-4 py-2 rounded text-sm font-semibold disabled:opacity-60"
        style={{ background: 'var(--teal)', color: 'white' }}
      >
        {saving ? 'Adding…' : 'Add partner'}
      </button>
    </form>
  )
}

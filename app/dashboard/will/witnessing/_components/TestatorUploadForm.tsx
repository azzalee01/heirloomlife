'use client'

import { useState } from 'react'
import { submitTestatorUpload } from '@/src/lib/appointments/witnessing'

export default function TestatorUploadForm({ appointmentId }: { appointmentId: string }) {
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setUploading(true)
    const fd = new FormData(e.currentTarget)
    fd.append('appointmentId', appointmentId)
    const r = await submitTestatorUpload(fd)
    setUploading(false)
    if (!r.ok) return setError(r.error)
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded border p-6 text-center space-y-3" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.04)' }}>
        <p className="text-lg font-medium" style={{ color: 'var(--teal-deep)' }}>Upload received ✓</p>
        <p className="text-sm" style={{ color: 'var(--neutral)' }}>
          Your Heirloom guides will countersign your Will and you&apos;ll receive the fully executed document here shortly.
        </p>
        <a href="/dashboard/will" className="btn btn-primary inline-block mt-2">Back to your Will</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--ink)' }}>
          Your signed Will (PDF, JPG, or PNG — max 20 MB)
        </label>
        <input
          type="file"
          name="file"
          accept="application/pdf,image/jpeg,image/png"
          required
          disabled={uploading}
          className="block w-full text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
      )}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={uploading}
      >
        {uploading ? 'Uploading…' : 'Upload my signed Will'}
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--neutral)' }}>
        Your document is stored securely and only accessible to you and your Heirloom guide.
      </p>
    </form>
  )
}

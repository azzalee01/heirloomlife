'use client'

import { useState, useTransition } from 'react'
import {
  linkWillToAppointment,
  confirmTestatorSigned,
  uploadTestatorScan,
  uploadExecutedWill,
  getWitnessingDownloadUrl,
} from '@/src/lib/appointments/witnessing'
import { buildAvStatement } from '@/src/lib/appointments/constants'

interface Props {
  appointmentId: string
  witnessingStatus: string
  linkedWillId: string | null
  suggestedWillId: string | null   // pre-fetched from user's account
  testatorSignedAt: string | null
  witness1Name: string | null
  witness2Name: string | null
  hasTestatorUpload: boolean
  hasExecutedWill: boolean
  dailyRoomName: string | null
}

export default function WitnessingPanel({
  appointmentId,
  witnessingStatus,
  linkedWillId,
  suggestedWillId,
  testatorSignedAt,
  witness1Name,
  witness2Name,
  hasTestatorUpload,
  hasExecutedWill,
  dailyRoomName,
}: Props) {
  const [status, setStatus] = useState(witnessingStatus)
  const [willId, setWillId] = useState(suggestedWillId ?? linkedWillId ?? '')
  const [w1, setW1] = useState(witness1Name ?? '')
  const [w2, setW2] = useState(witness2Name ?? '')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const testatorUploadUrl = `${appUrl}/dashboard/will/witnessing?appt=${appointmentId}`

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 5000)
  }

  async function handleLinkWill() {
    setError(null)
    startTransition(async () => {
      const r = await linkWillToAppointment(appointmentId, willId.trim())
      if (!r.ok) return setError(r.error)
      setStatus('will_linked')
      showFlash('Will linked.')
    })
  }

  async function handleConfirmSigned() {
    setError(null)
    startTransition(async () => {
      const r = await confirmTestatorSigned(appointmentId, w1, w2)
      if (!r.ok) return setError(r.error)
      setStatus('testator_signed')
      showFlash('Witnessing confirmed. Ask the testator to upload their signed Will.')
    })
  }

  async function handleScanUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setUploading(true)
    const fd = new FormData(e.currentTarget)
    fd.append('appointmentId', appointmentId)
    const r = await uploadTestatorScan(fd)
    setUploading(false)
    if (!r.ok) return setError(r.error)
    setStatus('witnesses_signed')
    showFlash('Scan saved.')
  }

  async function handleExecutedUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setUploading(true)
    const fd = new FormData(e.currentTarget)
    fd.append('appointmentId', appointmentId)
    const r = await uploadExecutedWill(fd)
    setUploading(false)
    if (!r.ok) return setError(r.error)
    setStatus('executed')
    showFlash('Execution complete. Will marked as executed.')
  }

  async function handleDownload(bucket: 'witnessing-uploads' | 'executed-wills') {
    const r = await getWitnessingDownloadUrl(appointmentId, bucket)
    if (!r.ok) return setError(r.error)
    window.open(r.url, '_blank')
  }

  const avStatement = w1 && w2 && testatorSignedAt
    ? buildAvStatement(w1, w2, testatorSignedAt, dailyRoomName ? `Daily.co (room: ${dailyRoomName})` : 'audio-visual link')
    : null

  return (
    <section className="space-y-4">
      <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        Witnessing
      </h2>

      {/* Step indicator */}
      <ol className="flex flex-wrap gap-2 text-xs">
        {(['none', 'will_linked', 'testator_signed', 'witnesses_signed', 'executed'] as const).map((s, i) => {
          const labels = ['Link Will', 'Confirm signing', 'Testator uploads', 'Countersign', 'Executed']
          const done = ['none', 'will_linked', 'testator_signed', 'witnesses_signed', 'executed'].indexOf(status) > i
          const active = status === s
          return (
            <li key={s} className="flex items-center gap-1">
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: done ? 'var(--teal)' : active ? 'var(--teal-deep)' : 'var(--line)',
                  color: done || active ? '#fff' : 'var(--neutral)',
                }}
              >
                {done ? '✓' : i + 1}
              </span>
              <span style={{ color: active ? 'var(--ink)' : done ? 'var(--teal-deep)' : 'var(--neutral)' }}>
                {labels[i]}
              </span>
              {i < 4 && <span style={{ color: 'var(--line)' }}>›</span>}
            </li>
          )
        })}
      </ol>

      {/* Step 1 — Link Will */}
      {status === 'none' && (
        <div className="space-y-3 border p-4" style={{ borderColor: 'var(--line)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Link the testator&apos;s Will to this session</p>
          {suggestedWillId && (
            <p className="text-xs" style={{ color: 'var(--neutral)' }}>
              Found will for this user: <code className="font-mono">{suggestedWillId}</code>
            </p>
          )}
          <input
            type="text"
            value={willId}
            onChange={(e) => setWillId(e.target.value)}
            placeholder="Will ID (UUID)"
            className="w-full border px-3 py-2 text-sm font-mono outline-none focus:border-[var(--teal)]"
            style={{ borderColor: 'var(--line)' }}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!willId.trim() || isPending}
            onClick={handleLinkWill}
          >
            {isPending ? 'Linking…' : 'Link Will'}
          </button>
        </div>
      )}

      {/* Step 2 — Confirm signing */}
      {status === 'will_linked' && (
        <div className="space-y-3 border p-4" style={{ borderColor: 'var(--line)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Will linked <span style={{ color: 'var(--teal)' }}>✓</span></p>
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            Once the testator has signed all pages on camera in the presence of both witnesses, confirm below.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--neutral)' }}>Witness 1 — full legal name</label>
              <input
                type="text"
                value={w1}
                onChange={(e) => setW1(e.target.value)}
                placeholder="e.g. Jane Anne Smith"
                className="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
                style={{ borderColor: 'var(--line)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--neutral)' }}>Witness 2 — full legal name</label>
              <input
                type="text"
                value={w2}
                onChange={(e) => setW2(e.target.value)}
                placeholder="e.g. Mark James Lee"
                className="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
                style={{ borderColor: 'var(--line)' }}
              />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink)' }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            Both witnesses confirm: we were both present at the same time and observed the testator sign every page of their Will in real time on this call.
          </label>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!w1.trim() || !w2.trim() || !confirmed || isPending}
            onClick={handleConfirmSigned}
          >
            {isPending ? 'Confirming…' : 'Confirm witnessing'}
          </button>
        </div>
      )}

      {/* Step 3 — Testator uploads */}
      {status === 'testator_signed' && (
        <div className="space-y-4 border p-4" style={{ borderColor: 'var(--line)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Signing confirmed <span style={{ color: 'var(--teal)' }}>✓</span>
            {testatorSignedAt && (
              <span className="ml-2 font-normal text-xs" style={{ color: 'var(--neutral)' }}>
                {new Date(testatorSignedAt).toLocaleString('en-AU', { timeZone: 'Australia/Sydney', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </p>

          {(witness1Name || w1) && (witness2Name || w2) && (
            <p className="text-sm" style={{ color: 'var(--neutral)' }}>
              Witnesses: <strong style={{ color: 'var(--ink)' }}>{witness1Name || w1}</strong> and <strong style={{ color: 'var(--ink)' }}>{witness2Name || w2}</strong>
            </p>
          )}

          <div className="rounded border p-3 text-sm" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.05)' }}>
            <p className="mb-1 font-medium" style={{ color: 'var(--teal-deep)' }}>Send this link to the testator:</p>
            <code className="break-all text-xs" style={{ color: 'var(--ink)' }}>{testatorUploadUrl}</code>
            <button
              type="button"
              className="mt-2 block text-xs underline"
              style={{ color: 'var(--teal-deep)' }}
              onClick={() => { void navigator.clipboard.writeText(testatorUploadUrl); showFlash('Link copied.') }}
            >
              Copy link
            </button>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer" style={{ color: 'var(--neutral)' }}>Or upload the scan here (if testator emails it)</summary>
            <form onSubmit={handleScanUpload} className="mt-3 space-y-2">
              <input type="file" name="file" accept="application/pdf,image/jpeg,image/png" required className="block text-sm" />
              <button type="submit" className="btn btn-secondary" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload scan'}
              </button>
            </form>
          </details>
        </div>
      )}

      {/* Step 4 — Countersign + upload */}
      {status === 'witnesses_signed' && (
        <div className="space-y-4 border p-4" style={{ borderColor: 'var(--line)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Signed scan received <span style={{ color: 'var(--teal)' }}>✓</span>
          </p>

          {hasTestatorUpload && (
            <button
              type="button"
              className="btn btn-secondary text-sm"
              onClick={() => handleDownload('witnessing-uploads')}
            >
              Download testator&apos;s signed scan
            </button>
          )}

          {avStatement && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                s14G ETA statement — print and include with countersigned document
              </p>
              <pre className="whitespace-pre-wrap rounded border p-3 text-xs leading-relaxed" style={{ borderColor: 'var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}>
                {avStatement}
              </pre>
              <button
                type="button"
                className="text-xs underline"
                style={{ color: 'var(--teal-deep)' }}
                onClick={() => { void navigator.clipboard.writeText(avStatement); showFlash('Statement copied.') }}
              >
                Copy statement
              </button>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Upload countersigned document</p>
            <p className="text-xs" style={{ color: 'var(--neutral)' }}>
              Print the testator&apos;s scan, both witnesses sign it + add the s14G statement above, then scan and upload here.
            </p>
            <form onSubmit={handleExecutedUpload} className="space-y-2">
              <input type="file" name="file" accept="application/pdf" required className="block text-sm" />
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload executed Will'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 5 — Executed */}
      {status === 'executed' && (
        <div className="space-y-3 border p-4" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.04)' }}>
          <p className="font-medium" style={{ color: 'var(--teal-deep)' }}>Will executed ✓</p>
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            The executed Will has been stored. The testator can download it from their dashboard.
          </p>
          {hasExecutedWill && (
            <button type="button" className="btn btn-secondary text-sm" onClick={() => handleDownload('executed-wills')}>
              Download executed Will
            </button>
          )}
        </div>
      )}

      {flash && <p role="status" className="text-sm" style={{ color: 'var(--teal-deep)' }}>{flash}</p>}
      {error && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>}
    </section>
  )
}

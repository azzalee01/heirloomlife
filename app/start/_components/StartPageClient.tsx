'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import WillWizard from '@/app/will/new/_components/WillWizard'
import type { WillFormData } from '@/app/will/new/_types'
import { EMPTY_WILL_FORM_DATA } from '@/app/will/new/_data'
import { setPartnerCodeCookie } from '@/app/actions/partner'

const UploadWillModal = dynamic(() => import('@/components/UploadWillModal'), { ssr: false })

function mergeExtracted(
  base: WillFormData,
  extracted: Record<string, unknown>,
): { merged: WillFormData; extractedFields: Set<string> } {
  const merged: WillFormData = JSON.parse(JSON.stringify(base))
  const fields = new Set<string>()

  function applyPartial(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
    prefix: string,
    skipKeys?: string[],
  ) {
    for (const [k, v] of Object.entries(source)) {
      if (skipKeys?.includes(k)) continue
      if (v === null || v === undefined || v === '') continue
      target[k] = v
      fields.add(`${prefix}.${k}`)
    }
  }

  const pd = extracted.personalDetails as Record<string, unknown> | null
  if (pd) applyPartial(merged.personalDetails as unknown as Record<string, unknown>, pd, 'personalDetails')

  const sd = extracted.spouseDetails as Record<string, unknown> | null
  if (sd) applyPartial(merged.spouseDetails as unknown as Record<string, unknown>, sd, 'spouseDetails')

  const cd = extracted.childrenData as Record<string, unknown> | null
  if (cd) {
    if (cd.hasChildren) { (merged.childrenData as unknown as Record<string, unknown>).hasChildren = cd.hasChildren; fields.add('childrenData.hasChildren') }
    const children = cd.children as unknown[] | undefined
    if (children && children.length > 0) {
      merged.childrenData.children = (children as Record<string, unknown>[]).map(c => ({
        id: crypto.randomUUID(),
        name: String(c.name ?? ''),
        dateOfBirth: String(c.dateOfBirth ?? ''),
        isDependent: Boolean(c.isDependent),
      }))
      fields.add('childrenData.children')
    }
    const g = cd.guardian as Record<string, unknown> | null
    if (g) {
      applyPartial(merged.childrenData.guardian as unknown as Record<string, unknown>, g, 'childrenData.guardian')
      fields.add('childrenData.guardian')
    }
  }

  const ed = extracted.executorsData as Record<string, unknown> | null
  if (ed) {
    const primary = ed.primary as Record<string, unknown> | null
    if (primary) applyPartial(merged.executorsData.primary as unknown as Record<string, unknown>, primary, 'executorsData.primary')
    if (ed.hasAlternate) {
      merged.executorsData.hasAlternate = true
      const alt = ed.alternate as Record<string, unknown> | null
      if (alt) applyPartial(merged.executorsData.alternate as unknown as Record<string, unknown>, alt, 'executorsData.alternate')
    }
  }

  const bd = extracted.beneficiariesData as Record<string, unknown> | null
  if (bd) {
    const people = bd.people as Record<string, unknown>[] | undefined
    if (people && people.length > 0) {
      merged.beneficiariesData.people = people.map(p => ({
        id: crypto.randomUUID(),
        name: String(p.name ?? ''),
        relationship: String(p.relationship ?? ''),
        percentage: String(p.percentage ?? ''),
        substituteBeneficiary: '',
      }))
      fields.add('beneficiariesData.people')
    }
    const charities = bd.charities as Record<string, unknown>[] | undefined
    if (charities && charities.length > 0) {
      merged.beneficiariesData.charities = charities.map(c => ({
        id: crypto.randomUUID(),
        name: String(c.name ?? ''),
        abn: String(c.abn ?? ''),
        percentage: String(c.percentage ?? ''),
        substituteBeneficiary: '',
      }))
      fields.add('beneficiariesData.charities')
    }
  }

  const gifts = extracted.specificGifts as Record<string, unknown>[] | undefined
  if (gifts && gifts.length > 0) {
    merged.specificGifts = gifts.map(g => ({
      id: crypto.randomUUID(),
      type: (g.type === 'cash' ? 'cash' : 'item') as 'item' | 'cash',
      description: String(g.description ?? ''),
      amount: String(g.amount ?? ''),
      recipientName: String(g.recipientName ?? ''),
      recipientRelationship: String(g.recipientRelationship ?? ''),
      substituteBeneficiary: '',
    }))
    fields.add('specificGifts')
  }

  return { merged, extractedFields: fields }
}

interface Props {
  serverFormData: WillFormData
  isAuthenticated: boolean
  hasWillAccess: boolean
  autoOpenUpload?: boolean
  partnerCode?: string | null
}

export default function StartPageClient({ serverFormData, isAuthenticated, hasWillAccess, autoOpenUpload, partnerCode }: Props) {
  const [showUploadModal, setShowUploadModal] = useState(autoOpenUpload ?? false)
  const [uploadMode, setUploadMode] = useState(false)
  const [formData, setFormData] = useState<WillFormData>(serverFormData)
  const [extractedFields, setExtractedFields] = useState<Set<string>>(new Set())
  const [wizardKey, setWizardKey] = useState('initial')
  const [discountApplied, setDiscountApplied] = useState(false)

  useEffect(() => {
    if (autoOpenUpload) setShowUploadModal(true)
  }, [autoOpenUpload])

  useEffect(() => {
    if (!partnerCode) return
    setPartnerCodeCookie(partnerCode).then(() => setDiscountApplied(true))
  }, [partnerCode])

  function handleUploadComplete(result: { extractedData: Record<string, unknown>; extractedFields: string[] }) {
    const base = serverFormData.willId ? serverFormData : { ...EMPTY_WILL_FORM_DATA }
    const { merged, extractedFields: fields } = mergeExtracted(base, result.extractedData)
    setFormData(merged)
    setExtractedFields(fields)
    setUploadMode(true)
    setWizardKey('uploaded-' + Date.now())
    setShowUploadModal(false)
  }

  return (
    <>
      {/* Partner discount banner */}
      {discountApplied && (
        <div style={{
          background: 'var(--teal-pale, #e6f7f5)',
          border: '1px solid var(--teal-mid, #5bbfb5)',
          borderRadius: 8,
          padding: '.75rem 1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '.9rem',
          color: 'var(--teal-deep)',
          fontWeight: 500,
        }}>
          Your partner discount has been applied. You'll save $40 at checkout.
        </div>
      )}

      {/* Mode choice — only shown when no existing Will data and not yet in upload mode */}
      {!uploadMode && !serverFormData.willId && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.05, letterSpacing: '-.01em',
            color: 'var(--mkt-ink-text)', margin: '0 0 .75rem',
          }}>
            Create your Will
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '30rem', marginInline: 'auto', marginBottom: '1.5rem' }}>
            Your answers are saved at every step. Take your time.
          </p>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '.82rem', color: 'var(--mkt-stone)' }}>
              Already have a Will?{' '}
              <button
                onClick={() => setShowUploadModal(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal-deep)', fontWeight: 600, fontSize: '.82rem', textDecoration: 'underline', padding: 0 }}
              >
                Upload it and we&apos;ll pre-fill your details.
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Upload-mode heading */}
      {uploadMode && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.05, letterSpacing: '-.01em',
            color: 'var(--mkt-ink-text)', margin: '0 0 .75rem',
          }}>
            Your Will, imported
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '32rem', marginInline: 'auto' }}>
            We&apos;ve pre-filled what we could find. Review and confirm every step — nothing becomes part of your new Will until you do.
          </p>
        </div>
      )}

      {/* Existing-Will heading (returning user with saved data) */}
      {!uploadMode && serverFormData.willId && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.05, letterSpacing: '-.01em',
            color: 'var(--mkt-ink-text)', margin: '0 0 .75rem',
          }}>
            Create your Will
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '30rem', marginInline: 'auto' }}>
            Your answers are saved at every step. Take your time.
          </p>
        </div>
      )}

      {/* Wizard card */}
      <div style={{ background: '#fff', border: '1px solid var(--mkt-line)', borderRadius: 12, overflow: 'hidden' }}>
        <WillWizard
          key={wizardKey}
          initialData={formData}
          isAuthenticated={isAuthenticated}
          hasWillAccess={hasWillAccess}
          extractedFields={extractedFields.size > 0 ? extractedFields : undefined}
        />
      </div>

      {showUploadModal && (
        <UploadWillModal
          onClose={() => setShowUploadModal(false)}
          onComplete={handleUploadComplete}
        />
      )}
    </>
  )
}

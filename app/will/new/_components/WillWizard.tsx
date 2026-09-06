'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { saveStep, completeWill, storeAnonEmail } from '../_actions'
import { renderWillText } from '../_render'
import {
  type WillFormData,
  type StepId,
  type PersonalDetails,
  type SpouseDetails,
  type ChildrenData,
  type ExecutorsData,
  type Asset,
  type BeneficiariesData,
  type SpecificGift,
  type TriageFlags,
  type WizardStepId,
  STEP_IDS,
  STEP_LABELS,
} from '../_types'
import dynamic from 'next/dynamic'
import ProgressBar from './ProgressBar'
import HelpPanel from './HelpPanel'

const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), { ssr: false })
import StepEligibility from './StepEligibility'
import StepPersonalDetails from './StepPersonalDetails'
import StepSpouseDetails from './StepSpouseDetails'
import StepChildren from './StepChildren'
import StepExecutors from './StepExecutors'
import StepAssets from './StepAssets'
import StepBeneficiaries from './StepBeneficiaries'
import StepBeneficiaryBackup from './StepBeneficiaryBackup'
import StepSpecificGifts from './StepSpecificGifts'
import StepWishes from './StepWishes'
import StepReview from './StepReview'
import PersonalWishes from './PersonalWishes'

// ── Step sequence helpers ────────────────────────────────────────────────────

function baseStepsFor(maritalStatus: string): StepId[] {
  return STEP_IDS.filter(
    (s) => s !== 'spouse' || maritalStatus === 'married' || maritalStatus === 'domestic_partner'
  )
}

// Build the full wizard step sequence, injecting per-beneficiary backup screens
// between 'beneficiaries' and 'gifts'.
function buildWizardSteps(form: WillFormData): WizardStepId[] {
  const base = baseStepsFor(form.personalDetails.maritalStatus)
  const benefIdx = base.indexOf('beneficiaries')
  if (benefIdx === -1 || form.beneficiariesData.people.length === 0) return base

  const backupSteps: WizardStepId[] = form.beneficiariesData.people.map(
    (_, i) => `backup_${i}` as WizardStepId
  )
  return [
    ...base.slice(0, benefIdx + 1),
    ...backupSteps,
    ...base.slice(benefIdx + 1),
  ]
}

function labelFor(stepId: WizardStepId, form: WillFormData): string {
  if (typeof stepId === 'string' && stepId.startsWith('backup_')) {
    const idx = parseInt(stepId.split('_')[1])
    const name = form.beneficiariesData.people[idx]?.name ?? 'Beneficiary'
    return `Backup for ${name}`
  }
  return STEP_LABELS[stepId as StepId] ?? stepId
}

// ── Allocation helper ─────────────────────────────────────────────────────────

function totalAllocated(bd: BeneficiariesData): number {
  return (
    bd.people.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0) +
    bd.charities.reduce((s, c) => s + (parseFloat(c.percentage) || 0), 0)
  )
}


// ── Soft email capture (shown once after personal details) ───────────────────

function EmailCapture({ onSubmit, onSkip }: { onSubmit: (email: string) => void; onSkip: () => void }) {
  const [email, setEmail] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white max-w-sm w-full p-6 space-y-4 shadow-xl">
        <div>
          <p className="text-base font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            Save a link to your progress
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
            Enter your email and we&apos;ll send you a link to resume your Will from any device. No account needed yet.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-3 py-2.5 border border-[var(--line)] text-sm outline-none focus:border-[var(--teal)]"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && email) onSubmit(email) }}
          />
          <button
            type="button"
            disabled={!email}
            onClick={() => onSubmit(email)}
            className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--teal)' }}
          >
            Send
          </button>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs"
          style={{ color: 'var(--neutral)' }}
        >
          Skip for now  -  I&apos;ll continue without a link
        </button>
      </div>
    </div>
  )
}

// ── Download gate for anonymous users ────────────────────────────────────────

function AnonDownloadGate() {
  return (
    <div className="text-center space-y-4 py-4">
      <div
        className="w-12 h-12 mx-auto flex items-center justify-center"
        style={{ background: 'var(--teal-light)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Create a free account to download your Will
        </p>
        <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: 'var(--neutral)' }}>
          Your progress is saved. Creating an account takes under a minute  -  then you can download, store, and manage your Will.
        </p>
      </div>
      <Link
        href="/auth/signup?next=/will/new&migrate=1"
        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white"
        style={{ backgroundColor: 'var(--teal)' }}
      >
        Create account &amp; download
      </Link>
      <p className="text-xs" style={{ color: 'var(--neutral)' }}>
        Already have an account?{' '}
        <Link href="/auth/login?next=/will/new" className="font-medium" style={{ color: 'var(--teal)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────────────────────

interface Props {
  initialData: WillFormData
  initialStep?: StepId
  isAuthenticated: boolean
  hasWillAccess?: boolean
  extractedFields?: Set<string>
}

export default function WillWizard({ initialData, initialStep, isAuthenticated, hasWillAccess = false, extractedFields }: Props) {
  const [form, setForm] = useState<WillFormData>(initialData)
  const [wizardSteps, setWizardSteps] = useState<WizardStepId[]>(() =>
    buildWizardSteps(initialData)
  )
  const [stepIndex, setStepIndex] = useState(() => {
    if (!initialStep) return 0
    const steps = buildWizardSteps(initialData)
    const idx = steps.indexOf(initialStep)
    return idx >= 0 ? idx : 0
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [emailCaptured, setEmailCaptured] = useState(false)
  const [showDownloadGate, setShowDownloadGate] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState<'will' | 'vault' | null>(null)
  const [stepKey, setStepKey] = useState(0)
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right')

  const pendingSaveRef = useRef<Promise<string> | null>(null)
  const contentScrollRef = useRef<HTMLDivElement>(null)

  function scrollContentToTop() {
    contentScrollRef.current?.scrollTo({ top: 0 })
  }

  const willPreviewText = useMemo(() => {
    if (!showCompletion || hasWillAccess) return ''
    const sections = renderWillText(form).split('\n\n')
    return sections.slice(0, Math.ceil(sections.length / 2)).join('\n\n')
  }, [showCompletion, hasWillAccess, form])

  const currentStepId = wizardSteps[stepIndex]
  const isBackupStep = typeof currentStepId === 'string' && currentStepId.startsWith('backup_')
  const backupIndex = isBackupStep ? parseInt((currentStepId as string).split('_')[1]) : -1
  const currentStaticStep: StepId = isBackupStep ? 'beneficiaries' : (currentStepId as StepId)

  const isFirst = stepIndex === 0
  const isLast = currentStaticStep === 'review'
  const isEligibilityStep = currentStaticStep === 'eligibility'

  // Eligibility check  -  must have selected a state and be 18+
  const eligibilityState = form.personalDetails.state
  const eligibilityDob = form.personalDetails.dateOfBirth
  const ageOk = (() => {
    if (!eligibilityDob) return false
    const today = new Date()
    const birth = new Date(eligibilityDob)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age >= 18
  })()
  const canPassEligibility = !!eligibilityState && ageOk

  // Beneficiary total for validation
  const benefTotal = totalAllocated(form.beneficiariesData)

  function update<K extends keyof WillFormData>(key: K, value: WillFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      setWizardSteps(buildWizardSteps(next))
      return next
    })
  }

  async function handleNext() {
    // Eligibility step: no DB save, just validate and advance
    if (isEligibilityStep) {
      if (!canPassEligibility) return
      setSlideDir('right')
      setStepKey(k => k + 1)
      setStepIndex((i) => Math.min(i + 1, wizardSteps.length - 1))
      scrollContentToTop()
      return
    }

    // Beneficiaries: block if not 100%
    if (currentStaticStep === 'beneficiaries' && benefTotal !== 100) {
      setError('Allocations must total exactly 100% before continuing.')
      return
    }

    setError(null)
    const nextIndex = Math.min(stepIndex + 1, wizardSteps.length - 1)

    // First save: must block to obtain the willId before we can save anything else
    if (!form.willId) {
      setSaving(true)
      try {
        const willId = await saveStep(null, currentStaticStep, form)
        setForm((prev) => ({ ...prev, willId }))
        setSlideDir('right')
        setStepKey(k => k + 1)
        setStepIndex(nextIndex)
        scrollContentToTop()
        if (!isAuthenticated && !emailCaptured && currentStaticStep === 'personal') {
          setShowEmailCapture(true)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
      } finally {
        setSaving(false)
      }
      return
    }

    // willId exists — advance instantly, save in the background
    setSlideDir('right')
    setStepKey(k => k + 1)
    setStepIndex(nextIndex)
    scrollContentToTop()
    if (!isAuthenticated && !emailCaptured && currentStaticStep === 'personal') {
      setShowEmailCapture(true)
    }

    pendingSaveRef.current = saveStep(form.willId, currentStaticStep, form)
    pendingSaveRef.current.catch((e) => {
      setError(e instanceof Error ? e.message : 'Your progress may not have saved. Please try again.')
    })
  }

  function handleBack() {
    setError(null)
    setSlideDir('left')
    setStepKey(k => k + 1)
    setStepIndex((i) => Math.max(0, i - 1))
    scrollContentToTop()
  }

  async function handleComplete() {
    // Anonymous users must create an account before downloading
    if (!isAuthenticated) {
      setShowDownloadGate(true)
      return
    }
    if (!form.willId) return
    setSaving(true)
    setError(null)
    try {
      // Ensure any in-flight background save finishes before we finalise
      if (pendingSaveRef.current) await pendingSaveRef.current
      await completeWill(form.willId)
      setShowCompletion(true)
      scrollContentToTop()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete will. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleWillCheckout() {
    setCheckoutProduct('will')
  }

  function handleVaultCheckout() {
    setCheckoutProduct('vault')
  }

  function jumpToIndex(idx: number) {
    if (idx >= 0 && idx < wizardSteps.length) {
      setError(null)
      setSlideDir(idx < stepIndex ? 'left' : 'right')
      setStepKey(k => k + 1)
      setStepIndex(idx)
      scrollContentToTop()
    }
  }

  function jumpToStep(stepId: StepId) {
    jumpToIndex(wizardSteps.indexOf(stepId))
  }

  async function handleEmailSubmit(email: string) {
    setShowEmailCapture(false)
    setEmailCaptured(true)
    try {
      await storeAnonEmail(email)
    } catch {
      // Non-critical  -  don't surface this error
    }
  }

  // Step labels for progress bar (collapse backup steps under "Beneficiaries")
  const progressSteps = wizardSteps
    .filter((s) => !s.startsWith('backup_'))
    .map((s) => labelFor(s, form))
  const progressIndex = wizardSteps
    .slice(0, stepIndex + 1)
    .filter((s) => !s.startsWith('backup_')).length - 1

  const saveLabel = saving
    ? (isLast ? 'Completing…' : 'Saving…')
    : isEligibilityStep
    ? 'Continue'
    : (isLast ? 'Complete Will' : 'Save & Continue')

  const canAdvance = isEligibilityStep ? canPassEligibility : true

  return (
    <>
    <div className="h-full flex flex-col">
      {/* Email capture overlay */}
      {showEmailCapture && (
        <EmailCapture
          onSubmit={handleEmailSubmit}
          onSkip={() => { setShowEmailCapture(false); setEmailCaptured(true) }}
        />
      )}

      {/* Upload-mode notice */}
      {extractedFields && extractedFields.size > 0 && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '.55rem 1.5rem', fontSize: '.8rem', color: '#78350f', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          Fields marked <strong style={{ fontWeight: 700 }}>from your uploaded Will</strong> are pre-filled. Review and confirm every step — nothing is submitted automatically.
        </div>
      )}

      {/* Header — desktop only */}
      <div
        className="hidden sm:flex shrink-0 border-b px-6 h-14 items-center justify-between"
        style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
      >
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
          My Will
        </h1>
        {isAuthenticated ? (
          <Link href="/dashboard" className="btn btn-secondary btn-sm">
            Save &amp; exit
          </Link>
        ) : (
          <Link href="/" className="text-sm" style={{ color: 'var(--neutral)' }}>
            ← Back to Heirloom
          </Link>
        )}
      </div>

      {/* Mobile progress row — pinned below the viewport header */}
      <div className="sm:hidden shrink-0 px-4 pt-3 pb-3" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
          <div className="flex items-center gap-3">
            <Link
              href={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center justify-center w-10 h-10 rounded-full -ml-2 hover:bg-[var(--paper-warm)] active:bg-[var(--teal-light)] transition-colors"
              aria-label={isAuthenticated ? 'Save & exit' : 'Back to Heirloom'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div className="flex flex-1 items-center gap-0.5">
              {progressSteps.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 transition-all duration-300"
                  style={{ background: i <= progressIndex ? 'var(--teal)' : 'var(--line)' }}
                />
              ))}
            </div>
            <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--neutral)' }}>
              {progressIndex + 1}/{progressSteps.length}
            </span>
          </div>
          <p className="text-sm font-semibold mt-2 ml-1" style={{ color: 'var(--ink)' }}>
            {progressSteps[Math.max(0, progressIndex)]}
          </p>
      </div>

      {/* Scrollable step content */}
      <div ref={contentScrollRef} className="flex-1 overflow-y-auto" style={{ background: 'var(--paper-warm)' }}>
        <div className="max-w-5xl mx-auto sm:px-6 sm:py-7">
          {/* Desktop progress returns to the natural page flow. */}
          <div className="hidden sm:block">
            <ProgressBar
              steps={progressSteps}
              currentIndex={Math.max(0, progressIndex)}
              onStepClick={(i) => {
                const nonBackup = wizardSteps
                  .map((s, idx) => ({ s, idx }))
                  .filter(({ s }) => !s.startsWith('backup_'))
                const target = nonBackup[i]
                if (target && target.idx < stepIndex) jumpToIndex(target.idx)
              }}
            />
          </div>

          <div className="flex gap-8 items-start sm:mt-6">
            <div className="flex-1 min-w-0">

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border-b border-red-100 px-5 py-3 sm:border sm:mb-4">
                  {error}
                </div>
              )}

              {/* Step card — borderless full-bleed on mobile, framed on sm+ */}
              <div
                key={stepKey}
                className={`bg-[var(--paper)] px-5 py-6 sm:border sm:border-[var(--line)] sm:rounded-[10px] sm:overflow-hidden sm:px-8 sm:py-8${stepKey > 0 ? ` step-enter-${slideDir}` : ''}`}
              >

                {isEligibilityStep && (
                  <StepEligibility
                    state={form.personalDetails.state}
                    dateOfBirth={form.personalDetails.dateOfBirth}
                    onStateChange={(state) =>
                      setForm((prev) => ({
                        ...prev,
                        personalDetails: { ...prev.personalDetails, state },
                      }))
                    }
                    onDobChange={(dateOfBirth) =>
                      setForm((prev) => ({
                        ...prev,
                        personalDetails: { ...prev.personalDetails, dateOfBirth },
                      }))
                    }
                  />
                )}

                {currentStaticStep === 'personal' && (
                  <StepPersonalDetails
                    data={form.personalDetails}
                    onChange={(personalDetails: PersonalDetails) => update('personalDetails', personalDetails)}
                    extractedFields={extractedFields}
                  />
                )}
                {currentStaticStep === 'spouse' && (
                  <StepSpouseDetails
                    data={form.spouseDetails}
                    onChange={(spouseDetails: SpouseDetails) => update('spouseDetails', spouseDetails)}
                    maritalStatus={form.personalDetails.maritalStatus}
                    extractedFields={extractedFields}
                  />
                )}
                {currentStaticStep === 'children' && (
                  <StepChildren
                    data={form.childrenData}
                    onChange={(childrenData: ChildrenData) => update('childrenData', childrenData)}
                    extractedFields={extractedFields}
                  />
                )}
                {currentStaticStep === 'executors' && (
                  <StepExecutors
                    data={form.executorsData}
                    onChange={(executorsData: ExecutorsData) => update('executorsData', executorsData)}
                    extractedFields={extractedFields}
                  />
                )}
                {currentStaticStep === 'assets' && (
                  <StepAssets
                    data={form.assets}
                    onChange={(assets: Asset[]) => update('assets', assets)}
                  />
                )}
                {currentStaticStep === 'beneficiaries' && !isBackupStep && (
                  <StepBeneficiaries
                    data={form.beneficiariesData}
                    onChange={(beneficiariesData: BeneficiariesData) => update('beneficiariesData', beneficiariesData)}
                    triageFlags={form.triageFlags}
                    onTriageFlagsChange={(triageFlags: TriageFlags) => update('triageFlags', triageFlags)}
                    extractedFields={extractedFields}
                  />
                )}
                {isBackupStep && backupIndex >= 0 && form.beneficiariesData.people[backupIndex] && (
                  <StepBeneficiaryBackup
                    beneficiary={form.beneficiariesData.people[backupIndex]}
                    otherBeneficiaries={form.beneficiariesData.people.filter((_, i) => i !== backupIndex)}
                    onChange={(sub) => {
                      const people = form.beneficiariesData.people.map((p, i) =>
                        i === backupIndex ? { ...p, substituteBeneficiary: sub } : p
                      )
                      update('beneficiariesData', { ...form.beneficiariesData, people })
                    }}
                  />
                )}
                {currentStaticStep === 'gifts' && (
                  <StepSpecificGifts
                    data={form.specificGifts}
                    onChange={(specificGifts: SpecificGift[]) => update('specificGifts', specificGifts)}
                  />
                )}
                {currentStaticStep === 'wishes' && (
                  <StepWishes
                    formData={form}
                    hasDependentChildren={
                      form.childrenData.hasChildren === 'yes' &&
                      form.childrenData.children.some((c) => c.isDependent)
                    }
                    onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
                  />
                )}
                {currentStaticStep === 'review' && !showDownloadGate && !showCompletion && (
                  <StepReview
                    formData={form}
                    activeSteps={baseStepsFor(form.personalDetails.maritalStatus).filter(s => s !== 'eligibility')}
                    onJumpToStep={jumpToStep}
                  />
                )}
                {showDownloadGate && <AnonDownloadGate />}

                {/* Completion screen */}
                {showCompletion && (
                  <div className="py-6 space-y-6">
                    <div className="text-center space-y-2">
                      <div
                        className="w-14 h-14 mx-auto flex items-center justify-center"
                        style={{ background: 'rgba(42,180,174,0.1)' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
                        Your Will is ready
                      </h2>
                    </div>

                    {hasWillAccess ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <p className="text-sm text-center" style={{ color: 'var(--neutral)' }}>
                          Your Will has been updated. Your download is available in your Vault.
                        </p>
                        <Link
                          href="/dashboard"
                          className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white"
                          style={{ backgroundColor: 'var(--teal)' }}
                        >
                          Go to Vault
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              maxHeight: '22rem',
                              overflowY: 'auto',
                              border: '1px solid var(--line)',
                              padding: '1.25rem 1.5rem',
                              fontFamily: 'monospace',
                              fontSize: '.75rem',
                              lineHeight: 1.75,
                              whiteSpace: 'pre-wrap',
                              color: 'var(--ink)',
                              background: 'var(--paper-warm)',
                            }}
                          >
                            {willPreviewText}
                          </div>
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0, left: 0, right: 0,
                              height: '5rem',
                              background: 'linear-gradient(to bottom, transparent, var(--paper-warm))',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>

                        <p className="text-sm text-center" style={{ color: 'var(--neutral)' }}>
                          This is your complete Will. Choose how to unlock it.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="border-2 p-5 space-y-4 flex flex-col" style={{ borderColor: 'var(--teal)' }}>
                            <div>
                              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--teal-deep)', letterSpacing: '.1em' }}>The Will</p>
                              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>$129</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>One payment · no subscription</p>
                            </div>
                            <ul className="space-y-1.5 flex-1">
                              {['Solicitor-reviewed, signed-ready Will', 'Permanently downloadable', '3 months Living Vault included'].map((f) => (
                                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink)' }}>
                                  <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5"/></svg>
                                  {f}
                                </li>
                              ))}
                            </ul>
                            <button type="button" onClick={handleWillCheckout} className="w-full py-2.5 text-sm font-semibold text-white transition-opacity" style={{ backgroundColor: 'var(--teal)', border: 'none' }}>
                              Pay $129 · get your Will
                            </button>
                          </div>

                          <div className="border p-5 space-y-4 flex flex-col" style={{ borderColor: 'var(--line)' }}>
                            <div>
                              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--teal-deep)', letterSpacing: '.1em' }}>Living Vault</p>
                              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>$99</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>per year · Will included</p>
                            </div>
                            <ul className="space-y-1.5 flex-1">
                              {['Will included and downloadable', 'Supported updates as life changes', 'Full platform access, renews annually'].map((f) => (
                                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink)' }}>
                                  <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5"/></svg>
                                  {f}
                                </li>
                              ))}
                            </ul>
                            <button type="button" onClick={handleVaultCheckout} className="w-full py-2.5 text-sm font-semibold transition-opacity" style={{ border: '1.5px solid var(--teal-deep)', color: 'var(--teal-deep)', background: 'transparent' }}>
                              Join for $99 / year
                            </button>
                          </div>
                        </div>

                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 border px-5 py-4 hover:border-[var(--teal)] transition-colors"
                          style={{ borderColor: 'var(--line)' }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: 'var(--paper-warm)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>View in Vault</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>See your estate plan, assets, and people in one place</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Desktop navigation stays within the form card. */}
                {!showDownloadGate && !showCompletion && (
                  <div className="hidden sm:flex items-center justify-between pt-6 mt-8 border-t border-[var(--line)]">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isFirst || saving}
                      className="btn btn-secondary disabled:opacity-40"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={isLast ? handleComplete : handleNext}
                      disabled={saving || !canAdvance}
                      className="btn btn-primary disabled:opacity-60"
                    >
                      {saveLabel}
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Wishes add-on — shown after review */}
              {currentStaticStep === 'review' && (
                <div className="mt-4 px-5 sm:px-0">
                  <PersonalWishes
                    willId={form.willId}
                    initialData={form.personalWishes}
                    formData={form}
                  />
                </div>
              )}
            </div>

            {/* Right-rail help panel — desktop only */}
            <div className="hidden lg:block w-64 shrink-0">
              <HelpPanel stepId={isBackupStep ? currentStepId : currentStaticStep} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation remains pinned at the bottom. */}
      {!showDownloadGate && !showCompletion && (
        <div
          className="wizard-nav-mobile sm:hidden shrink-0 border-t border-[var(--line)] px-5 py-3 flex items-center justify-between"
          style={{ background: 'var(--paper)' }}
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst || saving}
            className="btn btn-secondary disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={isLast ? handleComplete : handleNext}
            disabled={saving || !canAdvance}
            className="btn btn-primary disabled:opacity-60"
          >
            {saveLabel}
          </button>
        </div>
      )}
    </div>

    {checkoutProduct && (
      <CheckoutModal product={checkoutProduct} onClose={() => setCheckoutProduct(null)} />
    )}
    </>
  )
}

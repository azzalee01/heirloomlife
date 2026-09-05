'use client'

import { useState } from 'react'
import Link from 'next/link'
import { saveStep, completeWill, storeAnonEmail } from '../_actions'
import { markWillDownloaded } from '@/app/dashboard/will/_actions'
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
import ProgressBar from './ProgressBar'
import HelpPanel from './HelpPanel'
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

function hasValidAbnChecksum(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return false
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
  return digits
    .split('')
    .reduce((sum, digit, index) => sum + (Number(digit) - (index === 0 ? 1 : 0)) * weights[index], 0) % 89 === 0
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
  commercialPath?: 'retail' | 'sponsored'
}

export default function WillWizard({ initialData, initialStep, isAuthenticated, hasWillAccess = false, commercialPath = 'retail' }: Props) {
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
  const [showPaymentGate, setShowPaymentGate] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

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
      setStepIndex((i) => Math.min(i + 1, wizardSteps.length - 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Beneficiaries: block if not 100%
    if (currentStaticStep === 'beneficiaries' && benefTotal !== 100) {
      setError('Allocations must total exactly 100% before continuing.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const willId = await saveStep(form.willId, currentStaticStep, form)
      setForm((prev) => ({ ...prev, willId }))
      const nextIndex = Math.min(stepIndex + 1, wizardSteps.length - 1)
      setStepIndex(nextIndex)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Soft email capture after personal details step, for anon users only
      if (!isAuthenticated && !emailCaptured && currentStaticStep === 'personal') {
        setShowEmailCapture(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    setError(null)
    setStepIndex((i) => Math.max(0, i - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleComplete() {
    // Anonymous users must create an account before downloading
    if (!isAuthenticated) {
      setShowDownloadGate(true)
      return
    }
    if (!form.willId) return
    const hasQualifyingCharityGift = form.beneficiariesData.charities.some(
      (charity) => Boolean(
        charity.name.trim() &&
        hasValidAbnChecksum(charity.abn) &&
        (parseFloat(charity.percentage) || 0) > 0
      )
    )
    if (!hasWillAccess && !hasQualifyingCharityGift) {
      setShowPaymentGate(true)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await completeWill(form.willId)
      setShowCompletion(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete will. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function startWillCheckout() {
    setCheckoutLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'will' }),
      })
      const data = await response.json() as { url?: string; error?: string }
      if (!response.ok || !data.url) throw new Error(data.error ?? 'Checkout could not be started.')
      window.location.href = data.url
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout could not be started.')
      setCheckoutLoading(false)
    }
  }

  async function handleDownload() {
    if (!form.willId) return
    setDownloading(true)
    try {
      const text = renderWillText(form)
      await markWillDownloaded(form.willId)
      const blob = new Blob([text], { type: 'text/plain; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-will.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  function jumpToIndex(idx: number) {
    if (idx >= 0 && idx < wizardSteps.length) {
      setError(null)
      setStepIndex(idx)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <div className="h-full flex flex-col">
      {/* Email capture overlay */}
      {showEmailCapture && (
        <EmailCapture
          onSubmit={handleEmailSubmit}
          onSkip={() => { setShowEmailCapture(false); setEmailCaptured(true) }}
        />
      )}

      {/* Page header */}
      <div
        className="shrink-0 border-b px-6 h-14 flex items-center justify-between"
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

      {/* Scrollable wizard content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
          {/* Progress bar */}
          <ProgressBar
            steps={progressSteps}
            currentIndex={Math.max(0, progressIndex)}
            onStepClick={(i) => {
              // Map progress bar index back to wizardSteps index
              const nonBackup = wizardSteps
                .map((s, idx) => ({ s, idx }))
                .filter(({ s }) => !s.startsWith('backup_'))
              const target = nonBackup[i]
              if (target && target.idx < stepIndex) jumpToIndex(target.idx)
            }}
          />

          <div className="mt-6 flex gap-8 items-start">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="card p-6 sm:p-8">
                {error && (
                  <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3">
                    {error}
                  </div>
                )}

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
                  />
                )}
                {currentStaticStep === 'spouse' && (
                  <StepSpouseDetails
                    data={form.spouseDetails}
                    onChange={(spouseDetails: SpouseDetails) => update('spouseDetails', spouseDetails)}
                    maritalStatus={form.personalDetails.maritalStatus}
                  />
                )}
                {currentStaticStep === 'children' && (
                  <StepChildren
                    data={form.childrenData}
                    onChange={(childrenData: ChildrenData) => update('childrenData', childrenData)}
                  />
                )}
                {currentStaticStep === 'executors' && (
                  <StepExecutors
                    data={form.executorsData}
                    onChange={(executorsData: ExecutorsData) => update('executorsData', executorsData)}
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
                {currentStaticStep === 'review' && !showDownloadGate && !showCompletion && !showPaymentGate && (
                  <StepReview
                    formData={form}
                    activeSteps={baseStepsFor(form.personalDetails.maritalStatus).filter(s => s !== 'eligibility')}
                    onJumpToStep={jumpToStep}
                  />
                )}
                {showDownloadGate && <AnonDownloadGate />}

                {showPaymentGate && (
                  <div className="space-y-6 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[.14em]" style={{ color: 'var(--teal-deep)' }}>Choose how to complete your Will</p>
                      <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>Your estate plan is ready.</h2>
                      <p className="mt-2 max-w-lg text-sm leading-6" style={{ color: 'var(--neutral)' }}>Your answers are saved. Purchase your signing-ready Heirloom Will, or include a gift to an eligible registered charity to receive a sponsored Will for $0.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button type="button" onClick={startWillCheckout} disabled={checkoutLoading} className="rounded-lg border p-5 text-left transition-colors hover:border-[var(--teal)] disabled:opacity-60" style={{ borderColor: commercialPath === 'retail' ? 'var(--teal)' : 'var(--line)', background: 'white' }}>
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>Standard Will</span>
                        <span className="mt-2 block text-2xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>$129</span>
                        <span className="mt-2 block text-xs leading-5" style={{ color: 'var(--neutral)' }}>Create and download your signing-ready Will without including a charitable gift.</span>
                        <span className="mt-4 block text-sm font-semibold" style={{ color: 'var(--teal-deep)' }}>{checkoutLoading ? 'Opening secure checkout…' : 'Purchase Will →'}</span>
                      </button>
                      <button type="button" onClick={() => { setShowPaymentGate(false); jumpToStep('beneficiaries') }} className="rounded-lg border p-5 text-left transition-colors hover:border-[var(--teal)]" style={{ borderColor: commercialPath === 'sponsored' ? 'var(--teal)' : 'var(--line)', background: 'var(--paper-warm)' }}>
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>Charity-sponsored Will</span>
                        <span className="mt-2 block text-2xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>$0</span>
                        <span className="mt-2 block text-xs leading-5" style={{ color: 'var(--neutral)' }}>Include a positive share for an eligible registered charity and provide a valid-format ABN. Campaign and charity eligibility conditions may also apply.</span>
                        <span className="mt-4 block text-sm font-semibold" style={{ color: 'var(--teal-deep)' }}>Add a charity gift →</span>
                      </button>
                    </div>
                    <p className="text-xs leading-5" style={{ color: 'var(--neutral)' }}>A charitable gift is required only for the $0 sponsored option. It is not required to purchase a standard Will, and you control the charity and share you choose.</p>
                  </div>
                )}

                {/* Completion screen  -  shown after authenticated user completes */}
                {showCompletion && (
                  <div className="py-6 space-y-8">
                    <div className="text-center space-y-3">
                      <div
                        className="w-14 h-14 mx-auto flex items-center justify-center"
                        style={{ background: 'rgba(42,180,174,0.1)' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
                        Your Will is complete
                      </h2>
                      <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--neutral)' }}>
                        It&apos;s saved to your Vault. Download it now to print and sign, or explore your Vault to see how your estate plan is organised.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                      {/* Download */}
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex flex-col items-center gap-3 border p-6 text-left hover:border-[var(--teal)] transition-colors disabled:opacity-60"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'var(--paper-warm)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                            {downloading ? 'Downloading…' : 'Download Will'}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                            Print and sign with two witnesses to make it legally valid
                          </p>
                        </div>
                      </button>

                      {/* View in Vault */}
                      <Link
                        href="/dashboard"
                        className="flex flex-col items-center gap-3 border p-6 text-left hover:border-[var(--teal)] transition-colors"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'var(--paper-warm)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>View in Vault</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                            See your estate plan, assets, and people all in one place
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {!showDownloadGate && !showCompletion && !showPaymentGate && (
                  <div className="flex items-center justify-between pt-6 mt-8 border-t border-[var(--line)]">
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

              {/* Personal Wishes add-on  -  shown after review */}
              {currentStaticStep === 'review' && (
                <div className="mt-4">
                  <PersonalWishes
                    willId={form.willId}
                    initialData={form.personalWishes}
                    formData={form}
                  />
                </div>
              )}
            </div>

            {/* Right-rail help panel  -  desktop only */}
            <div className="hidden lg:block w-64 shrink-0 pt-0">
              <HelpPanel stepId={isBackupStep ? currentStepId : currentStaticStep} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

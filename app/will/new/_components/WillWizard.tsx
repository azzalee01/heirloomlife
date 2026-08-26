'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveStep, completeWill } from '../_actions'
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
  STEP_IDS,
  STEP_LABELS,
} from '../_types'
import ProgressBar from './ProgressBar'
import StepPersonalDetails from './StepPersonalDetails'
import StepSpouseDetails from './StepSpouseDetails'
import StepChildren from './StepChildren'
import StepExecutors from './StepExecutors'
import StepAssets from './StepAssets'
import StepBeneficiaries from './StepBeneficiaries'
import StepSpecificGifts from './StepSpecificGifts'
import StepWishes from './StepWishes'
import StepReview from './StepReview'

function activeStepsFor(maritalStatus: string): StepId[] {
  return STEP_IDS.filter(
    (s) => s !== 'spouse' || maritalStatus === 'married' || maritalStatus === 'domestic_partner'
  )
}

interface Props {
  initialData: WillFormData
  initialStep?: StepId
}

export default function WillWizard({ initialData, initialStep }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<WillFormData>(initialData)
  const [stepIndex, setStepIndex] = useState(() => {
    if (!initialStep) return 0
    const idx = activeStepsFor(initialData.personalDetails.maritalStatus).indexOf(initialStep)
    return idx >= 0 ? idx : 0
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeSteps = activeStepsFor(form.personalDetails.maritalStatus)

  const currentStep = activeSteps[stepIndex] as StepId
  const isFirst = stepIndex === 0
  const isLast = currentStep === 'review'

  function update<K extends keyof WillFormData>(key: K, value: WillFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleNext() {
    setSaving(true)
    setError(null)
    try {
      const willId = await saveStep(form.willId, currentStep, form)
      setForm((prev) => ({ ...prev, willId }))
      setStepIndex((i) => Math.min(i + 1, activeSteps.length - 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleComplete() {
    if (!form.willId) return
    setSaving(true)
    setError(null)
    try {
      await completeWill(form.willId)
      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete will. Please try again.')
      setSaving(false)
    }
  }

  function jumpToIndex(idx: number) {
    if (idx >= 0 && idx < activeSteps.length) {
      setStepIndex(idx)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function jumpToStep(stepId: StepId) {
    jumpToIndex(activeSteps.indexOf(stepId))
  }

  const stepLabel = saving
    ? (isLast ? 'Completing...' : 'Saving...')
    : (isLast ? 'Complete Will' : 'Save & Continue')

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">My Will</h1>
          <p className="text-sm text-[var(--neutral)] mt-0.5">
            {'Step '}{stepIndex + 1}{' of '}{activeSteps.length}{' — '}{STEP_LABELS[currentStep]}
          </p>
        </div>
        <Link href="/dashboard" className="btn btn-secondary btn-sm">
          Save &amp; exit
        </Link>
      </div>

      {/* Scrollable wizard content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7">
          <ProgressBar
            steps={activeSteps.map((s) => STEP_LABELS[s])}
            currentIndex={stepIndex}
            onStepClick={jumpToIndex}
          />

          <div className="mt-5 card p-6 sm:p-8">
            {error && (
              <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {currentStep === 'personal' && (
              <StepPersonalDetails
                data={form.personalDetails}
                onChange={(personalDetails: PersonalDetails) => update('personalDetails', personalDetails)}
              />
            )}
            {currentStep === 'spouse' && (
              <StepSpouseDetails
                data={form.spouseDetails}
                onChange={(spouseDetails: SpouseDetails) => update('spouseDetails', spouseDetails)}
                maritalStatus={form.personalDetails.maritalStatus}
              />
            )}
            {currentStep === 'children' && (
              <StepChildren
                data={form.childrenData}
                onChange={(childrenData: ChildrenData) => update('childrenData', childrenData)}
              />
            )}
            {currentStep === 'executors' && (
              <StepExecutors
                data={form.executorsData}
                onChange={(executorsData: ExecutorsData) => update('executorsData', executorsData)}
              />
            )}
            {currentStep === 'assets' && (
              <StepAssets
                data={form.assets}
                onChange={(assets: Asset[]) => update('assets', assets)}
              />
            )}
            {currentStep === 'beneficiaries' && (
              <StepBeneficiaries
                data={form.beneficiariesData}
                onChange={(beneficiariesData: BeneficiariesData) =>
                  update('beneficiariesData', beneficiariesData)
                }
                triageFlags={form.triageFlags}
                onTriageFlagsChange={(triageFlags: TriageFlags) => update('triageFlags', triageFlags)}
              />
            )}
            {currentStep === 'gifts' && (
              <StepSpecificGifts
                data={form.specificGifts}
                onChange={(specificGifts: SpecificGift[]) => update('specificGifts', specificGifts)}
              />
            )}
            {currentStep === 'wishes' && (
              <StepWishes
                formData={form}
                hasDependentChildren={form.childrenData.hasChildren === 'yes' && form.childrenData.children.some((c) => c.isDependent)}
                onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
              />
            )}
            {currentStep === 'review' && (
              <StepReview
                formData={form}
                activeSteps={activeSteps}
                onJumpToStep={jumpToStep}
              />
            )}

            {/* Step navigation */}
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
                disabled={saving}
                className="btn btn-primary disabled:opacity-60"
              >
                {stepLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import type { WillFormData, StepId } from './_types'

// Where to open a resumed draft: the first step that still needs input, so
// reopening doesn't dump the user back on Eligibility with every step locked
// (the progress bar only allows jumping backward).
export function firstIncompleteStep(form: WillFormData): StepId {
  const pd = form.personalDetails
  if (!pd.state || !pd.dateOfBirth) return 'eligibility'
  if (!pd.firstName.trim() || !pd.lastName.trim()) return 'personal'
  if (pd.maritalStatus === 'married' && !form.spouseDetails.firstName.trim()) return 'spouse'
  if (form.childrenData.hasChildren === '') return 'children'
  if (!form.executorsData.primary.firstName.trim()) return 'executors'
  const hasBeneficiary =
    form.beneficiariesData.people.some((p) => p.name.trim()) ||
    form.beneficiariesData.charities.some((c) => c.name.trim())
  if (!hasBeneficiary) return 'beneficiaries'
  return 'review'
}

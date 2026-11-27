import type { WillFormData, StepId } from './_types'

// Client-side required-field validation, per step. Returns a map of stable
// field-key → inline message; an empty map means the step is valid. The step
// components look up the same keys to render an inline error under each field.
export function validateStep(step: StepId, form: WillFormData): Record<string, string> {
  const e: Record<string, string> = {}
  const need = (missing: boolean, key: string, msg: string) => { if (missing) e[key] = msg }

  if (step === 'assets') {
    for (const a of form.assets) {
      need(!a.assetType, `asset:${a.id}:assetType`, 'Choose an asset type.')
    }
  }

  if (step === 'children') {
    const cd = form.childrenData
    if (cd.hasChildren === 'yes') {
      for (const c of cd.children) {
        need(!c.firstName.trim(), `child:${c.id}:firstName`, 'First name is required.')
        need(!c.lastName.trim(), `child:${c.id}:lastName`, 'Last name is required.')
      }
      const hasMinors = cd.children.some((c) => c.isDependent)
      if (hasMinors) {
        const g = cd.guardian
        need(!g.firstName.trim(), 'guardian:firstName', 'Guardian first name is required.')
        need(!g.lastName.trim(), 'guardian:lastName', 'Guardian last name is required.')
        need(!g.relationship.trim(), 'guardian:relationship', 'Guardian relationship is required.')
      }
    }
  }

  if (step === 'gifts') {
    for (const g of form.specificGifts) {
      need(!g.recipientName.trim(), `gift:${g.id}:recipientName`, 'Recipient name is required.')
      if (g.type === 'item') need(!g.description.trim(), `gift:${g.id}:description`, 'Description is required.')
      if (g.type === 'cash') need(!g.amount.trim(), `gift:${g.id}:amount`, 'Amount is required.')
    }
  }

  if (step === 'beneficiaries') {
    // A partially-filled row (name xor share) is an error; fully-blank rows are ignored.
    for (const p of form.beneficiariesData.people) {
      if (p.name.trim() || p.percentage.trim()) {
        need(!p.name.trim(), `beneficiary:${p.id}:name`, 'Beneficiary name is required.')
        need(!p.percentage.trim(), `beneficiary:${p.id}:percentage`, 'Share % is required.')
      }
    }
    // Charity rows: incomplete rows (blank name or zero share) are filtered out
    // at assembly, so they don't block here.
  }

  return e
}

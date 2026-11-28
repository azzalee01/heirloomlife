import type { WillFormData, StepId } from './_types'

// Client-side required-field validation, per step. Returns a map of stable
// field-key → inline message; an empty map means the step is valid. The step
// components look up the same keys to render an inline error under each field.
export function validateStep(step: StepId, form: WillFormData): Record<string, string> {
  const e: Record<string, string> = {}
  const need = (missing: boolean, key: string, msg: string) => { if (missing) e[key] = msg }

  if (step === 'personal') {
    const pd = form.personalDetails
    need(!pd.firstName.trim(), 'personal:firstName', 'First name is required.')
    need(!pd.lastName.trim(), 'personal:lastName', 'Last name is required.')
    need(!pd.addressLine1.trim(), 'personal:addressLine1', 'Street address is required.')
    need(!pd.suburb.trim(), 'personal:suburb', 'Suburb is required.')
    need(!pd.postcode.trim(), 'personal:postcode', 'Postcode is required.')
    need(!pd.maritalStatus, 'personal:maritalStatus', 'Marital status is required.')
  }

  if (step === 'spouse') {
    const married = form.personalDetails.maritalStatus === 'married' || form.personalDetails.maritalStatus === 'domestic_partner'
    if (married) {
      need(!form.spouseDetails.firstName.trim(), 'spouse:firstName', 'First name is required.')
      need(!form.spouseDetails.lastName.trim(), 'spouse:lastName', 'Last name is required.')
    }
  }

  if (step === 'assets') {
    for (const a of form.assets) {
      need(!a.assetType, `asset:${a.id}:assetType`, 'Choose an asset type.')
      need(!a.ownershipType, `asset:${a.id}:ownershipType`, 'Choose how this asset is owned.')
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

  if (step === 'executors') {
    const ed = form.executorsData
    need(!ed.primary.firstName.trim(), 'executor:primary:firstName', 'First name is required.')
    need(!ed.primary.lastName.trim(), 'executor:primary:lastName', 'Last name is required.')
    need(!ed.primary.relationship.trim(), 'executor:primary:relationship', 'Relationship is required.')
    if (ed.hasAlternate) {
      need(!ed.alternate.firstName.trim(), 'executor:alternate:firstName', 'First name is required.')
      need(!ed.alternate.lastName.trim(), 'executor:alternate:lastName', 'Last name is required.')
      need(!ed.alternate.relationship.trim(), 'executor:alternate:relationship', 'Relationship is required.')
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
      if (p.name.trim() || p.percentage.trim() || p.relationship.trim()) {
        need(!p.name.trim(), `beneficiary:${p.id}:name`, 'Beneficiary name is required.')
        need(!p.relationship.trim(), `beneficiary:${p.id}:relationship`, 'Relationship is required.')
        need(!p.percentage.trim(), `beneficiary:${p.id}:percentage`, 'Share % is required.')
      }
    }
    // Charity rows: a row that's been started (name, share, or a picked partner)
    // must have both a name and a share.
    for (const c of form.beneficiariesData.charities) {
      if (c.name.trim() || c.percentage.trim() || c.charityPartnerId) {
        need(!c.name.trim(), `charity:${c.id}:name`, 'Charity name is required.')
        need(!c.percentage.trim(), `charity:${c.id}:percentage`, 'Share % is required.')
      }
    }
  }

  return e
}

/**
 * Pre-generation and post-render validation for NSW Will assembly.
 *
 * validateWillForGeneration — checks form data BEFORE clause assembly.
 * validateRenderedText      — checks the final assembled string for leftover artefacts.
 *
 * Generation must be aborted if either step returns valid=false.
 */

import type { WillFormData } from './_types'
import { SPOUSAL_RELATIONSHIP_LABELS, NON_SPOUSAL_STATUSES } from './_types'
import { assessComplexityFlags, maxSeverity } from './_complexity'

export interface ValidationError {
  code: string
  message: string
  fieldPaths?: string[]
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  structured?: ValidationError[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function pct(v: string): number {
  return parseFloat(v) || 0
}

const MARITAL_DISPLAY: Partial<Record<string, string>> = {
  single: 'single',
  divorced: 'divorced',
  widowed: 'widowed',
  separated: 'separated',
  married: 'married',
  domestic_partner: 'in a domestic partnership',
}

// ── Relationship / marital-status consistency check ────────────────────────

export function validatePersonalRelationshipConsistency(formData: WillFormData): ValidationError[] {
  const errors: ValidationError[] = []
  const { maritalStatus } = formData.personalDetails

  if (!maritalStatus || !NON_SPOUSAL_STATUSES.has(maritalStatus)) return errors

  const statusDisplay = MARITAL_DISPLAY[maritalStatus] || maritalStatus

  const checkRelationship = (personName: string, relationship: string, fieldPath: string) => {
    if (!relationship.trim()) return
    if (SPOUSAL_RELATIONSHIP_LABELS.has(relationship.trim().toLowerCase())) {
      errors.push({
        code: 'RELATIONSHIP_STATUS_CONFLICT',
        message:
          `Your relationship details do not match. You selected that you are ${statusDisplay}, ` +
          `but ${personName} is listed as your ${relationship}. ` +
          `Please review your relationship details before generating your Will.`,
        fieldPaths: ['personalDetails.maritalStatus', fieldPath],
      })
    }
  }

  for (const p of formData.beneficiariesData.people) {
    if (p.name.trim()) {
      checkRelationship(p.name, p.relationship, `beneficiariesData.people[${p.id}].relationship`)
    }
  }

  const primary = formData.executorsData.primary
  const primaryName = [primary.firstName, primary.lastName].filter(Boolean).join(' ')
  if (primaryName) {
    checkRelationship(primaryName, primary.relationship, 'executorsData.primary.relationship')
  }

  if (formData.executorsData.hasAlternate) {
    const alt = formData.executorsData.alternate
    const altName = [alt.firstName, alt.lastName].filter(Boolean).join(' ')
    if (altName) {
      checkRelationship(altName, alt.relationship, 'executorsData.alternate.relationship')
    }
  }

  const g = formData.childrenData.guardian
  const guardianName = [g.firstName, g.lastName].filter(Boolean).join(' ')
  if (guardianName) {
    checkRelationship(guardianName, g.relationship, 'childrenData.guardian.relationship')
  }

  return errors
}

// ── Pre-render data validation ─────────────────────────────────────────────

export function validateWillForGeneration(formData: WillFormData): ValidationResult {
  const structured: ValidationError[] = []
  const plainErrors: string[] = []

  // Relationship/status consistency
  structured.push(...validatePersonalRelationshipConsistency(formData))

  // ── Executor ──────────────────────────────────────────────────────────────
  if (!formData.executorsData.primary.firstName.trim()) {
    plainErrors.push('Primary executor: first name is required.')
  }
  if (!formData.executorsData.primary.lastName.trim()) {
    plainErrors.push('Primary executor: last name is required.')
  }
  if (
    formData.executorsData.hasAlternate &&
    formData.executorsData.alternate.firstName.trim() &&
    !formData.executorsData.alternate.lastName.trim()
  ) {
    plainErrors.push('Alternate executor: last name is required when a first name is provided.')
  }

  // ── Beneficiaries ─────────────────────────────────────────────────────────
  const activePeople = formData.beneficiariesData.people.filter(
    (p) => p.name.trim() && pct(p.percentage) > 0
  )
  const activeCharities = formData.beneficiariesData.charities.filter(
    (c) => c.name.trim() && pct(c.percentage) > 0
  )

  if (activePeople.length + activeCharities.length === 0) {
    plainErrors.push('At least one named residuary beneficiary with a share > 0% is required.')
  } else {
    const total = [...activePeople, ...activeCharities].reduce(
      (s, b) => s + pct(b.percentage),
      0
    )
    if (Math.round(total * 10) / 10 !== 100) {
      plainErrors.push(
        `Residuary allocation must total exactly 100% (currently ${total.toFixed(1)}%).`
      )
    }
  }

  // Named but zero-share — silently filtered downstream, but flag here too
  for (const p of formData.beneficiariesData.people) {
    if (p.name.trim() && pct(p.percentage) === 0) {
      plainErrors.push(
        `Beneficiary "${p.name}" has a 0% share. Either assign a share or remove this entry.`
      )
    }
    if (pct(p.percentage) > 0 && !p.name.trim()) {
      plainErrors.push(
        `A beneficiary with ${p.percentage}% share has no name. Add a name or remove this entry.`
      )
    }
  }

  for (const c of formData.beneficiariesData.charities) {
    if (c.name.trim() && pct(c.percentage) === 0) {
      plainErrors.push(
        `Charity "${c.name}" has a 0% share. Either assign a share or remove this entry.`
      )
    }
    if (pct(c.percentage) > 0 && !c.name.trim()) {
      plainErrors.push(
        `A charity with ${c.percentage}% share has no name. Add a name or remove this entry.`
      )
    }
  }

  // ── Specific gifts ─────────────────────────────────────────────────────────
  for (const g of formData.specificGifts) {
    if (!g.recipientName.trim()) {
      const desc = g.type === 'cash'
        ? `cash gift of $${g.amount || '?'}`
        : `gift "${g.description || 'unnamed item'}"`
      plainErrors.push(`Specific gift (${desc}) has no recipient name.`)
    }
    if (g.type === 'cash' && (!g.amount || pct(g.amount) <= 0)) {
      plainErrors.push(
        `Cash gift to "${g.recipientName || 'unnamed'}" has no valid amount.`
      )
    }
    if (g.type === 'item' && !g.description.trim()) {
      plainErrors.push(
        `Gift to "${g.recipientName || 'unnamed'}" has no item description.`
      )
    }
  }

  // ── Testator ─────────────────────────────────────────────────────────────
  if (!formData.personalDetails.firstName.trim() && !formData.personalDetails.lastName.trim()) {
    plainErrors.push('Testator name is required (first name or last name).')
  }

  const errors = [...structured.map((e) => e.message), ...plainErrors]
  return { valid: errors.length === 0, errors, structured }
}

// ── Post-render text validation ────────────────────────────────────────────

const POST_RENDER_CHECKS: Array<{ pattern: RegExp | string; message: string }> = [
  { pattern: /\{\{/, message: 'Unresolved template variable "{{" found.' },
  { pattern: /\}\}/, message: 'Unresolved template variable "}}" found.' },
  { pattern: /\bundefined\b/, message: '"undefined" found in rendered text.' },
  { pattern: /\bnull\b/, message: '"null" found in rendered text.' },
  { pattern: /- 0% to /, message: 'Zero-percent beneficiary bullet found.' },
  { pattern: /0% to\s*[(\n]/, message: 'Zero-percent beneficiary line found.' },
  { pattern: /^- $/m, message: 'Empty bullet point found.' },
  { pattern: /\[no beneficiaries named\]/, message: 'Placeholder "[no beneficiaries named]" found.' },
  { pattern: /\[No executor/, message: 'Missing executor placeholder found.' },
  { pattern: / to \.$/, message: 'Beneficiary line with empty name found.' },
  { pattern: /% to \.$/, message: 'Beneficiary percentage with empty name found.' },
  // Legal placeholder checks — must not reach production output
  { pattern: /APPROVED_LEGAL_TEXT_REQUIRED/, message: 'Unresolved legal text placeholder "APPROVED_LEGAL_TEXT_REQUIRED" found.' },
  { pattern: /solicitor to (insert|complete)\]/, message: 'Unresolved solicitor placeholder found in rendered text.' },
  // Sentinel values that indicate data did not resolve
  { pattern: /\[unnamed carer\]/, message: 'Pet guardian name not resolved.' },
  { pattern: /\[unnamed\]/, message: 'Beneficiary or person name not resolved.' },
  { pattern: /\[location not specified\]/, message: 'Location placeholder not resolved.' },
  // Credential location must never appear in the signed Will document
  { pattern: /passwords? and access credentials?/, message: 'Credential location sentence must not appear in Will body — move this information to Executor Information.' },
]

export function validateRenderedText(text: string): ValidationResult {
  const errors: string[] = []

  for (const { pattern, message } of POST_RENDER_CHECKS) {
    const matched =
      typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text)
    if (matched) errors.push(message)
  }

  return { valid: errors.length === 0, errors }
}

// ── Internal review draft validator ───────────────────────────────────────
// Used to validate documents intended for SOLICITOR review only — not for
// delivery to the testator. Less strict than validateExecutableWill:
//   - Allows [solicitor to complete] placeholders (expected in escalation drafts)
//   - Does not enforce complexity flags (solicitor may override)
//   - Still blocks the hardest data errors (unresolved {{vars}}, undefined, null)

const DRAFT_BLOCKING_CHECKS: Array<{ pattern: RegExp | string; message: string }> = [
  { pattern: /\{\{/, message: 'Unresolved template variable "{{" found.' },
  { pattern: /\}\}/, message: 'Unresolved template variable "}}" found.' },
  { pattern: /\bundefined\b/, message: '"undefined" found in draft text.' },
  { pattern: /\bnull\b/, message: '"null" found in draft text.' },
  { pattern: /APPROVED_LEGAL_TEXT_REQUIRED/, message: 'Unresolved legal text placeholder "APPROVED_LEGAL_TEXT_REQUIRED" found.' },
]

export function validateInternalReviewDraft(
  formData: WillFormData,
  renderedText: string
): ValidationResult {
  const errors: string[] = []
  const structured: ValidationError[] = []

  // Layer 1: form-data validation (same as pre-render)
  const preCheck = validateWillForGeneration(formData)
  if (!preCheck.valid) {
    errors.push(...preCheck.errors)
    if (preCheck.structured) structured.push(...preCheck.structured)
  }

  // Layer 2: only the hardest artefact checks — permit [solicitor to complete] patterns
  for (const { pattern, message } of DRAFT_BLOCKING_CHECKS) {
    const matched =
      typeof pattern === 'string' ? renderedText.includes(pattern) : pattern.test(renderedText)
    if (matched) errors.push(message)
  }

  return { valid: errors.length === 0, errors, structured }
}

// ── Executable Will validator ──────────────────────────────────────────────
// Combines form-data validation, post-render text checks, and complexity
// screening into a single gate that must pass before a Will may be delivered
// to the testator for signature.
//
// This is distinct from validateWillForGeneration (which only checks form data)
// and validateRenderedText (which only checks the assembled string). An
// executable Will must pass ALL three layers.

export function validateExecutableWill(
  formData: WillFormData,
  renderedText: string
): ValidationResult {
  const errors: string[] = []
  const structured: ValidationError[] = []

  // Layer 1: form-data validation
  const preCheck = validateWillForGeneration(formData)
  if (!preCheck.valid) {
    errors.push(...preCheck.errors)
    if (preCheck.structured) structured.push(...preCheck.structured)
  }

  // Layer 2: post-render text artefact check
  const textCheck = validateRenderedText(renderedText)
  if (!textCheck.valid) {
    errors.push(...textCheck.errors)
  }

  // Layer 3: complexity screening — any SOLICITOR_REQUIRED flag blocks executable release
  const flags = assessComplexityFlags(formData)
  const severity = maxSeverity(flags)
  if (severity === 'SOLICITOR_REQUIRED') {
    const blockerCodes = flags
      .filter((f) => f.severity === 'SOLICITOR_REQUIRED')
      .map((f) => f.code)
    errors.push(
      `Will cannot be released for execution: SOLICITOR_REQUIRED flag(s) active — ${blockerCodes.join(', ')}. This Will requires solicitor preparation before signing.`
    )
    structured.push({
      code: 'SOLICITOR_REQUIRED_ACTIVE',
      message: `Complexity flag(s) require solicitor review before execution: ${blockerCodes.join(', ')}`,
      fieldPaths: blockerCodes.map((c) => `complexityFlags.${c}`),
    })
  }

  return { valid: errors.length === 0, errors, structured }
}

// ── Release gate ───────────────────────────────────────────────────────────
// Single canonical function that all release paths must call.
// Returns { can: true } only when the Will is safe to deliver for execution.

export function canReleaseForExecution(
  formData: WillFormData,
  renderedText: string
): { can: boolean; blockers: string[] } {
  const result = validateExecutableWill(formData, renderedText)
  return { can: result.valid, blockers: result.errors }
}

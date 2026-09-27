/**
 * Pre-generation and post-render validation for NSW Will assembly.
 *
 * validateWillForGeneration — checks form data BEFORE clause assembly.
 * validateRenderedText      — checks the final assembled string for leftover artefacts.
 *
 * Generation must be aborted if either step returns valid=false.
 */

import type { WillFormData } from './_types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function pct(v: string): number {
  return parseFloat(v) || 0
}

// ── Pre-render data validation ─────────────────────────────────────────────

export function validateWillForGeneration(formData: WillFormData): ValidationResult {
  const errors: string[] = []

  // ── Executor ──────────────────────────────────────────────────────────────
  if (!formData.executorsData.primary.firstName.trim()) {
    errors.push('Primary executor: first name is required.')
  }
  if (!formData.executorsData.primary.lastName.trim()) {
    errors.push('Primary executor: last name is required.')
  }
  if (
    formData.executorsData.hasAlternate &&
    formData.executorsData.alternate.firstName.trim() &&
    !formData.executorsData.alternate.lastName.trim()
  ) {
    errors.push('Alternate executor: last name is required when a first name is provided.')
  }

  // ── Beneficiaries ─────────────────────────────────────────────────────────
  const activePeople = formData.beneficiariesData.people.filter(
    (p) => p.name.trim() && pct(p.percentage) > 0
  )
  const activeCharities = formData.beneficiariesData.charities.filter(
    (c) => c.name.trim() && pct(c.percentage) > 0
  )

  if (activePeople.length + activeCharities.length === 0) {
    errors.push('At least one named residuary beneficiary with a share > 0% is required.')
  } else {
    const total = [...activePeople, ...activeCharities].reduce(
      (s, b) => s + pct(b.percentage),
      0
    )
    if (Math.round(total * 10) / 10 !== 100) {
      errors.push(
        `Residuary allocation must total exactly 100% (currently ${total.toFixed(1)}%).`
      )
    }
  }

  // Named but zero-share — silently filtered downstream, but flag here too
  for (const p of formData.beneficiariesData.people) {
    if (p.name.trim() && pct(p.percentage) === 0) {
      errors.push(
        `Beneficiary "${p.name}" has a 0% share. Either assign a share or remove this entry.`
      )
    }
    if (pct(p.percentage) > 0 && !p.name.trim()) {
      errors.push(
        `A beneficiary with ${p.percentage}% share has no name. Add a name or remove this entry.`
      )
    }
  }

  for (const c of formData.beneficiariesData.charities) {
    if (c.name.trim() && pct(c.percentage) === 0) {
      errors.push(
        `Charity "${c.name}" has a 0% share. Either assign a share or remove this entry.`
      )
    }
    if (pct(c.percentage) > 0 && !c.name.trim()) {
      errors.push(
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
      errors.push(`Specific gift (${desc}) has no recipient name.`)
    }
    if (g.type === 'cash' && (!g.amount || pct(g.amount) <= 0)) {
      errors.push(
        `Cash gift to "${g.recipientName || 'unnamed'}" has no valid amount.`
      )
    }
    if (g.type === 'item' && !g.description.trim()) {
      errors.push(
        `Gift to "${g.recipientName || 'unnamed'}" has no item description.`
      )
    }
  }

  // ── Testator ─────────────────────────────────────────────────────────────
  if (!formData.personalDetails.firstName.trim() && !formData.personalDetails.lastName.trim()) {
    errors.push('Testator name is required (first name or last name).')
  }

  return { valid: errors.length === 0, errors }
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

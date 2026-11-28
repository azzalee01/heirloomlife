/**
 * Jurisdiction resolution for Will clause selection.
 *
 * The clause library holds two jurisdictions: 'nsw' (the original, statute-specific
 * NSW wording) and 'generic' (jurisdiction-neutral wording approved for every other
 * State/Territory). A testator in NSW gets the NSW clause set exactly as before; a
 * testator anywhere else gets the generic clause set, falling back to NSW only where
 * no generic variant exists.
 *
 * NSW output must stay byte-identical to the pre-generic behaviour — do not add any
 * branching to the 'nsw' path here.
 */

export type ClauseJurisdiction = 'nsw' | 'generic'

/** Map a testator's State/Territory (e.g. 'NSW', 'VIC') to the clause set to use. */
export function clauseJurisdictionForState(state: string | null | undefined): ClauseJurisdiction {
  // Empty/unknown state falls back to NSW — the established default for in-progress
  // drafts and previews that have not reached the eligibility/About-You state yet.
  // Only a known non-NSW State/Territory switches to the generic clause set.
  const s = (state ?? '').trim().toUpperCase()
  return s === '' || s === 'NSW' ? 'nsw' : 'generic'
}

/** True when the testator is in NSW (uses the original NSW clause library). */
export function isNswState(state: string | null | undefined): boolean {
  return clauseJurisdictionForState(state) === 'nsw'
}

// NSW-specific statutory references that must NEVER appear in a non-NSW (generic) Will.
// Used as the assembly safety net: if a generic Will would contain any of these, the
// assembly fails loudly rather than issuing an NSW-law document to a non-NSW testator.
const NSW_STATUTE_PATTERNS: { label: string; re: RegExp }[] = [
  { label: '(NSW)', re: /\(NSW\)/ },
  { label: 'New South Wales', re: /New South Wales/i },
  { label: 'Succession Act', re: /Succession Act/i },
  { label: 'Trustee Act', re: /Trustee Act/i },
  { label: 'Status of Children Act', re: /Status of Children Act/i },
  { label: 'Probate and Administration Act', re: /Probate and Administration Act/i },
]

/** Return the list of NSW statute references found in the given text (empty = clean). */
export function findNswStatuteCitations(text: string): string[] {
  return NSW_STATUTE_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.label)
}

/** True when the text contains any NSW-specific statutory reference. */
export function hasNswStatuteCitation(text: string): boolean {
  return NSW_STATUTE_PATTERNS.some((p) => p.re.test(text))
}

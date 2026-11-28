/**
 * Structured error surfacing for the Will wizard server actions.
 *
 * Goal: a save failure must never be an opaque "We couldn't save". Every failure is
 * logged as one structured JSON line (captured by Vercel logs, and PostHog when wired)
 * carrying the action, wizard step, will/user id, Postgres error code and the CHECK/FK
 * constraint name — so the cause (e.g. assets_ownership_type_check rejecting 'entity')
 * is visible without reproducing it by hand. logWizardError returns a short reference id
 * to show the user.
 */

export interface WizardErrorContext {
  action: string
  step?: string
  willId?: string | null
  userId?: string | null
}

export interface WizardErrorLog extends WizardErrorContext {
  refId: string
  level: 'error'
  event: 'wizard_action_error'
  pgCode: string | null
  constraint: string | null
  message: string
}

/** Pull the Postgres error code + violated constraint out of a Supabase/pg error. */
export function extractPgError(error: unknown): { pgCode: string | null; constraint: string | null; message: string } {
  const e = (error ?? {}) as Record<string, unknown>
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : String(e.message ?? 'Unknown error')
  const pgCode = typeof e.code === 'string' ? e.code : null
  // Supabase/PostgREST put the constraint on `.constraint`; raw pg messages read
  // '… violates check constraint "assets_ownership_type_check"'.
  const fromField = typeof e.constraint === 'string' ? e.constraint : null
  const fromMsg = message.match(/constraint "([^"]+)"/)?.[1] ?? null
  return { pgCode, constraint: fromField ?? fromMsg, message }
}

/** Short, human-quotable reference id (no PII). */
export function makeRefId(): string {
  const rand = Math.random().toString(36).slice(2, 8)
  const t = Date.now().toString(36).slice(-4)
  return `wz_${t}${rand}`
}

/**
 * Log a wizard action failure as structured JSON and return the reference id.
 * Never throws. Safe to call from any server action catch block.
 */
export function logWizardError(ctx: WizardErrorContext, error: unknown): string {
  const refId = makeRefId()
  const { pgCode, constraint, message } = extractPgError(error)
  const entry: WizardErrorLog = {
    refId,
    level: 'error',
    event: 'wizard_action_error',
    action: ctx.action,
    step: ctx.step,
    willId: ctx.willId ?? null,
    userId: ctx.userId ?? null,
    pgCode,
    constraint,
    message,
  }
  // Vercel logs: one structured line, greppable by refId / constraint / step.
  try {
    console.error(JSON.stringify(entry))
  } catch {
    console.error('[wizard_action_error]', refId, ctx.action, ctx.step, message)
  }
  // PostHog (best-effort, no hard dependency): capture if a server client is present.
  try {
    const ph = (globalThis as { posthog?: { capture?: (e: unknown) => void } }).posthog
    ph?.capture?.({ event: 'wizard_action_error', properties: { ...entry, userId: undefined }, distinctId: ctx.userId ?? 'anonymous' })
  } catch {
    /* analytics must never break a save path */
  }
  return refId
}

/** Error thrown back to the client carrying the reference id + which step failed. */
export class WizardSaveError extends Error {
  readonly refId: string
  readonly step?: string
  constructor(refId: string, step: string | undefined, message: string) {
    super(message)
    this.name = 'WizardSaveError'
    this.refId = refId
    this.step = step
  }
}

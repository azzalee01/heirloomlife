import type { WillFormData } from '@/app/will/new/_types'
import { firstIncompleteStep } from '@/app/will/new/_resume'

export type AbandonmentKind = 'nudge' | 'ready'

// A draft whose wizard is fully complete (firstIncompleteStep === 'review') but
// still unpaid (status stays 'draft' until payment) is NOT abandoned mid-wizard —
// it gets the "ready to unlock" copy. Everything else gets the gentle nudge.
// Paid wills never reach here: the cron query filters status = 'draft'.
export function abandonmentKind(form: WillFormData): AbandonmentKind {
  return firstIncompleteStep(form) === 'review' ? 'ready' : 'nudge'
}

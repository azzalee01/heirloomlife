// What a customer can do, derived from the profile row. Two independent things:
//
//  1. The Will (one-off purchase): plan = 'will', plan_status = 'active'. Never depends on the
//     updates subscription, so cancelling or a failed renewal cannot lock anyone out of a Will they paid for.
//  2. Unlimited updates (optional annual add-on): updates_status + updates_active_until, written only by the
//     Stripe webhook. Needed to amend a Will after its first download.
//
// 'vault' is a legacy plan value from the retired membership; it is still treated as a paid Will.

export type PlanEntitlement = {
  plan?: string | null
  plan_status?: string | null
  updates_status?: string | null
  updates_active_until?: string | null
}

const WILL_OK_STATUSES = new Set(['active', 'trialing'])
// past_due keeps access while Stripe retries the renewal; the paid period end still bounds it.
const UPDATES_OK_STATUSES = new Set(['active', 'trialing', 'past_due'])

export function hasWillAccess(profile: PlanEntitlement | null | undefined): boolean {
  return Boolean(
    profile &&
    (profile.plan === 'will' || profile.plan === 'vault') &&
    WILL_OK_STATUSES.has(profile.plan_status ?? '')
  )
}

export function hasUpdatesAccess(profile: PlanEntitlement | null | undefined, now = new Date()): boolean {
  if (!profile?.updates_active_until) return false
  if (!UPDATES_OK_STATUSES.has(profile.updates_status ?? '')) return false
  const end = new Date(profile.updates_active_until)
  return !Number.isNaN(end.getTime()) && end.getTime() > now.getTime()
}

// One remote (AV) signing session is included with the Will. Re-witnessing an amended Will is "coming soon".
// Cancelled sessions do not count, so a customer can reschedule.
export const COUNTED_SESSION_STATUSES = ['scheduled', 'in_progress', 'completed'] as const

export function hasUsedIncludedSigning(sessionStatuses: readonly string[]): boolean {
  return sessionStatuses.some((s) => (COUNTED_SESSION_STATUSES as readonly string[]).includes(s))
}

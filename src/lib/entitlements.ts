export type PlanEntitlement = {
  plan?: string | null
  plan_status?: string | null
  vault_access_until?: string | null
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])

export function hasWillAccess(profile: PlanEntitlement | null | undefined): boolean {
  return Boolean(
    profile &&
    (profile.plan === 'will' || profile.plan === 'vault') &&
    ACTIVE_SUBSCRIPTION_STATUSES.has(profile.plan_status ?? '')
  )
}

export function hasVaultBenefits(profile: PlanEntitlement | null | undefined, now = new Date()): boolean {
  if (!profile) return false
  if (profile.plan === 'vault') return ACTIVE_SUBSCRIPTION_STATUSES.has(profile.plan_status ?? '')
  if (profile.plan !== 'will' || profile.plan_status !== 'active' || !profile.vault_access_until) return false

  const expiresAt = new Date(profile.vault_access_until)
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > now.getTime()
}

export function addThreeMonths(from = new Date()): Date {
  const result = new Date(from)
  result.setUTCMonth(result.getUTCMonth() + 3)
  return result
}

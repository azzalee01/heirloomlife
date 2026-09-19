export const LIVE_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'] as const
export const AV_WITNESSING_STATES = ['NSW'] as const

export type LiveState = typeof LIVE_STATES[number]

export function isLiveState(state: string): boolean {
  return (LIVE_STATES as readonly string[]).includes(state)
}

export const LIVE_STATES_COPY = 'all Australian states and territories'

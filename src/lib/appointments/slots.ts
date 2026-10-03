// Pure slot generation. No I/O, so it is unit-testable. All wall-clock times are interpreted in the
// rule's IANA timezone (default Australia/Sydney) and converted to UTC, DST included.

export interface AvailabilityRule {
  weekday: number // 0 = Sunday
  start_time: string // 'HH:MM' or 'HH:MM:SS'
  end_time: string
  slot_minutes: number
  timezone: string
}

export interface AvailabilityOverride {
  override_date: string // 'YYYY-MM-DD' in the rule timezone
  is_blocked: boolean
  start_time: string | null
  end_time: string | null
}

export interface BusyRange {
  starts_at: string
  ends_at: string
}

export interface Slot {
  startsAt: string // ISO UTC
  endsAt: string
}

export const DEFAULT_TIMEZONE = 'Australia/Sydney'

function tzOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return asUtc - Math.floor(utcMs / 1000) * 1000
}

/** Wall-clock date + time in a timezone -> the UTC instant. Handles DST transitions. */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0)
  let result = guess - tzOffsetMs(guess, timeZone)
  // Re-check the offset at the candidate instant: it differs across a DST boundary.
  const corrected = guess - tzOffsetMs(result, timeZone)
  if (corrected !== result) result = corrected
  return new Date(result)
}

/** The calendar date (YYYY-MM-DD) of an instant in a timezone. */
export function localDateString(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant)
  const get = (t: string) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

export interface GenerateOptions {
  rules: AvailabilityRule[]
  overrides: AvailabilityOverride[]
  busy: BusyRange[]
  now: Date
  days: number // how many calendar days ahead to generate, starting today in the rule timezone
  minNoticeHours?: number // earliest bookable time = now + this
  defaultSlotMinutes?: number // for extra (non-blocked) override windows
  timeZone?: string
}

export function generateSlots(opts: GenerateOptions): Slot[] {
  const { rules, overrides, busy, now, days, minNoticeHours = 12, defaultSlotMinutes = 60 } = opts
  const timeZone = opts.timeZone ?? rules[0]?.timezone ?? DEFAULT_TIMEZONE
  const earliest = now.getTime() + minNoticeHours * 3_600_000
  const busyMs = busy.map((b) => [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()] as const)

  const slots = new Map<number, Slot>()
  const today = localDateString(now, timeZone)

  for (let i = 0; i < days; i++) {
    const date = addDays(today, i)
    const dayOverrides = overrides.filter((o) => o.override_date === date)

    // A blocked override with no times blocks the whole day (including extra windows).
    if (dayOverrides.some((o) => o.is_blocked && o.start_time === null)) continue

    const windows: { start: string; end: string; slotMinutes: number }[] = []
    for (const r of rules) {
      if (r.weekday === weekdayOf(date)) windows.push({ start: r.start_time, end: r.end_time, slotMinutes: r.slot_minutes })
    }
    for (const o of dayOverrides) {
      if (!o.is_blocked && o.start_time && o.end_time) {
        windows.push({ start: o.start_time, end: o.end_time, slotMinutes: defaultSlotMinutes })
      }
    }

    const blockedWindows = dayOverrides
      .filter((o) => o.is_blocked && o.start_time && o.end_time)
      .map((o) => [zonedTimeToUtc(date, o.start_time!, timeZone).getTime(), zonedTimeToUtc(date, o.end_time!, timeZone).getTime()] as const)

    for (const w of windows) {
      const winStart = zonedTimeToUtc(date, w.start, timeZone).getTime()
      const winEnd = zonedTimeToUtc(date, w.end, timeZone).getTime()
      const step = w.slotMinutes * 60_000
      for (let s = winStart; s + step <= winEnd; s += step) {
        const e = s + step
        if (s < earliest) continue
        if (blockedWindows.some(([bs, be]) => overlaps(s, e, bs, be))) continue
        if (busyMs.some(([bs, be]) => overlaps(s, e, bs, be))) continue
        slots.set(s, { startsAt: new Date(s).toISOString(), endsAt: new Date(e).toISOString() })
      }
    }
  }

  return [...slots.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

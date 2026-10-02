import { describe, expect, it } from 'vitest'
import { generateSlots, localDateString, zonedTimeToUtc, type AvailabilityRule } from '@/src/lib/appointments/slots'

const TZ = 'Australia/Sydney'

// Sydney DST 2026: clocks go forward at 2am on Sunday 4 Oct (AEST +10 -> AEDT +11).
describe('zonedTimeToUtc', () => {
  it('uses +10 before the DST change', () => {
    expect(zonedTimeToUtc('2026-10-03', '09:00', TZ).toISOString()).toBe('2026-10-02T23:00:00.000Z')
  })
  it('uses +11 after the DST change', () => {
    expect(zonedTimeToUtc('2026-10-05', '09:00', TZ).toISOString()).toBe('2026-10-04T22:00:00.000Z')
  })
  it('uses +11 in January and +10 in July', () => {
    expect(zonedTimeToUtc('2027-01-15', '10:00', TZ).toISOString()).toBe('2027-01-14T23:00:00.000Z')
    expect(zonedTimeToUtc('2027-07-15', '10:00', TZ).toISOString()).toBe('2027-07-15T00:00:00.000Z')
  })
})

describe('localDateString', () => {
  it('returns the Sydney calendar date, not the UTC date', () => {
    // 23:00Z on 2 Oct is already 3 Oct in Sydney
    expect(localDateString(new Date('2026-10-02T23:30:00Z'), TZ)).toBe('2026-10-03')
  })
})

const monday: AvailabilityRule = { weekday: 1, start_time: '09:00', end_time: '12:00', slot_minutes: 60, timezone: TZ }
// Friday 2 Oct 2026, 23:00 Sydney (AEST)
const now = new Date('2026-10-02T13:00:00Z')

describe('generateSlots', () => {
  it('generates hourly slots on the matching weekday in Sydney time, across DST', () => {
    const slots = generateSlots({ rules: [monday], overrides: [], busy: [], now, days: 7 })
    expect(slots.map((s) => s.startsAt)).toEqual([
      '2026-10-04T22:00:00.000Z', // Mon 5 Oct 09:00 AEDT
      '2026-10-04T23:00:00.000Z',
      '2026-10-05T00:00:00.000Z',
    ])
  })

  it('removes slots that overlap an existing booking', () => {
    const slots = generateSlots({
      rules: [monday],
      overrides: [],
      busy: [{ starts_at: '2026-10-04T23:00:00.000Z', ends_at: '2026-10-05T00:00:00.000Z' }],
      now,
      days: 7,
    })
    expect(slots).toHaveLength(2)
    expect(slots.map((s) => s.startsAt)).not.toContain('2026-10-04T23:00:00.000Z')
  })

  it('a whole-day block removes the day', () => {
    const slots = generateSlots({
      rules: [monday],
      overrides: [{ override_date: '2026-10-05', is_blocked: true, start_time: null, end_time: null }],
      busy: [],
      now,
      days: 7,
    })
    expect(slots).toHaveLength(0)
  })

  it('a partial block removes only overlapping slots', () => {
    const slots = generateSlots({
      rules: [monday],
      overrides: [{ override_date: '2026-10-05', is_blocked: true, start_time: '10:00', end_time: '11:00' }],
      busy: [],
      now,
      days: 7,
    })
    expect(slots.map((s) => s.startsAt)).toEqual(['2026-10-04T22:00:00.000Z', '2026-10-05T00:00:00.000Z'])
  })

  it('an extra open window adds slots on a day with no rule', () => {
    const slots = generateSlots({
      rules: [monday],
      overrides: [{ override_date: '2026-10-06', is_blocked: false, start_time: '14:00', end_time: '15:00' }],
      busy: [],
      now,
      days: 7,
    })
    expect(slots.map((s) => s.startsAt)).toContain('2026-10-06T03:00:00.000Z') // Tue 6 Oct 14:00 AEDT
  })

  it('respects minimum notice', () => {
    // 20 hours before Monday 09:00 AEDT is Sunday 13:00 AEDT; give only 12h notice vs a now just before the slot
    const closeNow = new Date('2026-10-04T20:00:00Z') // Mon 5 Oct 07:00 AEDT
    const slots = generateSlots({ rules: [monday], overrides: [], busy: [], now: closeNow, days: 1, minNoticeHours: 12 })
    expect(slots).toHaveLength(0)
    const open = generateSlots({ rules: [monday], overrides: [], busy: [], now: closeNow, days: 1, minNoticeHours: 0 })
    expect(open).toHaveLength(3)
  })

  it('does not emit a slot that would run past the window end', () => {
    const odd: AvailabilityRule = { ...monday, start_time: '09:00', end_time: '10:30', slot_minutes: 60 }
    const slots = generateSlots({ rules: [odd], overrides: [], busy: [], now, days: 7 })
    expect(slots).toHaveLength(1)
  })
})

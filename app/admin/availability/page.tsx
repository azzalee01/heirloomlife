import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'
import {
  addAvailabilityRule,
  deleteAvailabilityRule,
  addAvailabilityOverride,
  deleteAvailabilityOverride,
} from './_actions'

export const metadata: Metadata = { title: 'Availability (host)', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const inp = 'border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--teal)] bg-white'
const delBtn = 'btn btn-secondary text-xs'

export default async function AvailabilityPage() {
  const host = await getHostUser()
  if (!host) notFound()

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: APPOINTMENT_TZ }).format(new Date())

  const [{ data: rules }, { data: overrides }] = await Promise.all([
    supabaseAdmin
      .from('staff_availability_rules')
      .select('id, weekday, start_time, end_time, slot_minutes')
      .eq('host_id', host.id)
      .eq('active', true)
      .order('weekday'),
    supabaseAdmin
      .from('staff_availability_overrides')
      .select('id, override_date, is_blocked, start_time, end_time, note')
      .eq('host_id', host.id)
      .gte('override_date', today)
      .order('override_date')
      .limit(90),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Availability</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--neutral)' }}>
            All times are Sydney time. Changes take effect immediately for new bookings.
          </p>
        </div>
        <Link href="/admin/appointments" className="btn btn-secondary text-sm" style={{ whiteSpace: 'nowrap' }}>
          ← Calls
        </Link>
      </div>

      {/* ── Recurring schedule ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>Recurring schedule</h2>

        <div className="border divide-y" style={{ borderColor: 'var(--line)' }}>
          {(!rules || rules.length === 0) && (
            <p className="px-4 py-4 text-sm" style={{ color: 'var(--neutral)' }}>No recurring rules yet.</p>
          )}
          {rules?.map((r) => (
            <div key={r.id as string} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span style={{ color: 'var(--ink)' }}>
                <strong>{DAYS[r.weekday as number]}</strong>
                {' '}
                {String(r.start_time).slice(0, 5)}–{String(r.end_time).slice(0, 5)}
                {' '}
                <span style={{ color: 'var(--neutral)' }}>· {r.slot_minutes as number} min slots</span>
              </span>
              <form action={deleteAvailabilityRule.bind(null, r.id as string)}>
                <button type="submit" className={delBtn} style={{ color: '#b91c1c', borderColor: '#fecaca' }}>
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>

        <form action={addAvailabilityRule} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>Day</label>
            <select name="weekday" className={inp}>
              {DAYS.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>From</label>
            <input type="time" name="start_time" defaultValue="10:00" className={inp} required />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>To</label>
            <input type="time" name="end_time" defaultValue="14:00" className={inp} required />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>Slot length</label>
            <select name="slot_minutes" defaultValue="60" className={inp}>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">120 min</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary text-sm" style={{ height: 38 }}>
            Add rule
          </button>
        </form>
      </section>

      {/* ── Date overrides ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>Date overrides</h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--neutral)' }}>
            Block a whole day, block a specific time window, or add an extra open window outside the recurring schedule.
          </p>
        </div>

        <div className="border divide-y" style={{ borderColor: 'var(--line)' }}>
          {(!overrides || overrides.length === 0) && (
            <p className="px-4 py-4 text-sm" style={{ color: 'var(--neutral)' }}>No upcoming overrides.</p>
          )}
          {overrides?.map((o) => {
            const kind = !(o.is_blocked as boolean)
              ? 'Extra window'
              : (o.start_time ? 'Blocked window' : 'Day off')
            const times =
              o.start_time && o.end_time
                ? ` · ${String(o.start_time).slice(0, 5)}–${String(o.end_time).slice(0, 5)}`
                : ''
            return (
              <div key={o.id as string} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span style={{ color: 'var(--ink)' }}>
                  <strong>{o.override_date as string}</strong>
                  {times}
                  {' '}
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={
                      !(o.is_blocked as boolean)
                        ? { background: '#f0fdf4', color: '#15803d' }
                        : { background: '#fffbeb', color: '#92400e' }
                    }
                  >
                    {kind}
                  </span>
                  {o.note && (
                    <span style={{ color: 'var(--neutral)' }}> · {o.note as string}</span>
                  )}
                </span>
                <form action={deleteAvailabilityOverride.bind(null, o.id as string)}>
                  <button type="submit" className={delBtn} style={{ color: '#b91c1c', borderColor: '#fecaca' }}>
                    Delete
                  </button>
                </form>
              </div>
            )
          })}
        </div>

        <form action={addAvailabilityOverride} className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>Date</label>
              <input type="date" name="override_date" min={today} className={inp} required />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>Type</label>
              <select name="type" defaultValue="block_day" className={inp}>
                <option value="block_day">Block whole day</option>
                <option value="block">Block a window</option>
                <option value="extra">Add extra window</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>From</label>
              <input type="time" name="start_time" className={inp} />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>To</label>
              <input type="time" name="end_time" className={inp} />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[12rem] space-y-1">
              <label className="block text-xs font-medium" style={{ color: 'var(--neutral)' }}>Note (optional)</label>
              <input
                type="text"
                name="note"
                placeholder="e.g. Public holiday, Training day"
                className={`${inp} w-full`}
                maxLength={200}
              />
            </div>
            <button type="submit" className="btn btn-primary text-sm" style={{ height: 38 }}>
              Add override
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

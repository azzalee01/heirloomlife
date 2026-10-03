'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { requireHost } from '@/src/lib/appointments/server'

// ─── Recurring rules ─────────────────────────────────────────────────────────

export async function addAvailabilityRule(formData: FormData) {
  const host = await requireHost()
  const weekday = Number(formData.get('weekday'))
  const start_time = String(formData.get('start_time') ?? '')
  const end_time = String(formData.get('end_time') ?? '')
  const slot_minutes = Number(formData.get('slot_minutes') ?? 60)

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) throw new Error('Invalid weekday')
  if (!/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time)) throw new Error('Invalid times')
  if (start_time >= end_time) throw new Error('End must be after start')
  if (![30, 45, 60, 90, 120].includes(slot_minutes)) throw new Error('Invalid slot duration')

  await supabaseAdmin.from('staff_availability_rules').insert({
    host_id: host.id,
    weekday,
    start_time,
    end_time,
    slot_minutes,
    timezone: 'Australia/Sydney',
    active: true,
  })
  revalidatePath('/admin/availability')
}

export async function deleteAvailabilityRule(ruleId: string) {
  if (!ruleId || typeof ruleId !== 'string') return
  const host = await requireHost()
  await supabaseAdmin
    .from('staff_availability_rules')
    .delete()
    .eq('id', ruleId)
    .eq('host_id', host.id)
  revalidatePath('/admin/availability')
}

// ─── Date overrides ───────────────────────────────────────────────────────────

export async function addAvailabilityOverride(formData: FormData) {
  const host = await requireHost()
  const override_date = String(formData.get('override_date') ?? '')
  // 'block_day' = whole day off (no times), 'block' = timed block, 'extra' = extra open window
  const type = String(formData.get('type') ?? 'block_day')
  const start_time = String(formData.get('start_time') ?? '').trim() || null
  const end_time = String(formData.get('end_time') ?? '').trim() || null
  const note = String(formData.get('note') ?? '').trim().slice(0, 200) || null

  if (!/^\d{4}-\d{2}-\d{2}$/.test(override_date)) throw new Error('Invalid date')

  const is_blocked = type !== 'extra'
  const needsTimes = type !== 'block_day'
  if (needsTimes && (!start_time || !end_time)) throw new Error('This override type requires start and end times')
  if (start_time && end_time && start_time >= end_time) throw new Error('End time must be after start time')

  await supabaseAdmin.from('staff_availability_overrides').insert({
    host_id: host.id,
    override_date,
    is_blocked,
    start_time: needsTimes ? start_time : null,
    end_time: needsTimes ? end_time : null,
    note,
  })
  revalidatePath('/admin/availability')
}

export async function deleteAvailabilityOverride(overrideId: string) {
  if (!overrideId || typeof overrideId !== 'string') return
  const host = await requireHost()
  await supabaseAdmin
    .from('staff_availability_overrides')
    .delete()
    .eq('id', overrideId)
    .eq('host_id', host.id)
  revalidatePath('/admin/availability')
}

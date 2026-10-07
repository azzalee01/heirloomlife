'use server'

import { supabaseAdmin } from '@/src/lib/supabase-server'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { sendExecutedWillEmail } from '@/src/lib/email'
import { loadAppointment, logEvent, requireHost } from './server'
import { APPOINTMENT_TZ } from './constants'
import type { ActionResult } from './types'

async function requireHostForAppt(appointmentId: string) {
  const host = await requireHost()
  const appt = await loadAppointment(appointmentId)
  if (!appt) throw new Error('Not found')
  return { host, appt }
}

export async function linkWillToAppointment(
  appointmentId: string,
  willId: string,
): Promise<ActionResult> {
  try {
    const { appt } = await requireHostForAppt(appointmentId)
    if (appt.witnessing_status !== 'none') return { ok: false, error: 'A will is already linked.' }
    const { data: will } = await supabaseAdmin.from('wills').select('id').eq('id', willId).maybeSingle()
    if (!will) return { ok: false, error: 'Will not found.' }
    await supabaseAdmin.from('appointments').update({ will_id: willId, witnessing_status: 'will_linked' }).eq('id', appointmentId)
    await logEvent(appointmentId, 'witnessing_will_linked', 'host', { metadata: { will_id: willId } })
    return { ok: true }
  } catch { return { ok: false, error: 'Could not link the will.' } }
}

export async function confirmTestatorSigned(
  appointmentId: string,
  witness1Name: string,
  witness2Name: string,
): Promise<ActionResult> {
  try {
    const { host, appt } = await requireHostForAppt(appointmentId)
    if (appt.witnessing_status !== 'will_linked') return { ok: false, error: 'Session not at the right stage.' }
    if (!appt.will_id) return { ok: false, error: 'No will linked.' }
    if (!witness1Name.trim() || !witness2Name.trim()) return { ok: false, error: 'Both witness names are required.' }
    await supabaseAdmin.from('appointments').update({
      witnessing_status: 'testator_signed',
      witness_1_id: host.id,
      testator_signed_confirmed_at: new Date().toISOString(),
    }).eq('id', appointmentId)
    await logEvent(appointmentId, 'testator_signed_confirmed', 'host', {
      metadata: { witness_1_name: witness1Name.trim(), witness_2_name: witness2Name.trim(), confirmed_by: host.id },
    })
    return { ok: true }
  } catch { return { ok: false, error: 'Could not confirm signing.' } }
}

export async function uploadTestatorScan(formData: FormData): Promise<ActionResult<{ path: string }>> {
  try {
    const { host, appt } = await requireHostForAppt(formData.get('appointmentId') as string)
    if (!['testator_signed', 'witnesses_signed'].includes(appt.witnessing_status)) {
      return { ok: false, error: 'Not at the right stage.' }
    }
    const file = formData.get('file') as File | null
    if (!file || file.size === 0) return { ok: false, error: 'No file provided.' }
    const ext = file.name.split('.').pop() ?? 'pdf'
    const path = `${appt.id}/testator-scan-${Date.now()}.${ext}`
    const { error } = await supabaseAdmin.storage
      .from('witnessing-uploads')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true })
    if (error) return { ok: false, error: error.message }
    await supabaseAdmin.from('appointments').update({
      witnessing_status: 'witnesses_signed',
      testator_upload_path: path,
    }).eq('id', appt.id)
    await logEvent(appt.id, 'testator_document_uploaded', 'host', { metadata: { path, uploaded_by: host.id } })
    return { ok: true, path }
  } catch (err) {
    console.error('uploadTestatorScan failed:', err)
    return { ok: false, error: 'Upload failed.' }
  }
}

export async function uploadExecutedWill(formData: FormData): Promise<ActionResult<{ path: string }>> {
  try {
    const { host, appt } = await requireHostForAppt(formData.get('appointmentId') as string)
    if (appt.witnessing_status !== 'witnesses_signed') return { ok: false, error: 'Not at the right stage.' }
    if (!appt.will_id) return { ok: false, error: 'No will linked.' }
    const file = formData.get('file') as File | null
    if (!file || file.size === 0) return { ok: false, error: 'No file provided.' }
    const path = `${appt.id}/executed-will-${Date.now()}.pdf`
    const { error } = await supabaseAdmin.storage
      .from('executed-wills')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: 'application/pdf', upsert: true })
    if (error) return { ok: false, error: error.message }
    const now = new Date().toISOString()
    await supabaseAdmin.from('appointments').update({ witnessing_status: 'executed', executed_will_path: path }).eq('id', appt.id)
    await supabaseAdmin.from('wills').update({ executed_at: now, executed_will_path: path }).eq('id', appt.will_id)
    await logEvent(appt.id, 'executed_will_stored', 'host', { metadata: { path, uploaded_by: host.id } })
    sendExecutedWillEmail({ to: appt.customer_email, name: appt.customer_name }).catch(
      (err) => console.error('sendExecutedWillEmail failed:', err)
    )
    return { ok: true, path }
  } catch (err) {
    console.error('uploadExecutedWill failed:', err)
    return { ok: false, error: 'Upload failed.' }
  }
}

// Customer uploads their own signed scan from the dashboard
export async function submitTestatorUpload(formData: FormData): Promise<ActionResult<{ path: string }>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Not authenticated.' }
    const appointmentId = formData.get('appointmentId') as string
    const appt = await loadAppointment(appointmentId)
    if (!appt || appt.user_id !== user.id) return { ok: false, error: 'Not found.' }
    if (appt.witnessing_status !== 'testator_signed') return { ok: false, error: 'Not at the right stage.' }
    const file = formData.get('file') as File | null
    if (!file || file.size === 0) return { ok: false, error: 'No file provided.' }
    const ext = file.name.split('.').pop() ?? 'pdf'
    const path = `${appointmentId}/testator-scan-${Date.now()}.${ext}`
    const { error } = await supabaseAdmin.storage
      .from('witnessing-uploads')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true })
    if (error) return { ok: false, error: error.message }
    await supabaseAdmin.from('appointments').update({
      witnessing_status: 'witnesses_signed',
      testator_upload_path: path,
    }).eq('id', appointmentId)
    await logEvent(appointmentId, 'testator_document_uploaded', 'customer', { metadata: { path } })
    return { ok: true, path }
  } catch (err) {
    console.error('submitTestatorUpload failed:', err)
    return { ok: false, error: 'Upload failed.' }
  }
}

// Signed download URL for stored documents (host-only)
export async function getWitnessingDownloadUrl(
  appointmentId: string,
  bucket: 'witnessing-uploads' | 'executed-wills',
): Promise<ActionResult<{ url: string }>> {
  try {
    const { appt } = await requireHostForAppt(appointmentId)
    const path = bucket === 'witnessing-uploads' ? appt.testator_upload_path : appt.executed_will_path
    if (!path) return { ok: false, error: 'No file stored yet.' }
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 300)
    if (error || !data) return { ok: false, error: 'Could not generate download link.' }
    return { ok: true, url: data.signedUrl }
  } catch { return { ok: false, error: 'Could not generate download link.' } }
}

// Signed download URL for the customer's own executed will
export async function getExecutedWillDownloadUrl(willId: string): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Not authenticated.' }
    const { data: will } = await supabaseAdmin.from('wills').select('user_id, executed_will_path').eq('id', willId).maybeSingle()
    if (!will || (will.user_id as string) !== user.id) return { ok: false, error: 'Not found.' }
    if (!will.executed_will_path) return { ok: false, error: 'Will not yet executed.' }
    const { data, error } = await supabaseAdmin.storage.from('executed-wills').createSignedUrl(will.executed_will_path as string, 300)
    if (error || !data) return { ok: false, error: 'Could not generate download link.' }
    return { ok: true, url: data.signedUrl }
  } catch { return { ok: false, error: 'Could not generate download link.' } }
}

export function buildAvStatement(witness1Name: string, witness2Name: string, date: string, platform: string): string {
  const d = new Intl.DateTimeFormat('en-AU', {
    timeZone: APPOINTMENT_TZ, day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
  const block = (name: string) =>
    `I, ${name}, witnessed the will-maker sign this Will by audio visual link on ${d} using ${platform}. ` +
    `I observed the will-maker sign in real time. I have signed a counterpart of this document and am ` +
    `reasonably satisfied it is the same document, or a copy of the document, that I observed the will-maker sign. ` +
    `This document was witnessed in accordance with section 14G of the Electronic Transactions Act 2000 (NSW).`
  return `${block(witness1Name)}\n\n${block(witness2Name)}`
}

// Fetches witness names from the audit trail
export async function getWitnessNamesFromEvents(appointmentId: string): Promise<{ witness1Name: string; witness2Name: string } | null> {
  const { data } = await supabaseAdmin
    .from('appointment_events')
    .select('metadata')
    .eq('appointment_id', appointmentId)
    .eq('event_type', 'testator_signed_confirmed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data?.metadata) return null
  const meta = data.metadata as Record<string, string>
  if (!meta.witness_1_name || !meta.witness_2_name) return null
  return { witness1Name: meta.witness_1_name, witness2Name: meta.witness_2_name }
}

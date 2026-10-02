const DAILY_API = 'https://api.daily.co/v1'

function authHeaders() {
  const key = process.env.DAILY_API_KEY
  if (!key) throw new Error('DAILY_API_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export interface DailyRoom {
  name: string
  url: string
}

// Rooms expire 2 hours after the scheduled time  -  long enough for a signing
// session plus buffer, short enough that stale rooms don't linger.
export async function createWitnessingRoom(scheduledAt: string, recordingEnabled: boolean): Promise<DailyRoom> {
  const exp = Math.floor(new Date(scheduledAt).getTime() / 1000) + 2 * 60 * 60

  const res = await fetch(`${DAILY_API}/rooms`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      privacy: 'private',
      properties: {
        exp,
        enable_prejoin_ui: true,
        enable_screenshare: false,
        eject_at_room_exp: true,
        enable_recording: recordingEnabled ? 'cloud' : undefined,
      },
    }),
  })

  if (!res.ok) throw new Error(`Failed to create Daily room: ${await res.text()}`)
  const data = await res.json()
  return { name: data.name, url: data.url }
}

export async function createMeetingToken(roomName: string, userName: string, isOwner: boolean): Promise<string> {
  const res = await fetch(`${DAILY_API}/meeting-tokens`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      properties: { room_name: roomName, user_name: userName, is_owner: isOwner },
    }),
  })
  if (!res.ok) throw new Error(`Failed to create meeting token: ${await res.text()}`)
  const data = await res.json()
  return data.token
}

export interface DailyRecording {
  id: string
  status: string
  download_link?: string
}

export async function getRoomRecordings(roomName: string): Promise<DailyRecording[]> {
  const res = await fetch(`${DAILY_API}/recordings?room_name=${encodeURIComponent(roomName)}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to list recordings: ${await res.text()}`)
  const data = await res.json()
  return data.data ?? []
}

export async function getRecordingAccessLink(recordingId: string): Promise<string> {
  const res = await fetch(`${DAILY_API}/recordings/${recordingId}/access-link`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to get recording access link: ${await res.text()}`)
  const data = await res.json()
  return data.download_link
}

// ─── Guided appointments ────────────────────────────────────────────────────

// Rooms are created lazily on first join (not at booking), named deterministically so a race between the
// host and customer joining resolves to the same room. The room opens an hour before the slot and closes two
// hours after it ends; who may enter inside that window is enforced server-side per participant.
export async function ensureAppointmentRoom(appointmentId: string, startsAt: string, endsAt: string): Promise<DailyRoom> {
  const name = `appt-${appointmentId}`
  const nbf = Math.floor(new Date(startsAt).getTime() / 1000) - 60 * 60
  const exp = Math.floor(new Date(endsAt).getTime() / 1000) + 2 * 60 * 60

  const res = await fetch(`${DAILY_API}/rooms`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name,
      privacy: 'private',
      properties: {
        nbf,
        exp,
        max_participants: 4, // will-maker, guide, and room for one family member. A third person is a flag, not a block.
        enable_prejoin_ui: true,
        enable_screenshare: true,
        enable_chat: false,
        enable_recording: 'cloud',
        eject_at_room_exp: true,
      },
    }),
  })

  if (res.ok) {
    const data = await res.json()
    return { name: data.name, url: data.url }
  }

  // Already exists (the other participant got there first): fetch it.
  const existing = await fetch(`${DAILY_API}/rooms/${encodeURIComponent(name)}`, { headers: authHeaders() })
  if (existing.ok) {
    const data = await existing.json()
    return { name: data.name, url: data.url }
  }
  throw new Error(`Failed to create Daily room: ${await res.text()}`)
}

export async function createAppointmentToken(params: {
  roomName: string
  userName: string
  isOwner: boolean
  expiresAt: string // ISO; token stops working then
  startRecording?: boolean // customer tokens only, and only after consent has been recorded
}): Promise<string> {
  const res = await fetch(`${DAILY_API}/meeting-tokens`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      properties: {
        room_name: params.roomName,
        user_name: params.userName,
        is_owner: params.isOwner,
        exp: Math.floor(new Date(params.expiresAt).getTime() / 1000),
        eject_at_token_exp: true,
        // Daily documents start_cloud_recording as paid-plans-only; the caller handles the rejection.
        ...(params.startRecording ? { start_cloud_recording: true } : {}),
      },
    }),
  })
  if (!res.ok) throw new Error(`Failed to create meeting token: ${await res.text()}`)
  const data = await res.json()
  return data.token
}

export interface DailyRecordingInfo {
  id: string
  status: string
  start_ts?: number
  duration?: number
}

export async function listAppointmentRecordings(roomName: string): Promise<DailyRecordingInfo[]> {
  const res = await fetch(`${DAILY_API}/recordings?room_name=${encodeURIComponent(roomName)}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to list recordings: ${await res.text()}`)
  const data = await res.json()
  return (data.data ?? []) as DailyRecordingInfo[]
}

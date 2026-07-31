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

// Rooms expire 2 hours after the scheduled time — long enough for a signing
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

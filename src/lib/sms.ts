// SMS via Twilio. No-ops silently when TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER are absent.

function toE164Au(raw: string): string {
  const s = raw.replace(/\s/g, '')
  if (s.startsWith('+')) return s
  if (s.startsWith('04')) return `+61${s.slice(1)}`
  return `+61${s}`
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return false

  const e164 = toE164Au(to)
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      },
      body: new URLSearchParams({ From: from, To: e164, Body: body }).toString(),
    })
    return r.ok
  } catch {
    return false
  }
}

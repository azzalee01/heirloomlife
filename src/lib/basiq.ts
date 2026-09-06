const BASIQ_BASE = 'https://au-api.basiq.io'

export async function getBasiqServerToken(): Promise<string> {
  const resp = await fetch(`${BASIQ_BASE}/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.BASIQ_API_KEY}`,
      'basiq-version': '3.0',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'scope=SERVER_ACCESS',
    cache: 'no-store',
  })
  if (!resp.ok) throw new Error(`Basiq token error ${resp.status}`)
  const data = await resp.json() as { access_token: string }
  return data.access_token
}

export async function createBasiqUser(token: string, email: string): Promise<string> {
  const resp = await fetch(`${BASIQ_BASE}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '3.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  })
  if (!resp.ok) throw new Error(`Basiq create user error ${resp.status}`)
  const data = await resp.json() as { id: string }
  return data.id
}

// POST /users/{id}/auth_link requires mobile; returns the public consent URL.
export async function createBasiqAuthLink(
  token: string,
  basiqUserId: string,
  mobile: string,
): Promise<string> {
  const resp = await fetch(`${BASIQ_BASE}/users/${basiqUserId}/auth_link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '3.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
    cache: 'no-store',
  })
  if (!resp.ok) throw new Error(`Basiq auth_link error ${resp.status}`)
  const data = await resp.json() as { links: { public: string } }
  return data.links.public
}

export type BasiqAccountRaw = {
  id: string
  name: string
  balance: string | number
  currency: string
  status: string
  class?: { type: string; product: string }
  institution: string
}

export async function fetchBasiqAccounts(
  token: string,
  basiqUserId: string,
): Promise<BasiqAccountRaw[]> {
  const resp = await fetch(`${BASIQ_BASE}/users/${basiqUserId}/accounts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '3.0',
    },
    cache: 'no-store',
  })
  if (!resp.ok) return []
  const data = await resp.json() as { data?: BasiqAccountRaw[] }
  return data.data ?? []
}

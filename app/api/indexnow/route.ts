import { NextResponse } from 'next/server'

const INDEXNOW_KEY = 'b3f7a2d1e8c4f0a6b5d2e9c3f1a8b4d7'
const HOST = 'www.heirloomlife.com.au'

export async function POST(request: Request) {
  const { urls }: { urls: string[] } = await request.json()

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls array required' }, { status: 400 })
  }

  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })

  return NextResponse.json({ status: res.status }, { status: res.ok ? 200 : 502 })
}

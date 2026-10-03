import { NextResponse } from 'next/server'
import { subscribeToLoops, type SubscribeSource } from '@/src/lib/loops'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email: unknown = body?.email
  const source: unknown = body?.source

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const validSources: SubscribeSource[] = ['homepage', 'pricing']
  const resolvedSource: SubscribeSource = validSources.includes(source as SubscribeSource)
    ? (source as SubscribeSource)
    : 'homepage'

  const result = await subscribeToLoops(email, resolvedSource)

  if (!result.ok) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, alreadySubscribed: result.alreadySubscribed ?? false })
}

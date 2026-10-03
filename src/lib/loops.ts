import { LoopsClient } from 'loops'

const loops = new LoopsClient(process.env.LOOPS_API_KEY ?? '')

export type SubscribeSource = 'homepage' | 'pricing'

export async function subscribeToLoops(email: string, source: SubscribeSource): Promise<{ ok: boolean; alreadySubscribed?: boolean }> {
  try {
    const resp = await loops.createContact({ email, properties: { signupSource: source } })
    if ('success' in resp && resp.success) return { ok: true }
    if ('message' in resp && typeof resp.message === 'string' && resp.message.includes('already')) {
      return { ok: true, alreadySubscribed: true }
    }
    return { ok: false }
  } catch (err) {
    console.error('Loops subscribe error:', err)
    return { ok: false }
  }
}

import { getStripe } from '@/src/lib/stripe'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

// Opens Stripe's hosted Billing Portal so a customer can cancel or manage the unlimited-updates subscription.
// Requires a default Billing Portal configuration in Stripe (Settings > Billing > Customer portal) with
// subscription cancellation enabled.
export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  const customerId = (profile?.stripe_customer_id as string | null) ?? null
  if (!customerId) return Response.json({ error: 'No billing account found.' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[portal] billing portal session failed', { userId: user.id, error: (err as Error).message })
    return Response.json({ error: 'Unable to open billing right now. Please try again.' }, { status: 500 })
  }
}

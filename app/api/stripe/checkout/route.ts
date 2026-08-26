import { NextRequest } from 'next/server'
import { getStripe, priceId, isSubscriptionProduct, type Product } from '@/src/lib/stripe'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { product: Product }
  const product = body.product

  let price: string
  try {
    price = priceId(product)
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }

  const stripe = getStripe()

  // Get or create a Stripe customer, storing the ID on the profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single()

  let customerId = (profile?.stripe_customer_id as string | null) ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      name: (profile?.full_name as string) ?? undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id
    await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    mode: isSubscriptionProduct(product) ? 'subscription' : 'payment',
    success_url: `${baseUrl}/dashboard?payment=success`,
    cancel_url: `${baseUrl}/dashboard`,
    metadata: { userId: user.id, product },
  })

  return Response.json({ url: session.url })
}

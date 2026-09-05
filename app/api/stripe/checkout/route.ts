import { NextRequest } from 'next/server'
import { getStripe, priceId, isProduct, isSubscriptionProduct } from '@/src/lib/stripe'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { product?: unknown; returnToWill?: boolean }
  const product = body.product
  if (!isProduct(product)) return Response.json({ error: 'Unknown product' }, { status: 400 })

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

  // For Will purchases, carry will_id and partner_referral_code into Stripe metadata
  // so the webhook can record payment status and referral attribution atomically.
  let willId: string | null = null
  let partnerCode: string | null = null
  if (product === 'will') {
    const { data: willRow } = await supabaseAdmin
      .from('wills')
      .select('id, partner_referral_code')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    willId = (willRow?.id as string | null) ?? null
    partnerCode = (willRow?.partner_referral_code as string | null) ?? null
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const returnToWill = product === 'will' || body.returnToWill === true
  const successPath = returnToWill ? '/will/new?payment=success&step=review' : '/dashboard?payment=success'
  const cancelPath = returnToWill ? '/will/new?step=review' : '/dashboard'

  const metadata: Record<string, string> = { userId: user.id, product }
  if (willId) metadata.will_id = willId
  if (partnerCode) metadata.partner_code = partnerCode

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    mode: isSubscriptionProduct(product) ? 'subscription' : 'payment',
    success_url: `${baseUrl}${successPath}`,
    cancel_url: `${baseUrl}${cancelPath}`,
    metadata,
  })

  return Response.json({ url: session.url })
}

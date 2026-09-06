import { NextRequest } from 'next/server'
import { getStripe, priceId, isProduct, isSubscriptionProduct } from '@/src/lib/stripe'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { product?: unknown; returnToWill?: boolean; embedded?: boolean }
  const product = body.product
  if (!isProduct(product)) return Response.json({ error: 'Unknown product' }, { status: 400 })
  const embedded = body.embedded === true
  // Read couple discount code from httpOnly cookie (set when visiting /start?partner=...)
  const coupleCode = request.cookies.get('hl_partner_code')?.value?.trim().toUpperCase() ?? null

  // Validate couple discount code if provided
  let stripePromoId: string | null = null
  if (coupleCode) {
    const { data: discountRow } = await supabaseAdmin
      .from('couple_discount_codes')
      .select('stripe_promo_id, generator_id, expires_at, used_at, product')
      .eq('code', coupleCode)
      .maybeSingle()
    if (
      discountRow &&
      !discountRow.used_at &&
      new Date(discountRow.expires_at as string) > new Date() &&
      discountRow.generator_id !== user.id &&
      discountRow.product === product
    ) {
      stripePromoId = discountRow.stripe_promo_id as string
    }
  }

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

  // For Will purchases, carry will_id and charity referral code into Stripe metadata
  let willId: string | null = null
  let charityReferralCode: string | null = null
  if (product === 'will') {
    const { data: willRow } = await supabaseAdmin
      .from('wills')
      .select('id, partner_referral_code')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    willId = (willRow?.id as string | null) ?? null
    charityReferralCode = (willRow?.partner_referral_code as string | null) ?? null
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const metadata: Record<string, string> = { userId: user.id, product }
  if (willId) metadata.will_id = willId
  if (charityReferralCode) metadata.partner_code = charityReferralCode
  if (coupleCode) metadata.couple_code = coupleCode

  const discounts = stripePromoId ? [{ promotion_code: stripePromoId }] : undefined

  if (embedded) {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      mode: isSubscriptionProduct(product) ? 'subscription' : 'payment',
      ui_mode: 'embedded_page' as const,
      return_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata,
      ...(discounts ? { discounts } : {}),
    })
    return Response.json({ clientSecret: session.client_secret })
  }

  const returnToWill = product === 'will' || body.returnToWill === true
  const successPath = returnToWill ? '/will/new?payment=success&step=review' : '/dashboard?payment=success'
  const cancelPath = returnToWill ? '/will/new?step=review' : '/dashboard'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    mode: isSubscriptionProduct(product) ? 'subscription' : 'payment',
    success_url: `${baseUrl}${successPath}`,
    cancel_url: `${baseUrl}${cancelPath}`,
    metadata,
    ...(discounts ? { discounts } : {}),
  })

  return Response.json({ url: session.url })
}

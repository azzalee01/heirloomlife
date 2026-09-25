import { NextRequest } from 'next/server'
import { getStripe, priceId, isProduct } from '@/src/lib/stripe'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { isLiveState } from '@/src/lib/availability'
import { hasWillAccess, hasUpdatesAccess } from '@/src/lib/entitlements'
import { PRICING } from '@/src/lib/pricing'

// Shown on the Stripe payment button whenever the annual updates add-on is in the basket (ACL: clear renewal terms).
const UPDATES_RENEWAL_NOTICE =
  `Unlimited updates renews every year at $${PRICING.updatesAudPerYear} (GST inclusive) until you cancel. Cancel any time from your dashboard. Your Will stays yours either way.`

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { product?: unknown; addUpdates?: boolean; returnToWill?: boolean; embedded?: boolean }
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
    const msg = (err as Error).message
    console.error('[checkout] missing price env var', { product, userId: user.id, error: msg })
    return Response.json({ error: 'Checkout is not available right now. Please contact support.' }, { status: 500 })
  }

  const stripe = getStripe()

  // Get or create a Stripe customer, storing the ID on the profile
  let profile: {
    stripe_customer_id: unknown; email: unknown; full_name: unknown
    plan: string | null; plan_status: string | null; updates_status: string | null; updates_active_until: string | null
  } | null
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email, full_name, plan, plan_status, updates_status, updates_active_until')
      .eq('id', user.id)
      .single()
    if (error) throw error
    profile = data
  } catch (err) {
    console.error('[checkout] profile lookup failed', { userId: user.id, error: (err as Error).message })
    return Response.json({ error: 'Unable to load your profile. Please try again.' }, { status: 500 })
  }

  // The updates add-on on its own is only for people who already own a Will, and only once.
  if (product === 'updates') {
    if (!hasWillAccess(profile)) {
      return Response.json({ error: 'Unlock your Will first, then add unlimited updates.' }, { status: 403 })
    }
    if (hasUpdatesAccess(profile)) {
      return Response.json({ error: 'Unlimited updates are already active on your account.' }, { status: 409 })
    }
  }

  // State availability gate — check testator state on user's latest will
  const { data: latestWill } = await supabaseAdmin
    .from('wills')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (latestWill) {
    const { data: testator } = await supabaseAdmin
      .from('testators')
      .select('state')
      .eq('will_id', (latestWill as { id: string }).id)
      .not('state', 'is', null)
      .limit(1)
      .maybeSingle()
    const userState = (testator as { state: string } | null)?.state ?? null
    if (userState && !isLiveState(userState)) {
      console.error('[checkout] state not live', { userId: user.id, userState })
      return Response.json({ error: 'Heirloom Life is not yet available in your state.' }, { status: 403 })
    }
  }

  let customerId = (profile?.stripe_customer_id as string | null) ?? null

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: (profile?.email as string | null) ?? user.email ?? undefined,
        name: (profile?.full_name as string) ?? undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    } catch (err) {
      console.error('[checkout] Stripe customer creation failed', { userId: user.id, error: (err as Error).message })
      return Response.json({ error: 'Unable to set up your payment profile. Please try again.' }, { status: 500 })
    }
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

  // Will + optional updates add-on share one Checkout Session (one-time + recurring line items => subscription mode).
  const addUpdatesWithWill = product === 'will' && body.addUpdates === true
  const lineItems: { price: string; quantity: number }[] = [{ price, quantity: 1 }]
  if (addUpdatesWithWill) {
    try {
      lineItems.push({ price: priceId('updates'), quantity: 1 })
    } catch (err) {
      console.error('[checkout] missing price env var', { product: 'updates', userId: user.id, error: (err as Error).message })
      return Response.json({ error: 'Checkout is not available right now. Please contact support.' }, { status: 500 })
    }
  }
  const includesUpdates = addUpdatesWithWill || product === 'updates'
  const mode: 'payment' | 'subscription' = includesUpdates ? 'subscription' : 'payment'

  const metadata: Record<string, string> = { userId: user.id, product, updates: includesUpdates ? 'true' : 'false' }
  if (willId) metadata.will_id = willId
  if (charityReferralCode) metadata.partner_code = charityReferralCode
  if (coupleCode) metadata.couple_code = coupleCode

  const discounts = stripePromoId ? [{ promotion_code: stripePromoId }] : undefined

  try {
    if (embedded) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: lineItems,
        mode,
        ui_mode: 'embedded_page' as const,
        return_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        metadata,
        ...(mode === 'subscription' ? { subscription_data: { metadata } } : {}),
        ...(includesUpdates ? { custom_text: { submit: { message: UPDATES_RENEWAL_NOTICE } } } : {}),
        ...(discounts ? { discounts } : {}),
      })
      return Response.json({ clientSecret: session.client_secret })
    }

    const returnToWill = product === 'will' || body.returnToWill === true
    const successPath = returnToWill ? '/will/new?payment=success&step=review' : '/dashboard?payment=success'
    const cancelPath = returnToWill ? '/will/new?step=review' : '/dashboard'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode,
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      metadata,
      ...(mode === 'subscription' ? { subscription_data: { metadata } } : {}),
      ...(includesUpdates ? { custom_text: { submit: { message: UPDATES_RENEWAL_NOTICE } } } : {}),
      ...(discounts ? { discounts } : {}),
    })

    return Response.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    console.error('[checkout] Stripe session creation failed', { userId: user.id, product, error: message })
    return Response.json({ error: message }, { status: 500 })
  }
}

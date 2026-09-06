import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getStripe, planName, isProduct, isSubscriptionProduct } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { addThreeMonths } from '@/src/lib/entitlements'

export const dynamic = 'force-dynamic'

const COUPLE_CODE_EXPIRY_DAYS = 60
const COUPLE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCoupleCode(): string {
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += COUPLE_CODE_CHARS[Math.floor(Math.random() * COUPLE_CODE_CHARS.length)]
  }
  return `HMPL-${suffix}`
}

async function createCoupleDiscountCode(userId: string, product: 'will' | 'vault') {
  const couponId = product === 'will'
    ? process.env.STRIPE_COUPON_WILL_PARTNER
    : process.env.STRIPE_COUPON_VAULT_PARTNER
  if (!couponId) return

  const discountCents = product === 'will' ? 4000 : 2000
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + COUPLE_CODE_EXPIRY_DAYS)

  // Generate a unique code, retrying on collision (astronomically unlikely)
  let code = generateCoupleCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabaseAdmin
      .from('couple_discount_codes')
      .select('id')
      .eq('code', code)
      .maybeSingle()
    if (!existing) break
    code = generateCoupleCode()
  }

  const stripe = getStripe()
  const promoCode = await stripe.promotionCodes.create({
    promotion: { type: 'coupon', coupon: couponId },
    code,
    max_redemptions: 1,
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    metadata: { generator_user_id: userId, product },
  })

  await supabaseAdmin.from('couple_discount_codes').insert({
    code,
    generator_id: userId,
    stripe_promo_id: promoCode.id,
    product,
    discount_cents: discountCents,
    expires_at: expiresAt.toISOString(),
  })
}

async function updateByCustomer(customerId: string, updates: Record<string, unknown>) {
  await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('stripe_customer_id', customerId)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) return new Response('Missing stripe-signature header', { status: 400 })

  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response(`Webhook signature error: ${(err as Error).message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const product = session.metadata?.product
      if (!userId || !isProduct(product)) break

      const updates: Record<string, unknown> = {
        stripe_customer_id: session.customer as string,
        plan: planName(product),
        plan_status: 'active',
        vault_access_until: product === 'will' ? addThreeMonths().toISOString() : null,
      }
      if (isSubscriptionProduct(product) && session.subscription) {
        updates.stripe_subscription_id = session.subscription as string
      }
      await supabaseAdmin.from('profiles').update(updates).eq('id', userId)

      // Record charity partner referral if attributed
      if (product === 'will') {
        const partnerCode = session.metadata?.partner_code
        const willId = session.metadata?.will_id
        if (partnerCode && willId) {
          const { data: partner } = await supabaseAdmin
            .from('charity_partners')
            .select('id')
            .eq('referral_code', partnerCode)
            .eq('active', true)
            .single()
          if (partner) {
            await supabaseAdmin.from('partner_referrals').insert({
              partner_id: partner.id,
              will_id: willId,
              user_id: userId,
            })
          }
        }
      }

      // Mark couple discount code as used if one was applied at checkout
      const usedCoupleCode = session.metadata?.couple_code
      if (usedCoupleCode) {
        await supabaseAdmin
          .from('couple_discount_codes')
          .update({ used_at: new Date().toISOString(), used_by_id: userId })
          .eq('code', usedCoupleCode)
          .is('used_at', null)
      }

      // Generate couple discount code for the purchaser (best-effort, non-blocking)
      try {
        // Only generate if one doesn't already exist for this user + product
        const { data: existing } = await supabaseAdmin
          .from('couple_discount_codes')
          .select('id')
          .eq('generator_id', userId)
          .eq('product', product)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle()
        if (!existing) {
          await createCoupleDiscountCode(userId, product)
        }
      } catch {
        // Non-fatal — user can still complete purchase without a couple code
      }

      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await updateByCustomer(sub.customer as string, {
        stripe_subscription_id: sub.id,
        plan_status: sub.status,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await updateByCustomer(sub.customer as string, {
        stripe_subscription_id: null,
        plan_status: 'cancelled',
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.parent?.subscription_details) {
        await updateByCustomer(invoice.customer as string, { plan_status: 'active' })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.parent?.subscription_details) {
        await updateByCustomer(invoice.customer as string, { plan_status: 'past_due' })
      }
      break
    }
  }

  return new Response('ok', { status: 200 })
}

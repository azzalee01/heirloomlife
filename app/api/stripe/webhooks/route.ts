import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getStripe, planName, isProduct, isSubscriptionProduct } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { addThreeMonths } from '@/src/lib/entitlements'

export const dynamic = 'force-dynamic'

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

      // Record partner referral if this Will was attributed to a charity partner
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

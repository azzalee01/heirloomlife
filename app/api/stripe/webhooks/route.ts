import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getStripe, isProduct, subscriptionPeriodEnd } from '@/src/lib/stripe'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { sendPurchaseConfirmationEmail, sendRewitnessingConfirmationEmail } from '@/src/lib/email'
import { sendMetaPurchase } from '@/src/lib/analytics/meta-capi'
import type { Attribution } from '@/src/lib/analytics/utm'

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

// Partner discount applies to the Will only (A$40 off => A$109). The updates add-on is never discounted.
// STRIPE_COUPON_WILL_PARTNER must be restricted in Stripe to the Will product (applies_to.products),
// otherwise it would also discount the add-on line when both are bought together.
async function createCoupleDiscountCode(userId: string) {
  const couponId = process.env.STRIPE_COUPON_WILL_PARTNER
  if (!couponId) return

  const discountCents = 4000
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
    metadata: { generator_user_id: userId, product: 'will' },
  })

  await supabaseAdmin.from('couple_discount_codes').insert({
    code,
    generator_id: userId,
    stripe_promo_id: promoCode.id,
    product: 'will',
    discount_cents: discountCents,
    expires_at: expiresAt.toISOString(),
  })
}

async function updateByCustomer(customerId: string, updates: Record<string, unknown>) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('stripe_customer_id', customerId)
  if (error) throw error
}

// Write a row to the real payment ledger. Idempotent via the unique session/invoice id.
// Non-fatal: a missing ledger row can be reconciled from Stripe; it must never fail a payment.
async function recordPayment(p: {
  userId?: string | null
  email: string | null
  product: string
  amountTotal: number
  currency: string
  sessionId?: string | null
  invoiceId?: string | null
  paymentIntent?: string | null
  customerId?: string | null
  livemode: boolean
}) {
  const onConflict = p.sessionId ? 'stripe_session_id' : 'stripe_invoice_id'
  const { error } = await supabaseAdmin.from('payments').upsert(
    {
      user_id: p.userId ?? null,
      email: p.email,
      product: p.product,
      amount_total: p.amountTotal,
      currency: p.currency.toLowerCase(),
      stripe_session_id: p.sessionId ?? null,
      stripe_invoice_id: p.invoiceId ?? null,
      stripe_payment_intent: p.paymentIntent ?? null,
      stripe_customer_id: p.customerId ?? null,
      livemode: p.livemode,
    },
    { onConflict, ignoreDuplicates: true },
  )
  if (error) console.error('[webhook] payments ledger write failed (non-fatal)', { error: error.message })
}

// Release the idempotency claim so Stripe's retry is processed instead of being acknowledged and dropped.
async function fail(eventId: string): Promise<Response> {
  const { error } = await supabaseAdmin.from('processed_webhook_events').delete().eq('stripe_event_id', eventId)
  if (error) console.error('[webhook] could not release idempotency claim', { eventId, error: error.message })
  return new Response('DB error', { status: 500 })
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

  // Idempotency: atomically claim this event before processing.
  // 23505 = unique_violation means it was already processed - safe to ack.
  const { error: claimErr } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({ stripe_event_id: event.id })
  if (claimErr) {
    if (claimErr.code === '23505') return new Response('ok', { status: 200 })
    console.error('[webhook] idempotency claim failed (continuing)', { eventId: event.id, error: claimErr.message })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const product = session.metadata?.product as 'will' | 'updates' | 'rewit' | undefined
        if (!userId || !isProduct(product)) break

        // The Will (one-off) and the updates subscription are recorded separately: a Will purchase never
        // depends on the subscription, and cancelling the subscription never touches plan / plan_status.
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null
        const includesUpdates = session.metadata?.updates === 'true' && !!subscriptionId

        const updates: Record<string, unknown> = {
          stripe_customer_id: session.customer as string,
        }
        if (product === 'will') {
          updates.plan = 'will'
          updates.plan_status = 'active'

          // Server-side ad conversion (source of truth). Deduped against the browser pixel via the
          // Stripe session id as event id. Non-blocking: analytics must never fail a payment.
          const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as const
          const attribution: Attribution = {}
          for (const k of attributionKeys) {
            const v = session.metadata?.[k]
            if (v) attribution[k] = v
          }
          void sendMetaPurchase({
            eventId: session.id,
            value: (session.amount_total ?? 0) / 100,
            currency: session.currency ?? 'aud',
            email: (session.customer_details as { email?: string | null } | null)?.email ?? null,
            attribution,
            eventSourceUrl: `${process.env.APP_URL ?? ''}/dashboard?payment=success`,
          })
        }
        if (product === 'rewit') {
          const { error: rewitErr } = await supabaseAdmin.rpc('increment_rewit_credits', { p_user_id: userId })
          if (rewitErr) {
            console.error('[webhook] increment_rewit_credits failed', { eventId: event.id, userId, error: rewitErr.message })
            return fail(event.id)
          }
          const emailAddress = (session.customer_details as { email?: string | null } | null)?.email ?? null
          if (emailAddress) {
            const { data: profileForEmail } = await supabaseAdmin.from('profiles').select('full_name').eq('id', userId).maybeSingle()
            sendRewitnessingConfirmationEmail({
              to: emailAddress,
              name: (profileForEmail?.full_name as string | null) ?? null,
            }).catch((err: unknown) => {
              console.error('[webhook] rewit confirmation email failed (non-fatal)', { eventId: event.id, userId, error: (err as Error).message })
            })
          }
        }
        if (includesUpdates && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          const end = subscriptionPeriodEnd(sub)
          updates.stripe_subscription_id = sub.id
          updates.updates_status = sub.status
          updates.updates_active_until = end ? end.toISOString() : null
        }

        const { error: profileErr } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId)
        if (profileErr) {
          console.error('[webhook] profiles.update failed', {
            eventId: event.id, userId, customerId: session.customer, error: profileErr.message,
          })
          return fail(event.id)
        }

        // Real money → payment ledger (source of truth for revenue). The session's amount_total is the
        // actual charged total (net of any discount); for a combined Will + updates purchase it covers both.
        await recordPayment({
          userId,
          email: (session.customer_details as { email?: string | null } | null)?.email ?? null,
          product: includesUpdates ? 'will+updates' : product,
          amountTotal: session.amount_total ?? 0,
          currency: session.currency ?? 'aud',
          sessionId: session.id,
          invoiceId: typeof session.invoice === 'string' ? session.invoice : session.invoice?.id ?? null,
          paymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
          customerId: session.customer as string,
          livemode: event.livemode,
        })

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
              const { error: referralErr } = await supabaseAdmin.from('partner_referrals').insert({
                partner_id: partner.id,
                will_id: willId,
                user_id: userId,
              })
              if (referralErr) {
                console.error('[webhook] partner_referrals.insert failed', {
                  eventId: event.id, userId, error: referralErr.message,
                })
                return fail(event.id)
              }
            }
          }
        }

        // Mark couple discount code as used if one was applied at checkout
        const usedCoupleCode = session.metadata?.couple_code
        if (usedCoupleCode) {
          const { error: coupleMarkErr } = await supabaseAdmin
            .from('couple_discount_codes')
            .update({ used_at: new Date().toISOString(), used_by_id: userId })
            .eq('code', usedCoupleCode)
            .is('used_at', null)
          if (coupleMarkErr) {
            console.error('[webhook] couple_discount_codes.update failed (non-fatal)', {
              eventId: event.id, userId, error: coupleMarkErr.message,
            })
          }
        }

        // Generate a partner discount code for a Will purchaser (best-effort, non-blocking)
        if (product === 'will') {
          try {
            // Only generate if one doesn't already exist for this user
            const { data: existing } = await supabaseAdmin
              .from('couple_discount_codes')
              .select('id')
              .eq('generator_id', userId)
              .eq('product', 'will')
              .is('used_at', null)
              .gt('expires_at', new Date().toISOString())
              .maybeSingle()
            if (!existing) {
              await createCoupleDiscountCode(userId)
            }
          } catch {
            console.error('[webhook] couple code generation failed (non-fatal)', { eventId: event.id, userId })
          }
        }

        // Send purchase confirmation email (best-effort, non-blocking) — skip for rewit
        const emailAddress = (session.customer_details as { email?: string | null } | null)?.email ?? null
        if (emailAddress && (product === 'will' || product === 'updates')) {
          const { data: profileForEmail } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .maybeSingle()
          sendPurchaseConfirmationEmail({
            to: emailAddress,
            name: (profileForEmail?.full_name as string | null) ?? null,
            product,
            includesUpdates,
          }).catch((err: unknown) => {
            console.error('[webhook] purchase confirmation email failed (non-fatal)', { eventId: event.id, userId, error: (err as Error).message })
          })
        }

        break
      }

      // Subscription lifecycle: these only ever touch the updates_* columns, never the Will (plan / plan_status).
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        try {
          const end = subscriptionPeriodEnd(sub)
          await updateByCustomer(sub.customer as string, {
            stripe_subscription_id: sub.id,
            updates_status: sub.status,
            ...(end ? { updates_active_until: end.toISOString() } : {}),
          })
        } catch (err) {
          console.error('[webhook] subscription.updated write failed', {
            eventId: event.id, customerId: sub.customer, error: (err as Error).message,
          })
          return fail(event.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        try {
          await updateByCustomer(sub.customer as string, {
            stripe_subscription_id: null,
            updates_status: 'cancelled',
            updates_active_until: new Date().toISOString(),
          })
        } catch (err) {
          console.error('[webhook] subscription.deleted write failed', {
            eventId: event.id, customerId: sub.customer, error: (err as Error).message,
          })
          return fail(event.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.parent?.subscription_details) {
          try {
            await updateByCustomer(invoice.customer as string, { updates_status: 'active' })
          } catch (err) {
            console.error('[webhook] invoice.payment_succeeded write failed', {
              eventId: event.id, customerId: invoice.customer, error: (err as Error).message,
            })
            return fail(event.id)
          }

          // Record subscription RENEWALS only. The first invoice (billing_reason 'subscription_create')
          // is already captured by the checkout.session.completed ledger write — recording it here too
          // would double-count.
          if (invoice.billing_reason === 'subscription_cycle') {
            const customerId = invoice.customer as string
            const { data: prof } = await supabaseAdmin
              .from('profiles')
              .select('id, email')
              .eq('stripe_customer_id', customerId)
              .maybeSingle()
            const pi = (invoice as unknown as { payment_intent?: string | { id?: string } | null }).payment_intent
            await recordPayment({
              userId: (prof?.id as string) ?? null,
              email: (prof?.email as string | null) ?? invoice.customer_email ?? null,
              product: 'updates',
              amountTotal: invoice.amount_paid ?? 0,
              currency: invoice.currency ?? 'aud',
              invoiceId: invoice.id,
              paymentIntent: typeof pi === 'string' ? pi : pi?.id ?? null,
              customerId,
              livemode: event.livemode,
            })
          }
        }
        break
      }

      // Refunds (full or partial) reduce net revenue. Requires 'charge.refunded' enabled on the Stripe
      // webhook endpoint. Matched to the ledger by payment intent.
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id ?? null
        if (pi) {
          const status = charge.amount_refunded >= charge.amount ? 'refunded' : 'partially_refunded'
          const { error } = await supabaseAdmin
            .from('payments')
            .update({ amount_refunded: charge.amount_refunded, status })
            .eq('stripe_payment_intent', pi)
          if (error) {
            console.error('[webhook] charge.refunded ledger update failed', { eventId: event.id, error: error.message })
            return fail(event.id)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.parent?.subscription_details) {
          try {
            await updateByCustomer(invoice.customer as string, { updates_status: 'past_due' })
          } catch (err) {
            console.error('[webhook] invoice.payment_failed write failed', {
              eventId: event.id, customerId: invoice.customer, error: (err as Error).message,
            })
            return fail(event.id)
          }
        }
        break
      }
    }
  } catch (err) {
    console.error('[webhook] handler threw', { eventId: event.id, type: event.type, error: (err as Error).message })
    return fail(event.id)
  }

  return new Response('ok', { status: 200 })
}

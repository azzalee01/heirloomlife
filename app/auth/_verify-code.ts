import type { EmailOtpType } from '@supabase/supabase-js'

type VerifyOtpFn = (p: { email: string; token: string; type: EmailOtpType }) => Promise<{ error: unknown }>

// Sign-up (a new / still-unconfirmed account) verifies the 6-digit code with
// type 'signup'; an existing user signs in with 'email'. Supabase can be picky
// about which applies for a given account state, so we try the flow's primary
// type and fall back to the other before surfacing an error.
export function otpTypesForFlow(isSignUp: boolean): [EmailOtpType, EmailOtpType] {
  return isSignUp ? ['signup', 'email'] : ['email', 'signup']
}

export async function verifyEmailCode(
  verifyOtp: VerifyOtpFn,
  opts: { email: string; token: string; isSignUp: boolean }
): Promise<{ error: unknown }> {
  const [primary, fallback] = otpTypesForFlow(opts.isSignUp)
  const first = await verifyOtp({ email: opts.email, token: opts.token, type: primary })
  if (!first.error) return { error: null }
  return verifyOtp({ email: opts.email, token: opts.token, type: fallback })
}

import { Resend } from 'resend'

// Branded Heirloom Life auth emails, sent via Resend from our own domain in
// response to Supabase's "Send Email" auth hook — so magic-link / confirmation
// emails are Heirloom-themed instead of the default "Supabase Auth" template.
// Style intentionally matches src/lib/email.ts (DM Sans + Georgia italic wordmark,
// teal #2AB4AE). See app/api/auth/email-hook/route.ts for the caller.

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? 'Heirloom Life <onboarding@resend.dev>'

// Lazy so importing renderAuthEmail() (e.g. for previews/tests) doesn't require
// RESEND_API_KEY — the Resend constructor throws on a missing key.
let _resend: Resend | null = null
function resendClient(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

// Supabase email_action_type values we may receive via the hook.
export type AuthEmailAction =
  | 'signup'
  | 'magiclink'
  | 'recovery'
  | 'invite'
  | 'email_change'
  | 'email_change_new'
  | 'reauthentication'

type Copy = { subject: string; heading: string; intro: string; cta: string }

const COPY: Record<string, Copy> = {
  signup: {
    subject: 'Confirm your email  -  Heirloom Life',
    heading: 'Confirm your email',
    intro: 'Welcome to Heirloom Life. Confirm your email address to finish setting up your account and open your Will.',
    cta: 'Confirm email address',
  },
  magiclink: {
    subject: 'Your Heirloom Life sign-in link',
    heading: 'Sign in to Heirloom Life',
    intro: 'Click the button below to securely sign in to your account. No password needed.',
    cta: 'Sign in to Heirloom Life',
  },
  recovery: {
    subject: 'Reset your Heirloom Life password',
    heading: 'Reset your password',
    intro: 'Click the button below to set a new password for your Heirloom Life account.',
    cta: 'Reset password',
  },
  invite: {
    subject: 'You’ve been invited to Heirloom Life',
    heading: 'You’ve been invited',
    intro: 'You’ve been invited to Heirloom Life. Accept the invitation below to set up your account.',
    cta: 'Accept invitation',
  },
  email_change: {
    subject: 'Confirm your new email  -  Heirloom Life',
    heading: 'Confirm your new email',
    intro: 'Confirm this email address to finish updating the email on your Heirloom Life account.',
    cta: 'Confirm new email',
  },
}

const FALLBACK: Copy = {
  subject: 'Heirloom Life',
  heading: 'Continue to Heirloom Life',
  intro: 'Click the button below to continue.',
  cta: 'Continue to Heirloom Life',
}

function copyFor(action: string): Copy {
  if (action === 'email_change_new') return COPY.email_change
  if (action === 'reauthentication') return COPY.magiclink
  return COPY[action] ?? FALLBACK
}

export function renderAuthEmail(action: string, confirmUrl: string): { subject: string; html: string } {
  const c = copyFor(action)
  const html = `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1310;margin:0 0 16px;">
        ${c.heading}
      </h1>
      <p style="margin:0 0 24px;color:#0E1310;font-size:14px;line-height:1.6;">
        ${c.intro}
      </p>
      <a href="${confirmUrl}" style="display:inline-block;padding:12px 28px;background:#2AB4AE;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:4px;">
        ${c.cta}
      </a>
      <p style="margin:24px 0 0;color:#8A8D87;font-size:12px;line-height:1.5;">
        If the button doesn’t work, copy and paste this link into your browser:<br/>
        <a href="${confirmUrl}" style="color:#2AB4AE;word-break:break-all;">${confirmUrl}</a>
      </p>
      <p style="margin:16px 0 0;color:#8A8D87;font-size:11px;line-height:1.5;">
        This link expires in 1 hour and can only be used once. If you didn’t request this, you can safely ignore this email.
        Heirloom Life is not a law firm  -  your Will is a template document and should be signed and witnessed to be legally valid.
      </p>
    </div>
  `
  return { subject: c.subject, html }
}

export async function sendAuthEmail(params: { to: string; action: string; confirmUrl: string }): Promise<void> {
  const { to, action, confirmUrl } = params
  const { subject, html } = renderAuthEmail(action, confirmUrl)
  await resendClient().emails.send({ from: FROM_ADDRESS, to, subject, html })
}

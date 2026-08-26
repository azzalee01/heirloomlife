import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? 'Heirloom Life <onboarding@resend.dev>'

const APP_URL = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function sendResumeEmail(params: { to: string; sessionId: string }) {
  const { to, sessionId } = params
  const resumeUrl = `${APP_URL}/resume?session=${sessionId}`

  const html = `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1310;margin:0 0 16px;">
        Resume your Will
      </h1>
      <p style="margin:0 0 20px;color:#0E1310;font-size:14px;line-height:1.6;">
        Your progress has been saved. Click the button below to pick up where you left off  -  no account needed yet.
      </p>
      <a href="${resumeUrl}" style="display:inline-block;padding:12px 24px;background:rgba(42,180,174,0.1);border:1px solid rgba(42,180,174,0.35);color:#163E3B;font-size:14px;font-weight:600;text-decoration:none;">
        Continue your Will
      </a>
      <p style="margin:24px 0 0;color:#8A8D87;font-size:12px;">
        If the button doesn't work, copy this link: ${resumeUrl}
      </p>
      <p style="margin:16px 0 0;color:#8A8D87;font-size:11px;line-height:1.5;">
        This link is tied to your session and will work for 30 days. Heirloom Life is not a law firm  -  your Will is a template document and should be signed and witnessed to be legally valid.
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'Resume your Will  -  Heirloom Life',
      html,
    })
  } catch (err) {
    console.error(`Failed to send resume email to ${to}:`, err)
  }
}

export async function sendWitnessInviteEmail(params: {
  to: string
  witnessName: string
  testatorName: string
  inviteUrl: string
  scheduledAt: string | null
}) {
  const { to, witnessName, testatorName, inviteUrl, scheduledAt } = params

  const whenLine = scheduledAt
    ? `<p style="margin:0 0 16px;color:#0E1310;font-size:14px;">
         Scheduled for <strong>${new Date(scheduledAt).toLocaleString('en-AU', {
           weekday: 'long',
           year: 'numeric',
           month: 'long',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit',
         })}</strong>.
       </p>`
    : `<p style="margin:0 0 16px;color:#0E1310;font-size:14px;">
         No time has been set yet  -  please use the link below to pick a time that works for you.
       </p>`

  const html = `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1310;margin:0 0 16px;">
        Hi ${witnessName}, ${testatorName} has asked you to witness their will signing
      </h1>
      <p style="margin:0 0 16px;color:#0E1310;font-size:14px;line-height:1.6;">
        You'll join a short video call and watch ${testatorName} sign their will in real time, in line with
        Part 2B of the Electronic Transactions Act 2000 (NSW).
      </p>
      ${whenLine}
      <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:rgba(42,180,174,0.1);border:1px solid rgba(42,180,174,0.35);color:#163E3B;font-size:14px;font-weight:600;text-decoration:none;">
        View invite
      </a>
      <p style="margin:24px 0 0;color:#8A8D87;font-size:12px;">
        If the button doesn't work, copy this link: ${inviteUrl}
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `${testatorName} has asked you to witness their will signing`,
      html,
    })
  } catch (err) {
    // Scheduling should still succeed even if the email fails to send  - 
    // the testator can always copy the invite link manually as a fallback.
    console.error(`Failed to send witness invite email to ${to}:`, err)
  }
}

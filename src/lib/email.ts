import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? 'Heirloom Life <onboarding@resend.dev>'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

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

export async function sendCharityEnquiryEmail(params: {
  orgName: string
  contactName: string
  email: string
  role: string
  orgType: string
  message: string
}) {
  const { orgName, contactName, email, role, orgType, message } = params

  const html = `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1310;margin:0 0 20px;">New charity enquiry</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0E1310;">
        <tr><td style="padding:8px 0;color:#8A8D87;width:140px;">Organisation</td><td style="padding:8px 0;font-weight:600;">${orgName}</td></tr>
        <tr><td style="padding:8px 0;color:#8A8D87;">Type</td><td style="padding:8px 0;">${orgType || 'Not specified'}</td></tr>
        <tr><td style="padding:8px 0;color:#8A8D87;">Contact</td><td style="padding:8px 0;">${contactName}${role ? ` &mdash; ${role}` : ''}</td></tr>
        <tr><td style="padding:8px 0;color:#8A8D87;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#2AB4AE;">${email}</a></td></tr>
        ${message ? `<tr><td style="padding:8px 0;color:#8A8D87;vertical-align:top;">Message</td><td style="padding:8px 0;line-height:1.6;">${message}</td></tr>` : ''}
      </table>
    </div>
  `

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: 'hello@heirloomlife.com.au',
    replyTo: email,
    subject: `Charity enquiry: ${orgName}`,
    html,
  })
}

export async function sendPurchaseConfirmationEmail(params: {
  to: string
  name: string | null
  product: 'will' | 'updates'
  includesUpdates?: boolean
}) {
  const { to, name, product, includesUpdates = false } = params
  const dashboardUrl = `${APP_URL}/dashboard`
  const firstName = name ? name.split(' ')[0] : null
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'

  const subject = product === 'updates'
    ? 'Unlimited updates are now active'
    : 'Your Heirloom Will is ready'

  const legalFooter = `
      <p style="margin:16px 0 0;color:#8A8D87;font-size:11px;line-height:1.5;">
        Heirloom Life is not a law firm and this is not legal advice. Your Will is a template document and must be signed and witnessed to be legally valid.
      </p>`

  const renewalNote = `
      <p style="margin:24px 0 0;color:#8A8D87;font-size:12px;line-height:1.5;">
        Unlimited updates renews every year at $25 (GST inclusive) until you cancel. You can cancel at any time from your dashboard. Your completed Will remains yours to keep either way.
      </p>`

  const button = `
      <a href="${dashboardUrl}" style="${"display:inline-block;padding:12px 24px;background:rgba(42,180,174,0.1);border:1px solid rgba(42,180,174,0.35);color:#163E3B;font-size:14px;font-weight:500;text-decoration:none;"}">
        Go to your dashboard
      </a>`

  const html = product === 'updates'
    ? `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1310;margin:0 0 16px;">${greeting}</h1>
      <p style="margin:0 0 16px;color:#0E1310;font-size:14px;line-height:1.6;">
        Unlimited updates are now active on your account. You can change your Will as your life changes, as many times as you need, and download each new version.
      </p>
${button}${renewalNote}${legalFooter}
    </div>
  `
    : `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1310;margin:0 0 16px;">${greeting} your Will is ready.</h1>
      <p style="margin:0 0 20px;color:#0E1310;font-size:14px;line-height:1.6;">
        Your Will is available to download from your dashboard.${includesUpdates ? ' Unlimited updates are also active, so you can change your Will whenever life changes.' : ''}
      </p>
${button}
      <p style="margin:24px 0 0;color:#8A8D87;font-size:12px;">
        Sign and date your Will in front of two witnesses to make it legally valid. Your dashboard has step-by-step guidance on what to do next.
      </p>${includesUpdates ? renewalNote : ''}${legalFooter}
    </div>
  `

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html })
  } catch (err) {
    console.error(`Failed to send purchase confirmation to ${to}:`, err)
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

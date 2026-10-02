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

// ─── Guided appointments ────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const APPT_TZ = 'Australia/Sydney'

function formatApptTime(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: APPT_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(iso))
}

function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function buildIcs(params: { id: string; startsAt: string; endsAt: string; joinUrl: string }): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Heirloom Life//Guided call//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${params.id}@heirloomlife.com.au`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(params.startsAt)}`,
    `DTEND:${icsStamp(params.endsAt)}`,
    'SUMMARY:Heirloom Life guided call',
    `DESCRIPTION:Join your video call: ${params.joinUrl}`,
    `URL:${params.joinUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function apptButton(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;padding:14px 28px;background:rgba(42,180,174,0.1);border:1px solid rgba(42,180,174,0.35);color:#163E3B;font-size:16px;font-weight:600;text-decoration:none;">${label}</a>`
}

const APPT_LEGAL_FOOTER = `
      <p style="margin:16px 0 0;color:#8A8D87;font-size:11px;line-height:1.5;">
        Heirloom Life is not a law firm and your guide cannot give legal advice. Your Will is a template document and must be signed and witnessed to be legally valid.
      </p>`

export async function sendAppointmentConfirmationEmail(params: {
  to: string
  name: string
  appointmentId: string
  startsAt: string
  endsAt: string
  joinUrl: string
  bookedBy?: string | null // set when someone else booked this for the recipient
  forCustomer?: string | null // set when the recipient is the booker: the name of the person the call is for
}): Promise<boolean> {
  const { to, name, appointmentId, startsAt, endsAt, joinUrl, bookedBy, forCustomer } = params
  const when = formatApptTime(startsAt)
  const html = `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#0E1310;margin:0 0 16px;">${forCustomer ? 'Guided call booked' : 'Your guided call is booked'}</h1>
      <p style="margin:0 0 8px;color:#0E1310;font-size:16px;line-height:1.6;">Hi ${esc(name.split(' ')[0])},</p>
      ${bookedBy ? `<p style="margin:0 0 8px;color:#0E1310;font-size:16px;line-height:1.6;">${esc(bookedBy)} booked this call for you.</p>` : ''}
      <p style="margin:0 0 20px;color:#0E1310;font-size:16px;line-height:1.6;">
        ${forCustomer ? `You&rsquo;ve booked a guided call for <strong>${esc(forCustomer)}</strong>. On the day, open the link below to join them.` : 'We&rsquo;ll talk you through your Will on a video call.'}<br/>
        <strong>${esc(when)}</strong>
      </p>
      <p style="margin:0 0 20px;">${apptButton(joinUrl, 'Join your call')}</p>
      <p style="margin:0 0 12px;color:#0E1310;font-size:14px;line-height:1.6;">
        Use this same link when it&rsquo;s time. It works on a phone, tablet or computer, and you don&rsquo;t need to install anything. You can join up to 15 minutes early.
      </p>
      <p style="margin:0 0 12px;color:#0E1310;font-size:14px;line-height:1.6;">
        The call is recorded so there is an accurate record of how your Will was prepared. You&rsquo;ll be asked to agree before it starts.
      </p>
      <p style="margin:0;color:#8A8D87;font-size:12px;line-height:1.5;">
        Need to change the time? Open the link above and choose &ldquo;Cancel this booking&rdquo;, then book a new time. If the button doesn&rsquo;t work, copy this link: ${joinUrl}
      </p>${APPT_LEGAL_FOOTER}
    </div>
  `
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'Your Heirloom Life guided call is booked',
      html,
      attachments: [
        {
          filename: 'heirloom-guided-call.ics',
          content: Buffer.from(buildIcs({ id: appointmentId, startsAt, endsAt, joinUrl }), 'utf-8'),
        },
      ],
    })
    if (error) {
      console.error(`Resend rejected appointment confirmation to ${to}:`, error)
      return false
    }
    return true
  } catch (err) {
    console.error(`Failed to send appointment confirmation to ${to}:`, err)
    return false
  }
}

export async function sendAppointmentReminderEmail(params: {
  to: string
  name: string
  startsAt: string
  joinUrl: string
  window: '24h' | '1h'
}): Promise<boolean> {
  const { to, name, startsAt, joinUrl, window } = params
  const when = formatApptTime(startsAt)
  const lead = window === '24h' ? 'Your guided call is coming up' : 'Your guided call starts in about an hour'
  const html = `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#0E1310;margin:0 0 16px;">${lead}</h1>
      <p style="margin:0 0 20px;color:#0E1310;font-size:16px;line-height:1.6;">
        Hi ${esc(name.split(' ')[0])}, <strong>${esc(when)}</strong>.
      </p>
      <p style="margin:0 0 20px;">${apptButton(joinUrl, 'Join your call')}</p>
      <p style="margin:0;color:#8A8D87;font-size:12px;line-height:1.5;">
        If the button doesn&rsquo;t work, copy this link: ${joinUrl}
      </p>${APPT_LEGAL_FOOTER}
    </div>
  `
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: window === '24h' ? 'Reminder: your Heirloom Life call is coming up' : 'Your Heirloom Life call starts soon',
      html,
    })
    if (error) {
      console.error(`Resend rejected appointment reminder to ${to}:`, error)
      return false
    }
    return true
  } catch (err) {
    console.error(`Failed to send appointment reminder to ${to}:`, err)
    return false
  }
}

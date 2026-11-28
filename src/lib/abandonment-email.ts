// Pure render for the will-abandonment reminder emails (no Resend client, so it's
// safe to import in tests). The send wrapper lives in src/lib/email.ts.
//
// 'nudge' = started the wizard, not finished → gentle "continue".
// 'ready' = finished every step but hasn't paid → "your Will is ready, unlock it".
export function renderWillAbandonmentEmail(params: {
  firstName: string | null
  kind: 'nudge' | 'ready'
  dashboardUrl: string
  unsubscribeUrl: string
}): { subject: string; html: string } {
  const { firstName, kind, dashboardUrl, unsubscribeUrl } = params
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'
  const copy = kind === 'ready'
    ? {
        subject: 'Your Will is ready — Heirloom Life',
        intro: "Good news — you've completed every step of your Will. It's ready whenever you are: unlock it to download your Will and get step-by-step signing instructions.",
        cta: 'Unlock your Will',
      }
    : {
        subject: 'Your Will is still waiting — Heirloom Life',
        intro: 'You started a Will with Heirloom a few days ago. Your answers are saved, so you can pick up right where you left off. Most people finish in about 20 minutes.',
        cta: 'Continue your Will',
      }

  const html = `
    <div style="font-family:-apple-system,'DM Sans',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:20px;margin:0 0 24px;">Heirloom</p>
      <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1310;margin:0 0 16px;">${greeting}</h1>
      <p style="margin:0 0 24px;color:#0E1310;font-size:14px;line-height:1.6;">${copy.intro}</p>
      <a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:rgba(42,180,174,0.1);border:1px solid rgba(42,180,174,0.35);color:#163E3B;font-size:14px;font-weight:600;text-decoration:none;">${copy.cta}</a>
      <p style="margin:28px 0 0;color:#8A8D87;font-size:12px;line-height:1.5;">
        Heirloom Life Pty Ltd &middot; Sydney, NSW &middot; <a href="mailto:hello@heirloomlife.com.au" style="color:#8A8D87;">hello@heirloomlife.com.au</a><br/>
        You're receiving this because you began a Will at heirloomlife.com.au.
        <a href="${unsubscribeUrl}" style="color:#8A8D87;text-decoration:underline;">Unsubscribe</a> to stop these reminders.
      </p>
      <p style="margin:12px 0 0;color:#8A8D87;font-size:11px;line-height:1.5;">
        Heirloom Life is not a law firm and this is not legal advice. Your Will is a template document and must be signed and witnessed to be legally valid.
      </p>
    </div>
  `
  return { subject: copy.subject, html }
}

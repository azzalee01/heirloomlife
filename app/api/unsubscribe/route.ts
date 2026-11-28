import { supabaseAdmin } from '@/src/lib/supabase-server'
import { verifyUnsubscribeToken } from '@/src/lib/unsubscribe'

export const runtime = 'nodejs'

// One-click unsubscribe from reminder/marketing emails (Spam Act). GET so the
// email link works directly; the HMAC token authorises the specific user.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('u') ?? ''
  const token = url.searchParams.get('t') ?? ''

  if (!verifyUnsubscribeToken(userId, token)) {
    return new Response(page('This unsubscribe link is invalid or has expired.'), {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  await supabaseAdmin.from('profiles').update({ email_opt_out: true }).eq('id', userId)

  return new Response(
    page("You've been unsubscribed from Heirloom Life reminder emails. You'll still receive essential messages about your account and Will."),
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

function page(message: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heirloom Life</title></head>
  <body style="font-family:-apple-system,'DM Sans',sans-serif;max-width:480px;margin:64px auto;padding:0 24px;color:#0E1310;">
    <p style="font-family:Georgia,serif;font-style:italic;color:#2AB4AE;font-size:22px;margin:0 0 24px;">Heirloom</p>
    <p style="font-size:15px;line-height:1.6;">${message}</p>
    <p style="font-size:13px;color:#8A8D87;margin-top:24px;">Heirloom Life Pty Ltd · Sydney, NSW · <a href="mailto:hello@heirloomlife.com.au" style="color:#2AB4AE;">hello@heirloomlife.com.au</a></p>
  </body></html>`
}

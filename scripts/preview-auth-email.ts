import { writeFileSync } from 'node:fs'
import { renderAuthEmail } from '../src/lib/auth-email'

const confirmUrl =
  'https://heirloomlife.com.au/auth/confirm?token_hash=pkce_7f3c2a&type=magiclink&next=%2Fdashboard'

for (const action of ['signup', 'magiclink'] as const) {
  const { subject, html } = renderAuthEmail(action, confirmUrl)
  const out = `/tmp/auth-email-${action}.html`
  writeFileSync(out, `<!-- subject: ${subject} -->\n<body style="background:#F7F6F3;padding:24px;">${html}</body>`)
  console.log(`${action.padEnd(10)} → ${out}   subject: "${subject}"`)
}

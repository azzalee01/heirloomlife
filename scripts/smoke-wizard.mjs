/**
 * Post-deploy smoke: hit a base URL and fail non-zero if the wizard is unhealthy.
 *
 *   SMOKE_BASE_URL=https://<preview>.vercel.app \
 *   WIZARD_HEALTH_SECRET=… [CRON_SECRET=…] npm run smoke
 *
 * Runs the /api/health/wizard dry-run (per-step validation + Will generation; NO DB
 * writes, prod-safe). If CRON_SECRET + SMOKE_RUN_CRON=1 are set, also pings the
 * abandonment cron in dry-run mode so the endpoint is exercised WITHOUT sending email.
 * It cleans up after itself because the health check creates no data.
 *
 * NOTE: a full authenticated wizard walk (real saves on a test account) lives in the
 * Playwright suite (e2e/) against a TEST Supabase branch — intentionally not done here,
 * so this script never writes to whatever env it points at.
 */
const base = process.env.SMOKE_BASE_URL
const healthSecret = process.env.WIZARD_HEALTH_SECRET
if (!base || !healthSecret) {
  console.error('SMOKE_BASE_URL and WIZARD_HEALTH_SECRET are required.')
  process.exit(2)
}

let failed = false
const report = []

async function check(name, run) {
  try {
    const detail = await run()
    report.push({ name, pass: true, detail })
  } catch (e) {
    failed = true
    report.push({ name, pass: false, detail: e?.message ?? String(e) })
  }
}

await check('health/wizard dry-run', async () => {
  const res = await fetch(`${base.replace(/\/$/, '')}/api/health/wizard`, {
    headers: { authorization: `Bearer ${healthSecret}` },
  })
  const body = await res.json().catch(() => ({}))
  if (res.status !== 200 || !body.ok) {
    const bad = (body.checks ?? []).filter((c) => !c.pass).map((c) => `${c.step}: ${c.detail}`)
    throw new Error(`status ${res.status}; failing steps: ${bad.join(', ') || 'unknown'}`)
  }
  return `all ${body.checks.length} step checks passed`
})

if (process.env.SMOKE_RUN_CRON === '1' && process.env.CRON_SECRET) {
  await check('cron/will-abandonment dry-run', async () => {
    // Requires the cron to honour ?dryRun=1 (skip email send). Scaffolded — see README.
    const res = await fetch(`${base.replace(/\/$/, '')}/api/cron/will-abandonment?dryRun=1`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    return 'reachable'
  })
}

for (const r of report) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name} — ${r.detail}`)
process.exit(failed ? 1 : 0)

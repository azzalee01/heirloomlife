import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Regression guard for PGRST201. `wills` has TWO foreign keys to `profiles`
// (wills_user_id_fkey + wills_solicitor_id_fkey), so any bare wills→profiles
// embed is ambiguous and fails at runtime. Every such embed must name the FK.
const FILES = [
  'app/api/cron/will-abandonment/route.ts',
  'app/admin/wills/page.tsx',
  'app/admin/wills/[willId]/page.tsx',
  'app/admin/wills/_actions.ts',
]

describe('wills→profiles embeds are disambiguated (PGRST201 guard)', () => {
  for (const f of FILES) {
    it(`${f} names the FK and has no ambiguous embed`, () => {
      const src = readFileSync(join(process.cwd(), f), 'utf8')
      expect(src).not.toMatch(/profiles\(/) // bare "profiles(...)"
      expect(src).not.toMatch(/profiles!inner\(/) // bare "profiles!inner(...)"
      expect(src).toMatch(/profiles!wills_user_id_fkey/)
    })
  }
})

describe('abandonment cron never emails paid wills or opted-out users', () => {
  it('filters status=draft (paid never) and excludes email_opt_out', () => {
    const src = readFileSync(join(process.cwd(), 'app/api/cron/will-abandonment/route.ts'), 'utf8')
    expect(src).toMatch(/\.eq\('status', 'draft'\)/)       // paid wills (non-draft) excluded
    expect(src).toMatch(/profiles\.email_opt_out', false/) // opted-out users excluded
  })
})

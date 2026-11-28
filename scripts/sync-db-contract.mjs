/**
 * Regenerate app/will/new/__tests__/db-contract.generated.ts from the live DB's CHECK
 * constraints (catalog read only — touches no table data). Run after a constraint
 * migration so the offline contract test reflects the DB.
 *
 *   SUPABASE_DB_URL="postgres://user:pass@host:5432/postgres" npm run sync:db-contract
 *
 * Point SUPABASE_DB_URL at a Supabase branch, a local stack, or a read-only prod role —
 * NOT a prod read/write role for routine use. Requires node-postgres: `npm i -D pg`.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const TABLES = [
  'testators', 'children', 'guardians', 'executors', 'assets',
  'beneficiaries', 'specific_gifts', 'wills', 'personal_wishes',
]

const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.error('SUPABASE_DB_URL is required (point it at a branch/local/read-only DB, never a prod write role).')
  process.exit(1)
}

let pg
try {
  pg = (await import('pg')).default
} catch {
  console.error('node-postgres not installed. Run: npm i -D pg')
  process.exit(1)
}

const host = (() => { try { return new URL(url).host } catch { return '(unparseable)' } })()
console.error(`Reading CHECK constraints from ${host} …`)

const client = new pg.Client({ connectionString: url })
await client.connect()
const { rows } = await client.query(
  `select rel.relname as table, pg_get_constraintdef(con.oid) as def
     from pg_constraint con
     join pg_class rel on rel.oid = con.conrelid
     join pg_namespace n on n.oid = rel.relnamespace
    where n.nspname = 'public' and con.contype = 'c' and rel.relname = ANY($1)`,
  [TABLES],
)
await client.end()

// Parse "CHECK ((<col> = ANY (ARRAY['a'::text, 'b'::text])))" into column → [values].
const allowed = {}
for (const { table, def } of rows) {
  const col = def.match(/\((\w+)\s*=\s*ANY/)
  const arr = def.match(/ARRAY\[([^\]]+)\]/)
  if (!col || !arr) continue // skip non-enum checks (length/null guards)
  const values = [...arr[1].matchAll(/'([^']*)'/g)].map((m) => m[1])
  if (values.length) allowed[`${table}.${col[1]}`] = values
}

const sorted = Object.fromEntries(Object.entries(allowed).sort(([a], [b]) => a.localeCompare(b)))
const body =
  `/**\n` +
  ` * AUTO-GENERATED from the live DB CHECK constraints on the tables the wizard writes to.\n` +
  ` * Do NOT edit by hand. Regenerate: SUPABASE_DB_URL=… npm run sync:db-contract\n` +
  ` */\n` +
  `export const DB_CHECK_ALLOWED: Record<string, readonly string[]> = ${JSON.stringify(sorted, null, 2)}\n`

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'app/will/new/__tests__/db-contract.generated.ts')
writeFileSync(out, body)
console.error(`Wrote ${Object.keys(sorted).length} constrained columns → ${out}`)

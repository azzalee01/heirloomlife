/**
 * UI/code → DB CHECK-constraint contract.
 *
 * Every value the wizard can write to a CHECK-constrained column must be allowed by the
 * live DB. This catches the "We couldn't save your changes" class of bug — e.g. the UI
 * offering ownership_type 'entity' or asset_type 'digital_asset' before a migration
 * allowed them — WITHOUT anyone clicking through the wizard.
 *
 * Offline: compares code constants (_wizard-options.ts) against a committed snapshot of
 * the DB constraints (db-contract.generated.ts, refreshed by `npm run sync:db-contract`).
 * Add a UI option without the matching migration → this fails in CI.
 *
 * Run:  npx vitest run app/will/new/__tests__/db-contract.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UI_OPTION_VALUES, SERVER_WRITTEN_VALUES } from '../_wizard-options'
import { DB_CHECK_ALLOWED } from './db-contract.generated'

// Every code-side value that can reach a CHECK-constrained column, keyed by column.
const CODE_VALUES_BY_COLUMN: Record<string, readonly string[]> = {
  ...UI_OPTION_VALUES,
  ...SERVER_WRITTEN_VALUES,
}

describe('UI/code → DB CHECK contract', () => {
  for (const [column, codeValues] of Object.entries(CODE_VALUES_BY_COLUMN)) {
    describe(column, () => {
      const allowed = DB_CHECK_ALLOWED[column]

      it('has a known DB constraint snapshot', () => {
        // If this fails, the column lost its CHECK or the snapshot is stale — run the sync.
        expect(allowed, `no DB_CHECK_ALLOWED entry for ${column}`).toBeDefined()
      })

      for (const value of codeValues) {
        it(`DB accepts "${value}"`, () => {
          expect(
            allowed,
            `${column}: code can write "${value}" but the DB CHECK does not allow it. ` +
              `Add a migration widening the constraint, then run \`npm run sync:db-contract\`.`,
          ).toContain(value)
        })
      }
    })
  }

  it('covers every CHECK-constrained wizard column the code writes to', () => {
    // Guards against a new constrained column being added without a contract mapping.
    // Columns in the snapshot that the code never writes a *chosen* value to (server-managed
    // like payment_status / product_type / subscription_status) are intentionally excluded.
    const mapped = new Set(Object.keys(CODE_VALUES_BY_COLUMN))
    const serverManaged = new Set([
      'wills.payment_status',
      'wills.product_type',
      'wills.subscription_status',
    ])
    const unmapped = Object.keys(DB_CHECK_ALLOWED).filter(
      (c) => !mapped.has(c) && !serverManaged.has(c),
    )
    expect(
      unmapped,
      `these DB-constrained columns have no code mapping in _wizard-options.ts: ${unmapped.join(', ')}`,
    ).toEqual([])
  })
})

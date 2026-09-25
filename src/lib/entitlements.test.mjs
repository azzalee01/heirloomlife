// Run: node --test src/lib/entitlements.test.mjs   (Node 22.18+ runs the .ts import directly)
import test from 'node:test'
import assert from 'node:assert/strict'
import { hasWillAccess, hasUpdatesAccess, hasUsedIncludedSigning } from './entitlements.ts'

const now = new Date('2026-10-01T00:00:00Z')
const future = '2027-10-01T00:00:00Z'
const past = '2026-09-01T00:00:00Z'

test('paid Will grants Will access; free and unpaid do not', () => {
  assert.equal(hasWillAccess({ plan: 'will', plan_status: 'active' }), true)
  assert.equal(hasWillAccess({ plan: 'vault', plan_status: 'active' }), true) // legacy value
  assert.equal(hasWillAccess({ plan: 'free', plan_status: null }), false)
  assert.equal(hasWillAccess({ plan: 'will', plan_status: 'cancelled' }), false)
  assert.equal(hasWillAccess(null), false)
})

test('cancelling or failing the updates subscription never removes a paid Will', () => {
  const cancelled = { plan: 'will', plan_status: 'active', updates_status: 'cancelled', updates_active_until: past }
  assert.equal(hasWillAccess(cancelled), true)
  assert.equal(hasUpdatesAccess(cancelled, now), false)
  const pastDue = { plan: 'will', plan_status: 'active', updates_status: 'past_due', updates_active_until: future }
  assert.equal(hasWillAccess(pastDue), true)
})

test('updates access needs a good status AND a paid period that has not ended', () => {
  assert.equal(hasUpdatesAccess({ updates_status: 'active', updates_active_until: future }, now), true)
  assert.equal(hasUpdatesAccess({ updates_status: 'trialing', updates_active_until: future }, now), true)
  assert.equal(hasUpdatesAccess({ updates_status: 'past_due', updates_active_until: future }, now), true) // Stripe is retrying
  assert.equal(hasUpdatesAccess({ updates_status: 'active', updates_active_until: past }, now), false)
  assert.equal(hasUpdatesAccess({ updates_status: 'cancelled', updates_active_until: future }, now), false)
  assert.equal(hasUpdatesAccess({ updates_status: 'incomplete', updates_active_until: future }, now), false)
  assert.equal(hasUpdatesAccess({ updates_status: 'active', updates_active_until: null }, now), false)
  assert.equal(hasUpdatesAccess({ updates_status: 'active', updates_active_until: 'not-a-date' }, now), false)
  assert.equal(hasUpdatesAccess(undefined, now), false)
})

test('one signing session is included; cancelled sessions do not count', () => {
  assert.equal(hasUsedIncludedSigning([]), false)
  assert.equal(hasUsedIncludedSigning(['cancelled']), false)
  assert.equal(hasUsedIncludedSigning(['scheduled']), true)
  assert.equal(hasUsedIncludedSigning(['in_progress']), true)
  assert.equal(hasUsedIncludedSigning(['cancelled', 'completed']), true)
})

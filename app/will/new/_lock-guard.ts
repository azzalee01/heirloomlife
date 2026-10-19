import { createHash } from 'crypto'

/**
 * Pure lock-guard decision. No DB dependencies — callers supply the
 * already-fetched session rows and any query error.
 *
 * Invariants:
 * - Returns { scheduledIds } only when no in_progress session exists.
 * - Throws on any DB error (fail closed).
 * - Never changes session state.
 *
 * Exported for unit testing without loading Supabase.
 */
export function _evaluateLockGuard(
  sessions: { id: string; status: string }[] | null,
  error: { message?: string } | null
): { scheduledIds: string[] } {
  if (error) {
    throw new Error(
      'Cannot save: witnessing session status could not be verified. Please try again.'
    )
  }
  const list = sessions ?? []
  const inProgress = list.filter((s) => s.status === 'in_progress')
  if (inProgress.length > 0) {
    throw new Error(
      'A witnessing session is currently in progress. Your Will is locked until the session completes.'
    )
  }
  return {
    scheduledIds: list.filter((s) => s.status === 'scheduled').map((s) => s.id),
  }
}

/**
 * Pure document-integrity check. No DB dependencies.
 * Throws if the SHA-256 of lockedContent does not match expectedHash.
 *
 * Exported for unit testing without loading Supabase.
 */
export function verifyDocumentIntegrity(lockedContent: string, expectedHash: string): void {
  const actualHash = createHash('sha256').update(lockedContent, 'utf8').digest('hex')
  if (actualHash !== expectedHash) {
    throw new Error(
      'Will document integrity check failed: the locked document does not match the expected hash.'
    )
  }
}

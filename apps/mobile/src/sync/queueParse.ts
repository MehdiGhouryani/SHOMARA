import type { OfflineSyncAction } from '@math/offline-sync';

const VALID_STATUSES = new Set<string>(['PENDING', 'SYNCING', 'RETRY', 'ACKED', 'REJECTED']);

export function isSyncAction(value: unknown): value is OfflineSyncAction {
  if (!value || typeof value !== 'object') return false;
  const x = value as Record<string, unknown>;
  return typeof x.id === 'string' && x.id.length > 0
    && typeof x.createdAt === 'string'
    && typeof x.idempotencyKey === 'string'
    && typeof x.status === 'string' && VALID_STATUSES.has(x.status);
}

/** Returns the valid actions, or null when the text is not a JSON array (corrupt/truncated). Empty text is an empty queue. */
export function parseQueueText(text: string): OfflineSyncAction[] | null {
  if (text.trim() === '') return [];
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isSyncAction);
  } catch {
    return null;
  }
}

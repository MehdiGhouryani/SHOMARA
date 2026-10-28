import type { OfflineSyncAction, SyncQueueStore } from './types.js';

export class InMemorySyncQueueStore implements SyncQueueStore {
  private readonly actions = new Map<string, OfflineSyncAction>();

  async listReady(now: string): Promise<OfflineSyncAction[]> {
    const t = Date.parse(now);
    return [...this.actions.values()]
      .filter((x) => (x.status === 'PENDING' || x.status === 'RETRY' || x.status === 'SYNCING') && (!x.nextRetryAt || Date.parse(x.nextRetryAt) <= t))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async put(action: OfflineSyncAction): Promise<void> { this.actions.set(action.id, { ...action }); }
  async update(action: OfflineSyncAction): Promise<void> { this.actions.set(action.id, { ...action }); }
  async remove(id: string): Promise<void> { this.actions.delete(id); }

  snapshot(): OfflineSyncAction[] { return [...this.actions.values()].map((x) => ({ ...x })); }
}

import { syncBackoffMs } from './backoff.js';
import type { OfflineSyncAction, SyncQueueStore, SyncReceipt, SyncTransport } from './types.js';

export class OfflineSyncManager {
  private online = true;
  private flushing = false;

  constructor(
    private readonly store: SyncQueueStore,
    private readonly transport: SyncTransport,
    /** Retryable failures (network, 5xx, 429, expired auth) are kept and retried until this age; only then dropped. */
    private readonly maxAgeMs = 14 * 24 * 60 * 60 * 1000,
  ) {}

  setOnline(online: boolean): void { this.online = online; }
  isOnline(): boolean { return this.online; }

  async enqueue<TPayload>(input: Omit<OfflineSyncAction<TPayload>, 'status' | 'attemptCount' | 'createdAt' | 'updatedAt'>): Promise<OfflineSyncAction<TPayload>> {
    const now = new Date().toISOString();
    const action: OfflineSyncAction<TPayload> = { ...input, status: 'PENDING', attemptCount: 0, createdAt: now, updatedAt: now };
    await this.store.put(action);
    return action;
  }

  async flush(): Promise<{ processed: number; acked: number; retried: number; rejected: number }> {
    if (!this.online || this.flushing) return { processed: 0, acked: 0, retried: 0, rejected: 0 };
    this.flushing = true;
    try {
      const actions = await this.store.listReady(new Date().toISOString());
      const summary = { processed: 0, acked: 0, retried: 0, rejected: 0 };
      for (const action of actions) {
        if (!this.online) break;
        summary.processed += 1;
        const result = await this.processOne(action);
        if (result === 'ACKED') summary.acked += 1;
        if (result === 'RETRY') summary.retried += 1;
        if (result === 'REJECTED') summary.rejected += 1;
      }
      return summary;
    } finally {
      this.flushing = false;
    }
  }

  private async processOne(action: OfflineSyncAction): Promise<'ACKED' | 'RETRY' | 'REJECTED'> {
    const now = new Date().toISOString();
    const syncing = { ...action, status: 'SYNCING' as const, attemptCount: action.attemptCount + 1, updatedAt: now, lastAttemptAt: now };
    await this.store.update(syncing);

    try {
      const receipt: SyncReceipt = await this.transport.send(syncing);
      if (receipt.status === 'ACKED' || receipt.status === 'DUPLICATE') {
        await this.store.remove(action.id);
        return 'ACKED';
      }
      if (receipt.status === 'RETRY' && !this.isExpired(syncing)) {
        const delay = receipt.retryAfterMs ?? syncBackoffMs(syncing.attemptCount - 1);
        const retryAction = { ...syncing, status: 'RETRY' as const, nextRetryAt: new Date(Date.now() + delay).toISOString(), updatedAt: new Date().toISOString() };
        if (receipt.errorCode !== undefined) retryAction.lastErrorCode = receipt.errorCode;
        await this.store.update(retryAction);
        return 'RETRY';
      }
      const rejectedCode = receipt.status === 'RETRY' ? 'SYNC_EXPIRED' : (receipt.errorCode ?? 'SYNC_REJECTED');
      await this.store.update({ ...syncing, status: 'REJECTED', lastErrorCode: rejectedCode, updatedAt: new Date().toISOString() });
      return 'REJECTED';
    } catch (error) {
      const code = error instanceof Error ? error.message : 'NETWORK_ERROR';
      if (!this.online) {
        const retryAction = { ...syncing, status: 'RETRY' as const, nextRetryAt: new Date(Date.now() + syncBackoffMs(syncing.attemptCount - 1)).toISOString(), updatedAt: new Date().toISOString() };
        retryAction.lastErrorCode = code;
        await this.store.update(retryAction);
        return 'RETRY';
      }
      if (!this.isExpired(syncing)) {
        const retryAction = { ...syncing, status: 'RETRY' as const, nextRetryAt: new Date(Date.now() + syncBackoffMs(syncing.attemptCount - 1)).toISOString(), updatedAt: new Date().toISOString() };
        retryAction.lastErrorCode = code;
        await this.store.update(retryAction);
        return 'RETRY';
      }
      await this.store.update({ ...syncing, status: 'REJECTED', lastErrorCode: 'SYNC_EXPIRED', updatedAt: new Date().toISOString() });
      return 'REJECTED';
    }
  }

  private isExpired(action: OfflineSyncAction): boolean {
    const created = Date.parse(action.createdAt);
    return Number.isFinite(created) && Date.now() - created > this.maxAgeMs;
  }
}

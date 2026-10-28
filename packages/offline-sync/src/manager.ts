import { syncBackoffMs } from './backoff.js';
import type { OfflineSyncAction, SyncQueueStore, SyncReceipt, SyncTransport } from './types.js';

/**
 * Batch limits for transports that implement sendBatch (wave C). The server caps a sync batch at
 * 20 actions / 256 KB of JSON; the manager chunks with headroom so one flush never trips those
 * limits. Transports without sendBatch still get the exact per-action behaviour.
 */
const BATCH_MAX_ACTIONS = 20;
const BATCH_MAX_JSON_BYTES = 192 * 1024;

type Outcome = 'ACKED' | 'RETRY' | 'REJECTED';

/**
 * Upper bound of the action's UTF-8 size without depending on Buffer (not available in Hermes):
 * every UTF-16 code unit encodes to at most 3 UTF-8 bytes for realistic payloads (Persian = 2,
 * ASCII = 1, astral emoji = 2 units → 4 bytes = 2/unit), so length*3 never under-estimates and
 * only ever makes chunks slightly smaller than the server allows.
 */
function actionJsonBytes(action: OfflineSyncAction): number {
  return JSON.stringify(action).length * 3;
}

function chunkForBatch(actions: OfflineSyncAction[]): OfflineSyncAction[][] {
  const chunks: OfflineSyncAction[][] = [];
  let current: OfflineSyncAction[] = [];
  let bytes = 0;
  for (const action of actions) {
    const size = actionJsonBytes(action);
    if (current.length > 0 && (current.length >= BATCH_MAX_ACTIONS || bytes + size > BATCH_MAX_JSON_BYTES)) {
      chunks.push(current);
      current = [];
      bytes = 0;
    }
    current.push(action);
    bytes += size;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

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
      const batchSend = this.transport.sendBatch?.bind(this.transport);
      const chunks = batchSend ? chunkForBatch(actions) : actions.map((action) => [action]);
      for (const chunk of chunks) {
        if (!this.online) break;
        if (chunk.length === 1 || !batchSend) {
          for (const action of chunk) {
            if (!this.online) break;
            summary.processed += 1;
            const result = await this.processOne(action);
            if (result === 'ACKED') summary.acked += 1;
            if (result === 'RETRY') summary.retried += 1;
            if (result === 'REJECTED') summary.rejected += 1;
          }
          continue;
        }
        summary.processed += chunk.length;
        const outcomes = await this.processBatch(chunk);
        for (const outcome of outcomes) {
          if (outcome === 'ACKED') summary.acked += 1;
          if (outcome === 'RETRY') summary.retried += 1;
          if (outcome === 'REJECTED') summary.rejected += 1;
        }
      }
      return summary;
    } finally {
      this.flushing = false;
    }
  }

  private async processOne(action: OfflineSyncAction): Promise<Outcome> {
    const syncing = await this.markSyncing(action);
    try {
      const receipt: SyncReceipt = await this.transport.send(syncing);
      return await this.applyReceipt(syncing, receipt);
    } catch (error) {
      return await this.handleSendFailure(syncing, error);
    }
  }

  private async processBatch(chunk: OfflineSyncAction[]): Promise<Outcome[]> {
    const syncing = await Promise.all(chunk.map((action) => this.markSyncing(action)));
    try {
      const receipts = await (this.transport.sendBatch as NonNullable<SyncTransport['sendBatch']>)(syncing);
      const outcomes: Outcome[] = [];
      for (let i = 0; i < syncing.length; i += 1) {
        // Receipts are position-aligned; a missing receipt (short server response) stays retryable.
        const receipt = receipts[i] ?? { status: 'RETRY' as const, idempotencyKey: syncing[i]!.idempotencyKey, errorCode: 'SYNC_RESPONSE_INVALID' };
        outcomes.push(await this.applyReceipt(syncing[i]!, receipt));
      }
      return outcomes;
    } catch (error) {
      return Promise.all(syncing.map((action) => this.handleSendFailure(action, error)));
    }
  }

  private async markSyncing(action: OfflineSyncAction): Promise<OfflineSyncAction> {
    const now = new Date().toISOString();
    const syncing = { ...action, status: 'SYNCING' as const, attemptCount: action.attemptCount + 1, updatedAt: now, lastAttemptAt: now };
    await this.store.update(syncing);
    return syncing;
  }

  private async applyReceipt(syncing: OfflineSyncAction, receipt: SyncReceipt): Promise<Outcome> {
    if (receipt.status === 'ACKED' || receipt.status === 'DUPLICATE') {
      await this.store.remove(syncing.id);
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
  }

  private async handleSendFailure(syncing: OfflineSyncAction, error: unknown): Promise<Outcome> {
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

  private isExpired(action: OfflineSyncAction): boolean {
    const created = Date.parse(action.createdAt);
    return Number.isFinite(created) && Date.now() - created > this.maxAgeMs;
  }
}

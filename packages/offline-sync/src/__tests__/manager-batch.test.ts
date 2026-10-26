import { describe, expect, it, vi } from 'vitest';
import { OfflineSyncManager } from '../manager';
import { InMemorySyncQueueStore } from '../store';
import type { OfflineSyncAction, SyncReceipt, SyncTransport } from '../types';

function makeAction(i: number, payload: Record<string, unknown> = { n: i }): OfflineSyncAction {
  const now = new Date().toISOString();
  return {
    id: `a${i}`,
    clientInstallationId: 'i1',
    learningIdentityId: 'child-1',
    operationType: 'SUBMIT_ATTEMPT',
    idempotencyKey: `k${i}`,
    payload,
    status: 'PENDING',
    attemptCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function okReceipt(action: OfflineSyncAction): SyncReceipt {
  return { status: 'ACKED', idempotencyKey: action.idempotencyKey };
}

describe('OfflineSyncManager batched flush (wave C)', () => {
  it('one sendBatch round-trip carries several ready actions; per-action send() is not used', async () => {
    const sendBatch = vi.fn(async (actions: OfflineSyncAction[]) => actions.map(okReceipt));
    const send = vi.fn(async (action: OfflineSyncAction) => okReceipt(action));
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { send, sendBatch } as SyncTransport);
    for (let i = 0; i < 5; i += 1) await manager.enqueue(makeAction(i));

    const summary = await manager.flush();

    expect(summary).toEqual({ processed: 5, acked: 5, retried: 0, rejected: 0 });
    expect(sendBatch).toHaveBeenCalledTimes(1);
    expect(sendBatch.mock.calls[0]?.[0]).toHaveLength(5);
    expect(send).not.toHaveBeenCalled();
    expect(await store.snapshot()).toHaveLength(0);
  });

  it('receipts are applied per action: ACKED removed, RETRY kept with backoff, REJECTED kept', async () => {
    const actions = [makeAction(0), makeAction(1), makeAction(2)];
    const sendBatch = vi.fn(async (batch: OfflineSyncAction[]): Promise<SyncReceipt[]> => [
      { status: 'ACKED', idempotencyKey: batch[0]!.idempotencyKey },
      { status: 'RETRY', idempotencyKey: batch[1]!.idempotencyKey, errorCode: 'HTTP_503' },
      { status: 'REJECTED', idempotencyKey: batch[2]!.idempotencyKey, errorCode: 'SYNC_OPERATION_NOT_IMPLEMENTED' },
    ]);
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { send: async () => { throw new Error('must not be called'); }, sendBatch });
    for (const action of actions) await manager.enqueue(action);

    const summary = await manager.flush();

    expect(summary).toEqual({ processed: 3, acked: 1, retried: 1, rejected: 1 });
    const snapshot = await store.snapshot();
    expect(snapshot).toHaveLength(2);
    expect(snapshot.find((a) => a.id === 'a1')).toMatchObject({ status: 'RETRY', lastErrorCode: 'HTTP_503' });
    expect(snapshot.find((a) => a.id === 'a2')).toMatchObject({ status: 'REJECTED', lastErrorCode: 'SYNC_OPERATION_NOT_IMPLEMENTED' });
  });

  it('chunks at 20 actions so one flush never exceeds the server batch cap', async () => {
    const sizes: number[] = [];
    const sendBatch = vi.fn(async (batch: OfflineSyncAction[]) => {
      sizes.push(batch.length);
      return batch.map(okReceipt);
    });
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { send: async () => okReceipt(makeAction(0)), sendBatch });
    for (let i = 0; i < 25; i += 1) await manager.enqueue(makeAction(i));

    const summary = await manager.flush();

    expect(summary.acked).toBe(25);
    expect(sizes).toEqual([20, 5]);
  });

  it('a failed sendBatch retries every action in the chunk, like the per-action path', async () => {
    const sendBatch = vi.fn(async () => { throw new Error('NETWORK_UNAVAILABLE'); });
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { send: async () => okReceipt(makeAction(0)), sendBatch });
    for (let i = 0; i < 3; i += 1) await manager.enqueue(makeAction(i));

    const summary = await manager.flush();

    expect(summary.retried).toBe(3);
    const snapshot = await store.snapshot();
    expect(snapshot.every((a) => a.status === 'RETRY')).toBe(true);
  });

  it('a short server response leaves the missing actions retryable', async () => {
    const sendBatch = vi.fn(async (batch: OfflineSyncAction[]) => batch.slice(0, 1).map(okReceipt));
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { send: async () => okReceipt(makeAction(0)), sendBatch });
    for (let i = 0; i < 2; i += 1) await manager.enqueue(makeAction(i));

    const summary = await manager.flush();

    expect(summary.acked).toBe(1);
    expect(summary.retried).toBe(1);
  });

  it('transports without sendBatch keep the exact per-action behaviour', async () => {
    const send = vi.fn(async (action: OfflineSyncAction) => okReceipt(action));
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { send } as SyncTransport);
    for (let i = 0; i < 4; i += 1) await manager.enqueue(makeAction(i));

    const summary = await manager.flush();

    expect(summary.acked).toBe(4);
    expect(send).toHaveBeenCalledTimes(4);
  });
});

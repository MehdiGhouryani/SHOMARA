import { describe, expect, it } from 'vitest';
import { OfflineSyncManager } from '../manager';
import { InMemorySyncQueueStore } from '../store';

const action = {
  id: 'a1',
  clientInstallationId: 'install-1',
  learningIdentityId: 'child-1',
  operationType: 'SUBMIT_ATTEMPT' as const,
  idempotencyKey: 'k1',
  payload: { answer: 1 },
};

describe('OfflineSyncManager', () => {
  it('persists a queued action and flushes it exactly once', async () => {
    const store = new InMemorySyncQueueStore();
    let sends = 0;
    const manager = new OfflineSyncManager(store, {
      async send(input) {
        sends += 1;
        return { status: 'ACKED' as const, idempotencyKey: input.idempotencyKey };
      },
    });

    await manager.enqueue(action);
    expect((await store.snapshot()).length).toBe(1);
    expect((await manager.flush()).acked).toBe(1);
    expect(sends).toBe(1);
    expect((await store.snapshot()).length).toBe(0);
    expect((await manager.flush()).processed).toBe(0);
  });

  it('flushes a retry when the app returns online', async () => {
    const store = new InMemorySyncQueueStore();
    let sends = 0;
    const manager = new OfflineSyncManager(store, {
      async send(input) {
        sends += 1;
        return sends === 1
          ? { status: 'RETRY' as const, idempotencyKey: input.idempotencyKey, retryAfterMs: 0 }
          : { status: 'ACKED' as const, idempotencyKey: input.idempotencyKey };
      },
    });

    await manager.enqueue(action);
    expect((await manager.flush()).retried).toBe(1);
    expect((await manager.flush()).acked).toBe(1);
    expect(sends).toBe(2);
  });
});

describe('OfflineSyncManager durability', () => {
  it('keeps retrying transient failures far beyond 8 attempts (no silent loss)', async () => {
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { async send() { throw new Error('Network request failed'); } });
    await manager.enqueue(action);
    for (let i = 0; i < 30; i += 1) {
      const snap = await store.snapshot();
      if (snap[0]) await store.update({ ...snap[0], nextRetryAt: new Date(0).toISOString() });
      await manager.flush();
    }
    const [item] = await store.snapshot();
    expect(item?.status).toBe('RETRY');
    expect(item?.attemptCount).toBeGreaterThanOrEqual(30);
  });

  it('keeps RETRY receipts (e.g. expired auth) and delivers after recovery', async () => {
    const store = new InMemorySyncQueueStore();
    let authed = false;
    const manager = new OfflineSyncManager(store, {
      async send(input) {
        return authed
          ? { status: 'ACKED' as const, idempotencyKey: input.idempotencyKey }
          : { status: 'RETRY' as const, idempotencyKey: input.idempotencyKey, errorCode: 'HTTP_401', retryAfterMs: 0 };
      },
    });
    await manager.enqueue(action);
    for (let i = 0; i < 10; i += 1) await manager.flush();
    expect((await store.snapshot())[0]?.status).toBe('RETRY');
    authed = true;
    expect((await manager.flush()).acked).toBe(1);
  });

  it('drops an action only after it exceeds the maximum age', async () => {
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, { async send() { throw new Error('boom'); } }, 1000);
    await manager.enqueue({ ...action, id: 'old', idempotencyKey: 'old' });
    const [item] = await store.snapshot();
    await store.update({ ...item!, createdAt: new Date(Date.now() - 5000).toISOString() });
    await manager.flush();
    expect((await store.snapshot())[0]).toMatchObject({ status: 'REJECTED', lastErrorCode: 'SYNC_EXPIRED' });
  });
});

import { InMemorySyncQueueStore, OfflineSyncManager } from '../packages/offline-sync/dist/index.js';

const store = new InMemorySyncQueueStore();
let transportCalls = 0;
const manager = new OfflineSyncManager(store, {
  async send(action) {
    transportCalls += 1;
    if (action.idempotencyKey === 'reject-me') return { status: 'REJECTED', idempotencyKey: action.idempotencyKey, errorCode: 'PERMANENT' };
    if (action.idempotencyKey === 'duplicate-me') return { status: 'DUPLICATE', idempotencyKey: action.idempotencyKey };
    return { status: 'ACKED', idempotencyKey: action.idempotencyKey };
  },
});

await manager.enqueue({ id:'a1', clientInstallationId:'i1', learningIdentityId:'c1', operationType:'SUBMIT_ATTEMPT', idempotencyKey:'ack-me', payload:{} });
await manager.enqueue({ id:'a2', clientInstallationId:'i1', learningIdentityId:'c1', operationType:'EVENT_INGEST', idempotencyKey:'duplicate-me', payload:{} });
await manager.enqueue({ id:'a3', clientInstallationId:'i1', learningIdentityId:'c1', operationType:'SESSION_UPDATE', idempotencyKey:'reject-me', payload:{} });
manager.setOnline(false);
const offlineSummary = await manager.flush();
if (offlineSummary.processed !== 0) throw new Error('Offline flush must not process actions');
manager.setOnline(true);
const onlineSummary = await manager.flush();
if (onlineSummary.acked !== 2 || onlineSummary.rejected !== 1) throw new Error(`Unexpected summary ${JSON.stringify(onlineSummary)}`);
if (store.snapshot().some((x) => x.status === 'PENDING' || x.status === 'SYNCING' || x.status === 'RETRY')) throw new Error('No unresolved sync action should remain in this scenario');
if (transportCalls !== 3) throw new Error(`Unexpected transport calls: ${transportCalls}`);
console.log('PHASE9_RUNTIME_VERIFICATION_PASS');

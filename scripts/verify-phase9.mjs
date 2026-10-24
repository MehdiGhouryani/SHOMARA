import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const required=[
 'packages/offline-sync/src/types.ts',
 'packages/offline-sync/src/manager.ts',
 'packages/offline-sync/src/store.ts',
 'packages/offline-sync/src/backoff.ts',
 'apps/mobile/src/sync/FileSyncQueueStore.ts',
 'apps/mobile/src/sync/MobileSyncManager.ts',
 'apps/mobile/src/performance/runtimeBudget.ts',
 'apps/web/app/api/v1/sync/batch/route.ts',
 'supabase/migrations/0027_offline_sync_receipts.sql',
 'docs/api/API_OFFLINE_SYNC_CONTRACT.md',
 'docs/history/SNAPSHOT_MANIFEST_PHASE_9.json'
];
for(const rel of required) if(!fs.existsSync(path.join(root,rel))) throw new Error(`Missing ${rel}`);
const manager=fs.readFileSync(path.join(root,'packages/offline-sync/src/manager.ts'),'utf8');
for(const marker of ['setOnline','enqueue','flush','processOne','status: \'RETRY\'','status: \'REJECTED\'']) if(!manager.includes(marker)) throw new Error(`Sync marker missing: ${marker}`);
const route=fs.readFileSync(path.join(root,'apps/web/app/api/v1/sync/batch/route.ts'),'utf8');
for(const marker of ['X-Client-Installation-Id','SUBMIT_ATTEMPT','SESSION_RESUME','EVENT_INGEST','DUPLICATE']) if(!route.includes(marker)) throw new Error(`Route marker missing: ${marker}`);
const migration=fs.readFileSync(path.join(root,'supabase/migrations/0027_offline_sync_receipts.sql'),'utf8');
for(const marker of ['sync_operation_receipts','idempotency_key','client_installation_id','revoke']) if(!migration.includes(marker)) throw new Error(`Migration marker missing: ${marker}`);
const content=fs.readFileSync(path.join(root,'apps/mobile/src/content/ContentManager.ts'),'utf8');
for(const marker of ['evictToBudget','CACHE_BUDGET_EXCEEDED_BY_PROTECTED_CURRENT','removePackage','lastAccessedAt']) if(!content.includes(marker)) throw new Error(`Cache marker missing: ${marker}`);
const perf=fs.readFileSync(path.join(root,'apps/mobile/src/performance/runtimeBudget.ts'),'utf8');
for(const marker of ['FRAME_BUDGET_MS','DEFAULT_CONTENT_CACHE_BUDGET_BYTES','percentile']) if(!perf.includes(marker)) throw new Error(`Performance marker missing: ${marker}`);
console.log('PHASE9_STATIC_VERIFICATION_PASS');

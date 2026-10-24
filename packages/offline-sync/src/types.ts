export type SyncOperationType =
  | 'SUBMIT_ATTEMPT'
  | 'SESSION_RESUME'
  | 'SESSION_UPDATE'
  | 'EVENT_INGEST';

export type SyncActionStatus = 'PENDING' | 'SYNCING' | 'RETRY' | 'ACKED' | 'REJECTED';

export type SyncResultStatus = 'ACKED' | 'DUPLICATE' | 'RETRY' | 'REJECTED';

export interface OfflineSyncAction<TPayload = unknown> {
  id: string;
  clientInstallationId: string;
  learningIdentityId: string;
  operationType: SyncOperationType;
  idempotencyKey: string;
  payload: TPayload;
  status: SyncActionStatus;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  lastErrorCode?: string;
}

export interface SyncReceipt<TResponse = unknown> {
  status: SyncResultStatus;
  idempotencyKey: string;
  response?: TResponse;
  errorCode?: string;
  retryAfterMs?: number;
}

export interface SyncQueueStore {
  listReady(now: string): Promise<OfflineSyncAction[]>;
  put(action: OfflineSyncAction): Promise<void>;
  update(action: OfflineSyncAction): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface SyncTransport {
  send(action: OfflineSyncAction): Promise<SyncReceipt>;
}

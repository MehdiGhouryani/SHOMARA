import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import type { OfflineSyncAction, SyncReceipt, SyncTransport } from '@math/offline-sync';
import { FileSyncQueueStore } from './FileSyncQueueStore';
import { OfflineSyncManager } from '@math/offline-sync';
import { getAuthHeaders } from '../auth/AuthSession';
import { notifyAuthExpired } from '../auth/authExpiry';

export class MobileSyncTransport implements SyncTransport {
  constructor(private readonly baseUrl: string, private readonly installationId: string, private readonly devLearningIdentityId: string | undefined) {}

  private headers(): Record<string, string> {
    return { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Client-Installation-Id': this.installationId, ...getAuthHeaders(), ...(__DEV__ && !getAuthHeaders().Authorization && this.devLearningIdentityId ? { 'x-dev-learning-identity-id': this.devLearningIdentityId } : {}) };
  }

  private async receiptFor(response: Response, action: OfflineSyncAction): Promise<SyncReceipt> {
    // 401/403 usually mean an expired/missing session: keep the learner's attempt and retry after re-login.
    // 408/425/429/5xx are transient. Only other 4xx (malformed / not allowed) are permanent rejections.
    // A 401 while holding a token goes through the central auth-expiry path (R-009/D3): the token
    // is cleared and "needs re-login" is published; the queued attempt itself stays (RETRY).
    // Awaited (not fire-and-forget): a rejection here must reach the manager's catch (RETRY),
    // never escape as an unhandled rejection.
    if (response.status === 401 && Boolean(getAuthHeaders().Authorization)) {
      await notifyAuthExpired();
    }
    const transient = response.status >= 500 || response.status === 429 || response.status === 408 || response.status === 425 || response.status === 401 || response.status === 403;
    if (transient) return { status: 'RETRY', idempotencyKey: action.idempotencyKey, errorCode: `HTTP_${response.status}` };
    return { status: 'REJECTED', idempotencyKey: action.idempotencyKey, errorCode: `HTTP_${response.status}` };
  }

  async send(action: OfflineSyncAction): Promise<SyncReceipt> {
    const response = await fetch(`${this.baseUrl}/api/v1/sync/batch`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ actions: [action] }),
    });
    if (!response.ok) return await this.receiptFor(response, action);
    const body = await response.json() as { results?: SyncReceipt[] };
    return body.results?.[0] ?? { status: 'RETRY', idempotencyKey: action.idempotencyKey, errorCode: 'SYNC_RESPONSE_INVALID' };
  }

  /**
   * One round-trip for up to 20 queued actions (server contract: results are position-aligned
   * with the sent actions). A batch-level failure maps the same transient/permanent rule onto
   * every action, identical to sending them one by one.
   */
  async sendBatch(actions: OfflineSyncAction[]): Promise<SyncReceipt[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/sync/batch`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ actions }),
    });
    if (!response.ok) return Promise.all(actions.map((action) => this.receiptFor(response, action)));
    const body = await response.json() as { results?: SyncReceipt[] };
    const results = body.results;
    if (!Array.isArray(results)) {
      return actions.map((action) => ({ status: 'RETRY' as const, idempotencyKey: action.idempotencyKey, errorCode: 'SYNC_RESPONSE_INVALID' }));
    }
    return actions.map((action, index) => results[index] ?? { status: 'RETRY' as const, idempotencyKey: action.idempotencyKey, errorCode: 'SYNC_RESPONSE_INVALID' });
  }
}

export function createMobileSyncManager(baseUrl: string, installationId: string, devLearningIdentityId?: string): OfflineSyncManager {
  return new OfflineSyncManager(new FileSyncQueueStore(), new MobileSyncTransport(baseUrl, installationId, devLearningIdentityId));
}

export async function stableActionKey(operationType: string, scope: string, payload: unknown): Promise<string> {
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, `${operationType}:${scope}:${JSON.stringify(payload)}`);
}

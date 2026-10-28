import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import type { OfflineSyncAction, SyncReceipt } from '@math/offline-sync';
import { assertBodyIdentityMatches, requireRequestPrincipal } from '@/lib/request-principal';
import { runtimeStore } from '@/lib/learning-runtime';
import { productionLearningRuntime } from '@/lib/learning-runtime-production';
import { supabaseRestSelect } from '@/lib/supabase-http';
import { recordAssignmentStationPass } from '@/lib/assignment-station-pass';

// Server-enforced batch/field limits (wave B3). TypeScript assertions are not runtime validation,
// so every action is shape-checked before it can reach the runtime or the RPC boundary.
const SYNC_BATCH_BODY_LIMIT_BYTES = 256 * 1024;
const SYNC_ACTION_PAYLOAD_LIMIT_BYTES = 32 * 1024;
const SYNC_MAX_ANSWERS = 20;
const SYNC_MAX_ATTEMPT_NUMBER = 50;
const SYNC_FIELD_LIMIT = 128;
const SYNC_OPERATION_TYPES = new Set(['SUBMIT_ATTEMPT', 'SESSION_RESUME', 'SESSION_UPDATE', 'EVENT_INGEST']);

function isBoundedString(value: unknown, max = SYNC_FIELD_LIMIT): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function isValidSubmitPayload(payload: unknown): payload is Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const p = payload as Record<string, unknown>;
  if (!isBoundedString(p.sessionId) || !isBoundedString(p.encounterId) || !isBoundedString(p.clientIdempotencyKey)) return false;
  if (typeof p.attemptNumber !== 'number' || !Number.isInteger(p.attemptNumber) || p.attemptNumber < 1 || p.attemptNumber > SYNC_MAX_ATTEMPT_NUMBER) return false;
  if (!Array.isArray(p.answers) || p.answers.length === 0 || p.answers.length > SYNC_MAX_ANSWERS) return false;
  for (const answer of p.answers) {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
    const a = answer as Record<string, unknown>;
    if (typeof a.answerIndex !== 'number' || !Number.isInteger(a.answerIndex) || a.answerIndex < 0) return false;
    if (a.answerPayload !== undefined && a.answerPayload !== null && typeof a.answerPayload === 'object' && Object.keys(a.answerPayload).length > 32) return false;
  }
  return true;
}

/** Malformed or oversized actions are rejected permanently, without failing the whole batch. */
function isSyncActionShapeValid(action: OfflineSyncAction): boolean {
  if (!isBoundedString(action.id, 256) || !isBoundedString(action.idempotencyKey, 256)) return false;
  if (!isBoundedString(action.clientInstallationId) || !isBoundedString(action.learningIdentityId)) return false;
  if (typeof action.operationType !== 'string' || !SYNC_OPERATION_TYPES.has(action.operationType)) return false;
  if (!action.payload || typeof action.payload !== 'object' || Array.isArray(action.payload)) return false;
  if (JSON.stringify(action.payload ?? {}).length > SYNC_ACTION_PAYLOAD_LIMIT_BYTES) return false;
  if (action.operationType === 'SUBMIT_ATTEMPT') return isValidSubmitPayload(action.payload);
  return true;
}

function invalidReceipt(action: OfflineSyncAction | null | undefined): SyncReceipt {
  const key = action && typeof action === 'object' && isBoundedString(action.idempotencyKey, 256) ? action.idempotencyKey : 'UNKNOWN';
  return { status: 'REJECTED', idempotencyKey: key, errorCode: 'SYNC_ACTION_INVALID' };
}

export async function POST(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    const installationId = request.headers.get('X-Client-Installation-Id')?.trim();
    if (!installationId) return NextResponse.json({ code: 'CLIENT_INSTALLATION_REQUIRED' }, { status: 400 });
    if (principal.accessToken) {
      const installations = await supabaseRestSelect<{ id: string; status: string }>(principal.accessToken, 'client_installations', {
        id: `eq.${installationId}`,
        account_id: `eq.${principal.authUserId}`,
        status: 'eq.ACTIVE',
        select: 'id,status',
        limit: '1',
      });
      if (installations.length !== 1) throw new Error('CLIENT_INSTALLATION_FORBIDDEN');
    }
    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > SYNC_BATCH_BODY_LIMIT_BYTES) {
      return NextResponse.json({ code: 'SYNC_BATCH_TOO_LARGE' }, { status: 413 });
    }
    let parsed: { actions?: OfflineSyncAction[] };
    try {
      parsed = JSON.parse(raw) as { actions?: OfflineSyncAction[] };
    } catch {
      return NextResponse.json({ code: 'SYNC_PAYLOAD_INVALID' }, { status: 400 });
    }
    const actions = parsed.actions ?? [];
    if (actions.length > 20) return NextResponse.json({ code: 'SYNC_BATCH_TOO_LARGE' }, { status: 413 });
    const results: SyncReceipt[] = [];
    for (const action of actions) {
      if (!action || typeof action !== 'object' || !isSyncActionShapeValid(action)) {
        results.push(invalidReceipt(action));
        continue;
      }
      try {
        assertBodyIdentityMatches(principal, action.learningIdentityId);
        if (action.clientInstallationId !== installationId) throw new Error('CLIENT_INSTALLATION_CONTEXT_MISMATCH');
        const receipt = await dispatch(action, principal.accessToken, principal.learningIdentityId);
        results.push(receipt);
      } catch (error) {
        const message = publicErrorMessage(error);
        const retryable = message.includes('NETWORK') || message.includes('SUPABASE_RPC_5') || message.includes('SUPABASE_REST_5') || message.includes('HTTP_429');
        results.push({ status: retryable ? 'RETRY' : 'REJECTED', idempotencyKey: action.idempotencyKey, errorCode: message });
      }
    }
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ code: 'SYNC_BATCH_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

async function dispatch(action: OfflineSyncAction, accessToken: string | undefined, learningIdentityId: string): Promise<SyncReceipt> {
  if (action.operationType === 'SUBMIT_ATTEMPT') {
    const payload = action.payload as {
      learningIdentityId: string;
      relationshipContextId: string;
      sessionId: string;
      encounterId: string;
      attemptNumber: number;
      clientIdempotencyKey: string;
      answers: Array<{ answerIndex: number; answerPayload: unknown }>;
    };
    const result = accessToken
      ? await productionLearningRuntime(accessToken).submitAttempt({
          relationshipContextId: payload.relationshipContextId,
          sessionId: payload.sessionId,
          encounterId: payload.encounterId,
          attemptNumber: payload.attemptNumber,
          clientIdempotencyKey: payload.clientIdempotencyKey,
          answers: payload.answers,
        })
      : await runtimeStore.engine.submitAttempt({ ...payload, learningIdentityId });
    if (result.stationPass && !result.idempotent) await recordAssignmentStationPass(learningIdentityId, payload.encounterId);
    return { status: result.idempotent ? 'DUPLICATE' : 'ACKED', idempotencyKey: action.idempotencyKey, response: { decision: result.decision.selectedStep, stationPass: result.stationPass } };
  }

  // SESSION_RESUME / SESSION_UPDATE / EVENT_INGEST have no server implementation yet and no client enqueues them.
  // They must fail closed: acknowledging them would silently discard data while claiming success.
  // Unsupported or unimplemented operations fail closed
  return { status: 'REJECTED', idempotencyKey: action.idempotencyKey, errorCode: 'SYNC_OPERATION_NOT_IMPLEMENTED' };
}

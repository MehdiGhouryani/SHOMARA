import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import type { OfflineSyncAction, SyncReceipt } from '@math/offline-sync';
import { assertBodyIdentityMatches, requireRequestPrincipal } from '@/lib/request-principal';
import { runtimeStore } from '@/lib/learning-runtime';
import { productionLearningRuntime } from '@/lib/learning-runtime-production';
import { supabaseRestSelect } from '@/lib/supabase-http';
import { recordAssignmentStationPass } from '@/lib/assignment-station-pass';

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
    const body = await request.json() as { actions?: OfflineSyncAction[] };
    const actions = body.actions ?? [];
    if (actions.length > 20) return NextResponse.json({ code: 'SYNC_BATCH_TOO_LARGE' }, { status: 413 });
    const results: SyncReceipt[] = [];
    for (const action of actions) {
      try {
        assertBodyIdentityMatches(principal, action.learningIdentityId);
        if (action.clientInstallationId !== installationId) throw new Error('CLIENT_INSTALLATION_CONTEXT_MISMATCH');
        const receipt = await dispatch(action, principal.accessToken, principal.learningIdentityId);
        results.push(receipt);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'SYNC_DISPATCH_FAILED';
        const retryable = message.includes('NETWORK') || message.includes('SUPABASE_RPC_5') || message.includes('SUPABASE_REST_5') || message.includes('HTTP_429');
        results.push({ status: retryable ? 'RETRY' : 'REJECTED', idempotencyKey: action.idempotencyKey, errorCode: message });
      }
    }
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ code: 'SYNC_BATCH_FAILED', message: error instanceof Error ? error.message : 'SYNC_BATCH_FAILED' }, { status: apiErrorStatus(error) });
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

import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { assertBodyIdentityMatches, requireRequestPrincipal } from '@/lib/request-principal';
import { runtimeStore } from '@/lib/learning-runtime';
import { productionLearningRuntime } from '@/lib/learning-runtime-production';
import { recordAssignmentStationPass } from '@/lib/assignment-station-pass';

export async function POST(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const body = await request.json() as {
      learningIdentityId?: string;
      relationshipContextId?: string;
      sessionId?: string;
      encounterId?: string;
      attemptNumber?: number;
      clientIdempotencyKey?: string;
      answers?: Array<{ answerIndex: number; answerPayload: unknown }>;
    };
    const principal = await requireRequestPrincipal(request);
    const learningIdentityId = assertBodyIdentityMatches(principal, body.learningIdentityId);
    if (!body.sessionId || !body.encounterId || !body.clientIdempotencyKey || !body.answers) throw new Error('ATTEMPT_FIELDS_REQUIRED');
    const result = principal.accessToken
      ? await productionLearningRuntime(principal.accessToken).submitAttempt({
          relationshipContextId: body.relationshipContextId,
          sessionId: body.sessionId,
          encounterId: body.encounterId,
          attemptNumber: body.attemptNumber ?? 1,
          clientIdempotencyKey: body.clientIdempotencyKey,
          answers: body.answers,
        })
      : await runtimeStore.engine.submitAttempt({
          learningIdentityId,
          relationshipContextId: body.relationshipContextId ?? 'platform',
          sessionId: body.sessionId,
          encounterId: body.encounterId,
          attemptNumber: body.attemptNumber ?? 1,
          clientIdempotencyKey: body.clientIdempotencyKey,
          answers: body.answers,
        });
    if (result.stationPass) await recordAssignmentStationPass(learningIdentityId, body.encounterId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 'ATTEMPT_SUBMIT_FAILED', message }, { status: apiErrorStatus(error) });
  }
}

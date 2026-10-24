import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { productionChallengeRuntime } from '@/lib/challenge-runtime-production';

export async function POST(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('CHALLENGE_BACKEND_REQUIRES_AUTH');
    const body = await request.json() as { sessionId?: string; challengeDefinitionId?: string; clientIdempotencyKey?: string };
    if (!body.sessionId || !body.challengeDefinitionId || !body.clientIdempotencyKey) throw new Error('CHALLENGE_START_FIELDS_REQUIRED');
    const run = await productionChallengeRuntime(principal.accessToken).start({
      sessionId: body.sessionId,
      challengeDefinitionId: body.challengeDefinitionId,
      idempotencyKey: body.clientIdempotencyKey,
    });
    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    return NextResponse.json({ code: 'CHALLENGE_START_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

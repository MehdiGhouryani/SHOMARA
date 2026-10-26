import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { productionChallengeRuntime } from '@/lib/challenge-runtime-production';

export async function POST(request: Request, context: { params: Promise<{ runId: string }> }) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('CHALLENGE_BACKEND_REQUIRES_AUTH');
    const { runId } = await context.params;
    const body = await request.json() as { roundIndex?: number; hintIndex?: number; clientIdempotencyKey?: string };
    if (body.roundIndex === undefined || body.hintIndex === undefined || !body.clientIdempotencyKey) throw new Error('CHALLENGE_HINT_FIELDS_REQUIRED');
    return NextResponse.json(await productionChallengeRuntime(principal.accessToken).hint({
      runId,
      roundIndex: body.roundIndex,
      hintIndex: body.hintIndex,
      idempotencyKey: body.clientIdempotencyKey,
    }));
  } catch (error) {
    return NextResponse.json({ code: 'CHALLENGE_HINT_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

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
    const body = await request.json() as { roundIndex?: number; attemptNumber?: number; clientIdempotencyKey?: string; answers?: unknown[] };
    if (body.roundIndex === undefined || body.attemptNumber === undefined || !body.clientIdempotencyKey || !body.answers?.length) {
      throw new Error('CHALLENGE_ROUND_FIELDS_REQUIRED');
    }
    return NextResponse.json(await productionChallengeRuntime(principal.accessToken).submit({
      runId,
      roundIndex: body.roundIndex,
      attemptNumber: body.attemptNumber,
      idempotencyKey: body.clientIdempotencyKey,
      answers: body.answers,
    }));
  } catch (error) {
    return NextResponse.json({ code: 'CHALLENGE_ROUND_SUBMIT_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

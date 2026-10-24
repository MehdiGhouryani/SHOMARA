import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { productionChallengeRuntime } from '@/lib/challenge-runtime-production';

export async function GET(request: Request, context: { params: Promise<{ stationCode: string }> }) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('CHALLENGE_BACKEND_REQUIRES_AUTH');
    const { stationCode } = await context.params;
    return NextResponse.json(await productionChallengeRuntime(principal.accessToken).station(stationCode));
  } catch (error) {
    return NextResponse.json({ code: 'CHALLENGE_READ_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

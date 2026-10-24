import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';

/** GET worlds projection (derives completion from station passes; may record world completion grants). */
export async function GET(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('WORLDS_BACKEND_REQUIRES_AUTH');
    const projection = await supabaseRpc(principal.accessToken, 'worlds_projection', {});
    return NextResponse.json(projection);
  } catch (error) {
    return NextResponse.json(
      { code: 'WORLDS_PROJECTION_FAILED', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: apiErrorStatus(error) },
    );
  }
}

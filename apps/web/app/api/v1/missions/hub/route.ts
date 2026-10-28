import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';

export async function GET(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('MISSION_BACKEND_REQUIRES_AUTH');
    const zone = new URL(request.url).searchParams.get('timeZone') ?? 'Asia/Tehran';
    const projection = await supabaseRpc(principal.accessToken, 'mission_sync', { p_time_zone: zone });
    return NextResponse.json(projection);
  } catch (error) {
    return NextResponse.json({ code: 'MISSION_HUB_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

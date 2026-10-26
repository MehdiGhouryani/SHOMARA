import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';

/** GET → collection_sync (derive unlocks + inventory, return projection). */
export async function GET(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('COLLECTION_BACKEND_REQUIRES_AUTH');
    const projection = await supabaseRpc(principal.accessToken, 'collection_sync', {});
    return NextResponse.json(projection);
  } catch (error) {
    return NextResponse.json(
      { code: 'COLLECTION_SYNC_FAILED', message: publicErrorMessage(error) },
      { status: apiErrorStatus(error) },
    );
  }
}

/** POST { grantId } → mark reward presented (analytics: presented ≠ granted). */
export async function POST(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    if (!principal.accessToken) throw new Error('COLLECTION_BACKEND_REQUIRES_AUTH');
    const body = (await request.json().catch(() => ({}))) as { grantId?: string };
    if (!body.grantId) {
      return NextResponse.json({ code: 'GRANT_ID_REQUIRED', message: 'grantId required' }, { status: 400 });
    }
    const projection = await supabaseRpc(principal.accessToken, 'collection_acknowledge_presentation', {
      p_grant_id: body.grantId,
    });
    return NextResponse.json(projection);
  } catch (error) {
    return NextResponse.json(
      { code: 'COLLECTION_ACK_FAILED', message: publicErrorMessage(error) },
      { status: apiErrorStatus(error) },
    );
  }
}

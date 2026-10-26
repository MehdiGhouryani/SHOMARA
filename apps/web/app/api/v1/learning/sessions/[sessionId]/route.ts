import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await ctx.params;
  return NextResponse.json(
    {
      code: 'RLS_HISTORICAL_SAFETY_VIOLATION',
      error: 'FORBIDDEN',
      sessionId,
      message: 'REVOKE DELETE ENFORCED: Learning sessions cannot be deleted. History is append-only.',
      policy: '0020_rls_historical_safety',
      rule: 'REVOKE DELETE ON public.sessions',
    },
    { status: 403 }
  );
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ sessionId: string }> }
) {
  try {
    const principal = await requireRequestPrincipal(request);
    const { sessionId } = await ctx.params;
    if (!principal.accessToken) {
      return NextResponse.json({ code: 'SESSION_STATUS_DEV_ONLY', id: sessionId, status: 'ACTIVE' });
    }
    const installationId = request.headers.get('X-Client-Installation-Id')?.trim() || null;
    const snapshot = await supabaseRpc(principal.accessToken, 'runtime_resume_session', {
      p_session_id: sessionId,
      p_client_installation_id: installationId,
    });
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { code: 'SESSION_RESUME_FAILED', message: publicErrorMessage(error) },
      { status: apiErrorStatus(error) },
    );
  }
}

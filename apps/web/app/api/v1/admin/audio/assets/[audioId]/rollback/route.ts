import { NextResponse } from 'next/server';
import { audioAdminRepository, AUDIO_PUBLISH_STAGES } from '@/lib/admin-audio';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import type { AudioPublishStage } from '@math/content-delivery';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/admin/audio/assets/[audioId]/rollback
 * Reversible publish (AUTHORING_CONTRACT_GAPS §3): admin-only rollback to a
 * PREVIOUS stage, always audited.
 */
export async function POST(request: Request, ctx: { params: Promise<{ audioId: string }> }) {
  try {
    const principal = await requireRequestAccountPrincipal(request, 'ADMIN');
    const { audioId } = await ctx.params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ code: 'PAYLOAD_REQUIRED', message: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
    }
    const raw = body as Record<string, unknown>;
    const targetStage = typeof raw.targetStage === 'string' ? raw.targetStage : '';
    if (!(AUDIO_PUBLISH_STAGES as readonly string[]).includes(targetStage)) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: `targetStage باید یکی از ${AUDIO_PUBLISH_STAGES.join('، ')} باشد.` }, { status: 400 });
    }
    const reason = typeof raw.reason === 'string' && raw.reason.trim().length > 0 ? raw.reason.trim() : 'admin rollback from panel';
    const holder = audioAdminRepository.rollback(audioId, targetStage as AudioPublishStage, { accountId: principal.accountId, role: 'PUBLISHER_ADMIN' }, reason);
    return NextResponse.json({ success: true, asset: holder.asset, auditTrail: holder.auditTrail });
  } catch (error) {
    return NextResponse.json({ code: 'AUDIO_ROLLBACK_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

import { NextResponse } from 'next/server';
import { audioAdminRepository, AUDIO_PUBLISH_STAGES, cmsRoleForAccountRole } from '@/lib/admin-audio';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import type { AudioPublishStage } from '@math/content-delivery';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/admin/audio/assets/[audioId]/transition
 * Move an asset to the NEXT lifecycle stage with RBAC + audit (cms-audio core).
 * The account ADMIN maps to PUBLISHER_ADMIN; specialized reviewer roles
 * (pronunciation/rights/curriculum) are checked against the transition table,
 * so an admin cannot shortcut LISTEN_REVIEW_REQUIRED.
 */
export async function POST(request: Request, ctx: { params: Promise<{ audioId: string }> }) {
  try {
    const principal = await requireRequestAccountPrincipal(request, 'ADMIN');
    const cmsRole = cmsRoleForAccountRole('ADMIN');
    const { audioId } = await ctx.params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ code: 'PAYLOAD_REQUIRED', message: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
    }
    const raw = body as Record<string, unknown>;
    const toStage = typeof raw.toStage === 'string' ? raw.toStage : '';
    if (!(AUDIO_PUBLISH_STAGES as readonly string[]).includes(toStage)) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: `toStage باید یکی از ${AUDIO_PUBLISH_STAGES.join('، ')} باشد.` }, { status: 400 });
    }
    const reason = typeof raw.reason === 'string' && raw.reason.trim().length > 0 ? raw.reason.trim() : 'admin transition from panel';
    const actorRole = (typeof raw.actorCmsRole === 'string' ? cmsRoleForAccountRole(raw.actorCmsRole) : null) ?? cmsRole;
    if (!actorRole) {
      return NextResponse.json({ code: 'ROLE_REQUIRED', message: 'نقش CMS معتبری برای این عملیات یافت نشد.' }, { status: 403 });
    }
    const holder = audioAdminRepository.transition(audioId, toStage as AudioPublishStage, { accountId: principal.accountId, role: actorRole }, reason);
    return NextResponse.json({ success: true, asset: holder.asset, auditTrail: holder.auditTrail });
  } catch (error) {
    return NextResponse.json({ code: 'AUDIO_TRANSITION_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

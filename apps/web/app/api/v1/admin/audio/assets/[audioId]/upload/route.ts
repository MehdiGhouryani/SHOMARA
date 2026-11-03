import { NextResponse } from 'next/server';
import { audioAdminRepository, AUDIO_PUBLISH_STAGES } from '@/lib/admin-audio';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/admin/audio/assets/[audioId]/upload
 * Stage5 §1.10 item 4: register a REAL binary (TTS output or human upload) with
 * checksum + duration. No binary bytes are stored in git; the caller supplies
 * metadata after uploading to object storage. Fake/zero binaries are rejected.
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
    const sha256 = typeof raw.sha256 === 'string' ? raw.sha256.trim().toLowerCase() : '';
    const durationMs = typeof raw.durationMs === 'number' ? raw.durationMs : Number.NaN;
    const bytes = typeof raw.bytes === 'number' ? raw.bytes : Number.NaN;
    const format = typeof raw.format === 'string' ? raw.format.trim() : '';
    const sourceKind = raw.sourceKind === 'TTS' || raw.sourceKind === 'HUMAN_UPLOAD' ? raw.sourceKind : null;
    const voiceProfileId = typeof raw.voiceProfileId === 'string' && raw.voiceProfileId.trim().length > 0 ? raw.voiceProfileId.trim() : null;
    if (!voiceProfileId) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'voiceProfileId الزامی است (شناسه انتزاعی، نه نام provider).' }, { status: 400 });
    }
    if (!sourceKind || !format || !Number.isFinite(durationMs) || !Number.isFinite(bytes)) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'format، sourceKind، durationMs و bytes الزامی‌اند.' }, { status: 400 });
    }
    const holder = audioAdminRepository.uploadBinary(
      audioId,
      { sha256, durationMs: Math.round(durationMs), format, bytes: Math.round(bytes), sourceKind, voiceProfileId },
      { accountId: principal.accountId, role: 'PUBLISHER_ADMIN' },
    );
    return NextResponse.json(
      {
        success: true,
        asset: holder.asset,
        auditTrail: holder.auditTrail,
        publishStages: AUDIO_PUBLISH_STAGES,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ code: 'AUDIO_BINARY_UPLOAD_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

import { NextResponse } from 'next/server';
import { audioAdminRepository } from '@/lib/admin-audio';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

/** GET /api/v1/admin/audio/scripts/[audioId] — script + asset versions + full audit + text history. */
export async function GET(request: Request, ctx: { params: Promise<{ audioId: string }> }) {
  try {
    await requireRequestAccountPrincipal(request, 'ADMIN');
    const { audioId } = await ctx.params;
    const detail = audioAdminRepository.getScriptDetail(audioId);
    if (!detail) return NextResponse.json({ code: 'AUDIO_SCRIPT_NOT_FOUND', message: 'AUDIO_SCRIPT_NOT_FOUND' }, { status: 404 });
    return NextResponse.json(detail);
  } catch (error) {
    return NextResponse.json({ code: 'AUDIO_SCRIPT_DETAIL_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

/**
 * PATCH /api/v1/admin/audio/scripts/[audioId]
 * Stage5 §1.10 item 2: edit text_display / text_tts side by side; shared lines
 * are warned via the impact report (script change invalidates bound binaries).
 */
export async function PATCH(request: Request, ctx: { params: Promise<{ audioId: string }> }) {
  try {
    const principal = await requireRequestAccountPrincipal(request, 'ADMIN');
    const { audioId } = await ctx.params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ code: 'PAYLOAD_REQUIRED', message: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
    }
    const raw = body as Record<string, unknown>;
    if (typeof raw.textDisplay !== 'string' || typeof raw.textTts !== 'string') {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'textDisplay و textTts هر دو الزامی‌اند.' }, { status: 400 });
    }
    const script = audioAdminRepository.editScript(
      audioId,
      { textDisplay: raw.textDisplay, textTts: raw.textTts },
      { accountId: principal.accountId, role: 'PUBLISHER_ADMIN' },
    );
    return NextResponse.json({ success: true, script });
  } catch (error) {
    return NextResponse.json({ code: 'AUDIO_SCRIPT_EDIT_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

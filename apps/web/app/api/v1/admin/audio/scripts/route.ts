import { NextResponse } from 'next/server';
import { audioAdminRepository } from '@/lib/admin-audio';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/audio/scripts?station=ST07&kind=pr&hasBinary=false
 * Stage5 §1.10 item 1: filter the 232 seeded rows.
 */
export async function GET(request: Request) {
  try {
    const principal = await requireRequestAccountPrincipal(request, 'ADMIN');
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station')?.trim() || undefined;
    const kind = searchParams.get('kind')?.trim() || undefined;
    const hasBinaryParam = searchParams.get('hasBinary');
    const hasBinary = hasBinaryParam === 'true' ? true : hasBinaryParam === 'false' ? false : undefined;
    const scripts = audioAdminRepository.listScripts({ station, kind, hasBinary });
    return NextResponse.json({
      count: scripts.length,
      // No PII in logs; only IDs and counts (CONTENT-018 minimization).
      requestedBy: { accountId: principal.accountId, mode: principal.mode },
      scripts: scripts.map(({ script, assets }) => ({
        audioId: script.audioId,
        kind: script.purpose,
        textDisplay: script.textDisplay,
        textTts: script.textTts,
        scriptStatus: script.scriptStatus,
        usedBy: script.usedBy,
        providerVoiceHint: script.providerVoiceHint,
        latestAsset: assets.length > 0
          ? { assetVersion: assets[0]!.asset.assetVersion, publishState: assets[0]!.asset.publishState, sha256: assets[0]!.asset.sha256, durationMs: assets[0]!.asset.durationMs }
          : null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ code: 'AUDIO_SCRIPT_LIST_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

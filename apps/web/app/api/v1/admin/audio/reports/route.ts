import { NextResponse } from 'next/server';
import { audioAdminRepository } from '@/lib/admin-audio';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/audio/reports
 * Stage5 §1.10 item 8: impact (script change invalidated binaries), orphan IDs
 * and missing binaries — the panel renders these before risky edits.
 */
export async function GET(request: Request) {
  try {
    await requireRequestAccountPrincipal(request, 'ADMIN');
    const reports = audioAdminRepository.reports();
    return NextResponse.json({
      impactCount: reports.impact.length,
      orphanCount: reports.orphans.length,
      missingBinaryCount: reports.missingBinaries.length,
      reports,
    });
  } catch (error) {
    return NextResponse.json({ code: 'AUDIO_REPORTS_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

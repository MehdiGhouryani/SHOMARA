import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';
import { G1_STATIONS } from '@math/contracts';

export async function GET(request: Request) {
  try {
    const principal = await requireRequestPrincipal(request);
    const gradeId = new URL(request.url).searchParams.get('gradeId') ?? 'G1';
    if (principal.accessToken) {
      const result = await supabaseRpc(principal.accessToken, 'runtime_get_progression_snapshot', { p_grade_code: gradeId });
      return NextResponse.json(result);
    }

    // Demo/dev web only: keep a deterministic shell projection without pretending it is learning truth.
    return NextResponse.json({
      gradeId,
      curriculumVersion: 'demo-local',
      generatedAt: new Date().toISOString(),
      stations: G1_STATIONS.map((station) => ({ stationId: station.id, stationCode: `G1-${station.id}`, sequence: station.number, title: station.title, status: 'ACTIVE' as const, passed: false, qualifyingCheckSessionCount: 0 })),
      completedStationIds: [],
      jumpUnlockedStationIds: [],
      activeSession: null,
    });
  } catch (error) {
    return NextResponse.json({ code: 'PROGRESSION_SNAPSHOT_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

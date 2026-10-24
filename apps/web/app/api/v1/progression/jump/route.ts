import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { supabaseRpc } from '@/lib/supabase-http';
import { evaluateJumpAssessment, publicJumpAssessment } from '@/lib/jump-assessment-bank';

export async function GET(request: Request) {
  try {
    const principal = await requireRequestPrincipal(request);
    const targetStationId = new URL(request.url).searchParams.get('targetStationId') ?? '';
    if (principal.accessToken) {
      const result = await supabaseRpc<{ id: string; targetUnitId: string; targetStationId: string; title: string; intro: string; questions: unknown[] }>(
        principal.accessToken,
        'progression_get_jump_assessment',
        { p_target_station_code: targetStationId.startsWith('G1-') ? targetStationId : `G1-${targetStationId}` },
      );
      return NextResponse.json(result);
    }
    const assessment = publicJumpAssessment(targetStationId);
    if (!assessment) return NextResponse.json({ code: 'JUMP_ASSESSMENT_NOT_FOUND' }, { status: 404 });
    return NextResponse.json(assessment);
  } catch (error) {
    return NextResponse.json({ code: 'JUMP_ASSESSMENT_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

export async function POST(request: Request) {
  try {
    const principal = await requireRequestPrincipal(request);
    const body = await request.json() as { assessmentId?: string; answers?: Record<string, unknown>; clientIdempotencyKey?: string };
    const answers: Record<string, number> = {};
    for (const [questionId, value] of Object.entries(body.answers ?? {})) {
      if (!Number.isInteger(value)) return NextResponse.json({ code: 'JUMP_ANSWER_INVALID' }, { status: 400 });
      answers[questionId] = Number(value);
    }
    if (principal.accessToken) {
      const key = body.clientIdempotencyKey?.trim();
      if (!key || key.length < 16) return NextResponse.json({ code: 'IDEMPOTENCY_KEY_INVALID' }, { status: 400 });
      const result = await supabaseRpc<{
        ok: true; assessmentId: string; targetStationId: string; targetUnitId: string;
        correctCount: number; totalCount: number; passed: boolean; unlockGranted: boolean; idempotentReplay: boolean;
      }>(principal.accessToken, 'progression_submit_jump_assessment', {
        p_assessment_code: String(body.assessmentId ?? ''),
        p_answers: answers,
        p_client_idempotency_key: key,
      });
      return NextResponse.json(result);
    }
    const result = evaluateJumpAssessment(String(body.assessmentId ?? ''), answers);
    if (!result.ok) return NextResponse.json({ code: result.code }, { status: 400 });
    return NextResponse.json({ ...result, unlockGranted: result.passed, idempotentReplay: false });
  } catch (error) {
    return NextResponse.json({ code: 'JUMP_ASSESSMENT_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { createEncounterId, getSessionOrThrow, runtimeStore } from '@/lib/learning-runtime';
import { productionLearningRuntime } from '@/lib/learning-runtime-production';

export async function POST(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    assertLearningRuntimeBackendReady();
    const principal = await requireRequestPrincipal(request);
    const { sessionId } = await context.params;
    const session = principal.accessToken ? null : await getSessionOrThrow(sessionId);
    const body = (await request.json()) as Partial<{
      contentVersionId: string;
      stationId: string;
      skillId: string;
      learningObjectiveId: string;
      learningRole: 'DIAGNOSTIC_PROBE' | 'INSTRUCTION' | 'GUIDED_PRACTICE' | 'INDEPENDENT_PRACTICE' | 'REVIEW' | 'TRANSFER' | 'RECOVERY' | 'MASTERY_CHECK';
      experienceForm: 'STORY' | 'PUZZLE' | 'CHALLENGE' | 'BOSS' | 'BUILD_EXPLORE' | 'CONVERSATION_EXPLANATION' | 'MINI_GAME';
      sequence: number;
    }>;
    if (!body.contentVersionId || !body.stationId || !body.skillId) throw new Error('ENCOUNTER_FIELDS_REQUIRED');
    if (principal.accessToken) {
      const encounter = await productionLearningRuntime(principal.accessToken).createEncounter({
        sessionId,
        sequence: body.sequence ?? 1,
        stationCode: body.stationId,
        skillCode: body.skillId,
        learningObjectiveId: body.learningObjectiveId,
        contentVersionId: body.contentVersionId,
      });
      return NextResponse.json({ encounter }, { status: 201 });
    }
    const content = await runtimeStore.repo.getContentVersion(body.contentVersionId);
    if (!content || !session) throw new Error('CONTENT_VERSION_NOT_FOUND');
    const encounter = await runtimeStore.engine.createEncounter({
      id: createEncounterId(),
      sessionId,
      sequence: body.sequence ?? 1,
      stationId: body.stationId,
      skillId: body.skillId,
      learningObjectiveId: body.learningObjectiveId,
      contentVersionId: body.contentVersionId,
      learningRole: body.learningRole ?? content.learningRole,
      experienceForm: body.experienceForm ?? content.experienceForm,
      content,
    });
    return NextResponse.json({ session, encounter }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ code: 'ENCOUNTER_CREATE_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

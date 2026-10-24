import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertLearningRuntimeBackendReady } from '@/lib/runtime-gates';
import { assertBodyIdentityMatches, requireRequestPrincipal } from '@/lib/request-principal';
import { createSessionId, runtimeStore } from '@/lib/learning-runtime';
import { productionLearningRuntime } from '@/lib/learning-runtime-production';

export async function POST(request: Request) {
  try {
    assertLearningRuntimeBackendReady();
    const body = (await request.json()) as Partial<{
      learningIdentityId: string;
      relationshipContextId: string;
      gradeId: string;
      curriculumVersionId: string;
      skillGraphVersionId: string;
      sessionType: 'LEARNING' | 'DIAGNOSTIC' | 'RECOVERY' | 'REVIEW';
    }>;
    const principal = await requireRequestPrincipal(request);
    const learningIdentityId = assertBodyIdentityMatches(principal, body.learningIdentityId);
    const clientInstallationId = request.headers.get('X-Client-Installation-Id')?.trim() || undefined;
    const session = principal.accessToken
      ? await productionLearningRuntime(principal.accessToken).startSession({
          ...(body.relationshipContextId ? { relationshipContextId: body.relationshipContextId } : {}),
          gradeCode: body.gradeId ?? 'G1',
          curriculumVersion: body.curriculumVersionId ?? 'g1-build-001',
          skillGraphVersion: body.skillGraphVersionId ?? 'g1-canonical-v1.0',
          sessionType: body.sessionType ?? 'LEARNING',
          clientInstallationId,
        })
      : await runtimeStore.engine.startSession({
          id: createSessionId(),
          learningIdentityId,
          relationshipContextId: body.relationshipContextId ?? 'platform',
          gradeId: body.gradeId ?? 'G1',
          curriculumVersionId: body.curriculumVersionId ?? 'G1-CV1',
          skillGraphVersionId: body.skillGraphVersionId ?? 'G1-SG1',
          sessionType: body.sessionType ?? 'LEARNING',
        });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ code: 'SESSION_CREATE_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

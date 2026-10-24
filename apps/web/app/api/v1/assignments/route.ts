import { NextResponse } from 'next/server';
import { assertAssignmentBackendReady } from '@/lib/runtime-gates';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { assignmentRuntime } from '@/lib/assignment-runtime';
import type { AdaptationMode, CompletionRule } from '@math/assignment-runtime';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function POST(request: Request) {
  try { assertAssignmentBackendReady(); assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'TEACHER');
    const body = await request.json() as {
      id?: string;
      classId?: string;
      authorAccountId?: string;
      learnerIds?: string[];
      sharedObjective?: string;
      sharedOutcome?: string | null;
      skillIds?: string[];
      stationIds?: string[];
      adaptationMode?: AdaptationMode;
      startsAt?: string;
      dueAt?: string | null;
      completionRule?: CompletionRule;
    };
    if (body.authorAccountId !== principal.accountId) return NextResponse.json({ code: 'ACCOUNT_CONTEXT_MISMATCH' }, { status: 403 });
    if (!body.classId || !(await adultProjectionRuntime.repo.listClassesForTeacher(principal.accountId)).includes(body.classId)) {
      return NextResponse.json({ code: 'FORBIDDEN_CLASS' }, { status: 403 });
    }
    const classLearners = new Set(await adultProjectionRuntime.repo.listLearnersInClass(body.classId));
    if (!body.learnerIds?.every((id) => classLearners.has(id))) {
      return NextResponse.json({ code: 'LEARNER_OUTSIDE_CLASS' }, { status: 403 });
    }
    if (!body.id || !body.classId || !body.authorAccountId || !body.learnerIds || !body.sharedObjective || !body.startsAt || !body.adaptationMode) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Missing assignment fields' }, { status: 400 });
    }
    const result = await assignmentRuntime.service.createDraft({
      id: body.id,
      classId: body.classId,
      authorAccountId: body.authorAccountId,
      learnerIds: body.learnerIds,
      sharedObjective: body.sharedObjective,
      sharedOutcome: body.sharedOutcome,
      boundary: {
        target: { skillIds: body.skillIds, stationIds: body.stationIds },
        adaptationMode: body.adaptationMode,
      },
      startsAt: body.startsAt,
      dueAt: body.dueAt,
      completionRule: body.completionRule,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 'ASSIGNMENT_CREATE_FAILED', message }, { status: apiErrorStatus(error) });
  }
}

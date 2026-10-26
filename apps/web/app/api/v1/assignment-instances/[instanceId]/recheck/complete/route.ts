import { NextResponse } from 'next/server';
import { assertAssignmentBackendReady, assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { assignmentRuntime } from '@/lib/assignment-runtime';
import { adultProjectionRuntime } from '@/lib/adult-projections';

/** Teacher resolves a pending recheck. This is the only way an instance leaves NEEDS_RECHECK. */
export async function POST(request: Request, ctx: { params: Promise<{ instanceId: string }> }) {
  try {
    assertAssignmentBackendReady();
    assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'TEACHER');
    const { instanceId } = await ctx.params;
    const body = await request.json() as { recheckId?: string };
    if (!body.recheckId) return NextResponse.json({ code: 'RECHECK_ID_REQUIRED', message: 'recheckId is required' }, { status: 400 });
    const instance = await assignmentRuntime.repo.getInstance(instanceId);
    if (!instance) return NextResponse.json({ code: 'INSTANCE_NOT_FOUND' }, { status: 404 });
    const recheck = await assignmentRuntime.repo.getRecheck(body.recheckId);
    if (!recheck || recheck.assignmentInstanceId !== instanceId) return NextResponse.json({ code: 'RECHECK_NOT_FOUND' }, { status: 404 });
    const assignment = await assignmentRuntime.repo.getAssignment(instance.assignmentId);
    if (!assignment) return NextResponse.json({ code: 'ASSIGNMENT_NOT_FOUND' }, { status: 404 });
    const teacherClasses = await adultProjectionRuntime.repo.listClassesForTeacher(principal.accountId);
    if (assignment.authorAccountId !== principal.accountId && !teacherClasses.includes(assignment.classId)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
    const completed = await assignmentRuntime.service.completeRecheck(body.recheckId);
    return NextResponse.json(completed);
  } catch (error) {
    const message = publicErrorMessage(error);
    return NextResponse.json({ code: 'RECHECK_COMPLETE_FAILED', message }, { status: apiErrorStatus(error) });
  }
}

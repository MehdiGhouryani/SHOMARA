import { NextResponse } from 'next/server';
import { assertAssignmentBackendReady } from '@/lib/runtime-gates';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { assignmentRuntime } from '@/lib/assignment-runtime';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function POST(request: Request, ctx: { params: Promise<{ instanceId: string }> }) {
  try { assertAssignmentBackendReady(); assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'TEACHER');
    const { instanceId } = await ctx.params;
    const body = await request.json() as { requestedByAccountId?: string; reason?: string };
    if (body.requestedByAccountId !== principal.accountId) return NextResponse.json({ code: 'ACCOUNT_CONTEXT_MISMATCH' }, { status: 403 });
    if (!body.requestedByAccountId) return NextResponse.json({ code: 'REQUESTER_REQUIRED', message: 'requestedByAccountId is required' }, { status: 400 });
    const instance = await assignmentRuntime.repo.getInstance(instanceId);
    if (!instance) return NextResponse.json({ code: 'INSTANCE_NOT_FOUND' }, { status: 404 });
    const assignment = await assignmentRuntime.repo.getAssignment(instance.assignmentId);
    if (!assignment) return NextResponse.json({ code: 'ASSIGNMENT_NOT_FOUND' }, { status: 404 });
    const teacherClasses = await adultProjectionRuntime.repo.listClassesForTeacher(principal.accountId);
    if (assignment.authorAccountId !== principal.accountId && !teacherClasses.includes(assignment.classId)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
    const recheck = await assignmentRuntime.service.requestRecheck(instanceId, body.requestedByAccountId, body.reason);
    return NextResponse.json(recheck, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 'RECHECK_REQUEST_FAILED', message }, { status: apiErrorStatus(error) });
  }
}

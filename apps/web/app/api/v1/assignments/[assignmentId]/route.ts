import { NextResponse } from 'next/server';
import { assertAssignmentBackendReady } from '@/lib/runtime-gates';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { assignmentRuntime } from '@/lib/assignment-runtime';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function GET(request: Request, ctx: { params: Promise<{ assignmentId: string }> }) {
  try { assertAssignmentBackendReady(); assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'TEACHER');
    const { assignmentId } = await ctx.params;
    const assignment = await assignmentRuntime.repo.getAssignment(assignmentId);
    if (!assignment) return NextResponse.json({ code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' }, { status: 404 });
    const teacherClasses = await adultProjectionRuntime.repo.listClassesForTeacher(principal.accountId);
    if (assignment.authorAccountId !== principal.accountId && !teacherClasses.includes(assignment.classId)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
    const instances = await assignmentRuntime.repo.listInstances(assignmentId);
    return NextResponse.json({ assignment, instances });
  } catch (error) {
    return NextResponse.json({ code: 'ASSIGNMENT_READ_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}

export async function POST(request: Request, ctx: { params: Promise<{ assignmentId: string }> }) {
  try {
    assertAssignmentBackendReady();
    assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'TEACHER');
    const { assignmentId } = await ctx.params;
    const assignment = await assignmentRuntime.repo.getAssignment(assignmentId);
    if (!assignment) return NextResponse.json({ code: 'ASSIGNMENT_NOT_FOUND' }, { status: 404 });
    const teacherClasses = await adultProjectionRuntime.repo.listClassesForTeacher(principal.accountId);
    if (assignment.authorAccountId !== principal.accountId && !teacherClasses.includes(assignment.classId)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
    const body = await request.json() as { action?: 'PUBLISH'; learnerIds?: string[] };
    const classLearners = new Set(await adultProjectionRuntime.repo.listLearnersInClass(assignment.classId));
    if (!body.learnerIds?.every((id) => classLearners.has(id))) return NextResponse.json({ code: 'LEARNER_OUTSIDE_CLASS' }, { status: 403 });
    if (body.action !== 'PUBLISH' || !body.learnerIds?.length) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'PUBLISH and learnerIds are required' }, { status: 400 });
    }
    const result = await assignmentRuntime.service.publish(assignmentId, body.learnerIds);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 'ASSIGNMENT_PUBLISH_FAILED', message }, { status: apiErrorStatus(error) });
  }
}

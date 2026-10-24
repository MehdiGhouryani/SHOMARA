import { NextResponse } from 'next/server';
import { assertAssignmentBackendReady } from '@/lib/runtime-gates';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { assignmentRuntime } from '@/lib/assignment-runtime';

export async function GET(request: Request, ctx: { params: Promise<{ assignmentId: string }> }) {
  try { assertAssignmentBackendReady(); assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'TEACHER');
    const { assignmentId } = await ctx.params;
    const assignment = await assignmentRuntime.repo.getAssignment(assignmentId);
    if (!assignment) return NextResponse.json({ code: 'ASSIGNMENT_NOT_FOUND' }, { status: 404 });
    if (assignment.authorAccountId !== principal.accountId) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
    return NextResponse.json({ assignmentId, packageIds: [], note: 'Production resolver is DB-backed in the Supabase adapter; development fixture has no authored package requirements.' });
  } catch (error) {
    return NextResponse.json({ code: 'ASSIGNMENT_CONTENT_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

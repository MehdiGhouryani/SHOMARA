import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function GET(request: Request, ctx: { params: Promise<{ parentAccountId: string }> }) {
  try { assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'PARENT'); const { parentAccountId } = await ctx.params; if (principal.accountId !== parentAccountId) throw new Error('ACCOUNT_CONTEXT_MISMATCH');
    const children = await adultProjectionRuntime.repo.listRelatedChildren(parentAccountId);
    if (children.length !== 1) return NextResponse.json({ code: children.length ? 'MULTIPLE_CHILDREN_UNSUPPORTED_IN_V1_SCREEN' : 'CHILD_NOT_FOUND' }, { status: 404 });
    if (!(await adultProjectionRuntime.repo.hasParentAccess(parentAccountId, children[0]))) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
    const projection = await adultProjectionRuntime.service.getParentToday(parentAccountId);
    const { assignments: _internalAssignments, ...parentReport } = projection;
    return NextResponse.json(parentReport);
  } catch (error) {
    return NextResponse.json({ code: 'PARENT_TODAY_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

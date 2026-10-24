import { NextResponse } from 'next/server';
import { apiErrorStatus, publicErrorMessage } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function GET(request: Request) {
  try {
    assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'PARENT');
    const children = await adultProjectionRuntime.repo.listRelatedChildren(principal.accountId);
    if (children.length !== 1) {
      return NextResponse.json(
        { code: children.length === 0 ? 'CHILD_NOT_FOUND' : 'MULTIPLE_CHILDREN_UNSUPPORTED_IN_V1_SCREEN' },
        { status: 404 },
      );
    }
    const learningIdentityId = children[0]!;
    if (!(await adultProjectionRuntime.repo.hasParentAccess(principal.accountId, learningIdentityId))) {
      return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
    }
    const projection = await adultProjectionRuntime.service.getParentToday(principal.accountId);
    const { assignments: _internalAssignments, ...parentReport } = projection;
    return NextResponse.json(parentReport);
  } catch (error) {
    return NextResponse.json({ code: 'PARENT_TODAY_FAILED', message: publicErrorMessage(error) }, { status: apiErrorStatus(error) });
  }
}

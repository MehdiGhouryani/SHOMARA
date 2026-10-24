import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function GET(request: Request, ctx: { params: Promise<{ parentAccountId: string }> }) {
  try { assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'PARENT'); const { parentAccountId } = await ctx.params; if (principal.accountId !== parentAccountId) throw new Error('ACCOUNT_CONTEXT_MISMATCH');
    const related = await adultProjectionRuntime.repo.listRelatedChildren(parentAccountId);
    const children = await Promise.all(related.map(async (id: string) => ({ learningIdentityId: id, displayName: await adultProjectionRuntime.repo.getDisplayName(id) })));
    return NextResponse.json(children);
  } catch (error) {
    const status = error instanceof Error && (error.message === 'ACCOUNT_CONTEXT_MISMATCH' || error.message === 'DEV_ACCOUNT_PRINCIPAL_REQUIRED') ? 403 : 400;
    return NextResponse.json({ code: 'PARENT_CHILDREN_FAILED', message: error instanceof Error ? error.message : 'unknown error' }, { status });
  }
}

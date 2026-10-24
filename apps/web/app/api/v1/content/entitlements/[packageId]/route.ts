import { NextResponse } from 'next/server';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { checkEntitlement } from '../../../../../../lib/content-delivery';

export async function GET(request: Request, ctx: { params: Promise<{ packageId: string }> }) {
  const principal = await requireRequestPrincipal(request);
  const { packageId } = await ctx.params;
  return NextResponse.json(await checkEntitlement(packageId, principal.learningIdentityId, principal.accessToken));
}

import { NextResponse } from 'next/server';
import { assertContentBackendReady } from '@/lib/runtime-gates';
import { apiErrorStatus } from '@/lib/api-errors';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { checkEntitlement, getPackage } from '../../../../../../lib/content-delivery';

export async function GET(request: Request, ctx: { params: Promise<{ packageId: string }> }) {
  try {
    assertContentBackendReady();
    const principal = await requireRequestPrincipal(request);
  const { packageId } = await ctx.params;
  const entitlement = await checkEntitlement(packageId, principal.learningIdentityId, principal.accessToken);
  if (!entitlement.entitled) return NextResponse.json(entitlement, { status: 403 });
  const result = await getPackage(packageId, principal.accessToken);
  if (!result) return NextResponse.json({ code: 'PACKAGE_NOT_FOUND', message: 'Content package not found' }, { status: 404 });
  if (!result.descriptor.downloadUrl) return NextResponse.json(result.descriptor);
    return new NextResponse(result.bytes as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': String(result.bytes.length),
      'X-Content-Package-Id': result.descriptor.id,
      'X-Content-Package-Checksum': result.descriptor.checksum,
      'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json({ code: 'CONTENT_PACKAGE_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}
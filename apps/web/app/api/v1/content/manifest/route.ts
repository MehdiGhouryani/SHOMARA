import { NextResponse } from 'next/server';
import { assertContentBackendReady } from '@/lib/runtime-gates';
import { apiErrorStatus } from '@/lib/api-errors';
import { requireRequestPrincipal } from '@/lib/request-principal';
import { getManifest } from '../../../../../lib/content-delivery';

export async function GET(request: Request) {
  try {
    assertContentBackendReady();
    const principal = await requireRequestPrincipal(request);
  const url = new URL(request.url);
  const gradeId = url.searchParams.get('gradeId');
  if (!gradeId) return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'gradeId is required' }, { status: 400 });
    return NextResponse.json(await getManifest(gradeId, principal.accessToken));
  } catch (error) {
    return NextResponse.json({ code: 'CONTENT_MANIFEST_FAILED', message: error instanceof Error ? error.message : 'Unknown error' }, { status: apiErrorStatus(error) });
  }
}

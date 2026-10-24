import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function GET(request: Request, ctx: { params: Promise<{ teacherAccountId: string }> }) {
  try { assertAdultProjectionBackendReady(); const principal = await requireRequestAccountPrincipal(request, 'TEACHER'); const { teacherAccountId } = await ctx.params; if (principal.accountId !== teacherAccountId) throw new Error('ACCOUNT_CONTEXT_MISMATCH'); return NextResponse.json(await adultProjectionRuntime.service.listTeacherClasses(teacherAccountId)); }
  catch (error) { const status = error instanceof Error && (error.message==='ACCOUNT_CONTEXT_MISMATCH'||error.message==='DEV_ACCOUNT_PRINCIPAL_REQUIRED') ? 403 : 400; return NextResponse.json({ code:'TEACHER_CLASSES_FAILED', message:error instanceof Error?error.message:'unknown error' }, {status}); }
}

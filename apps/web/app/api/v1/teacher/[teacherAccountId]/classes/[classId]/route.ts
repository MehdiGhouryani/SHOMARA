import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function GET(request: Request, ctx: { params: Promise<{ teacherAccountId:string; classId:string }> }) {
  try { assertAdultProjectionBackendReady(); const principal = await requireRequestAccountPrincipal(request, 'TEACHER'); const {teacherAccountId,classId}=await ctx.params; if (principal.accountId !== teacherAccountId) throw new Error('ACCOUNT_CONTEXT_MISMATCH'); const students=await adultProjectionRuntime.service.listTeacherStudents(teacherAccountId,classId); return NextResponse.json({classId,className:await adultProjectionRuntime.repo.getClassName(classId),students}); }
  catch(error){ const status=error instanceof Error && (error.message==='FORBIDDEN_CLASS'||error.message==='ACCOUNT_CONTEXT_MISMATCH'||error.message==='DEV_ACCOUNT_PRINCIPAL_REQUIRED')?403:400; return NextResponse.json({code:'TEACHER_CLASS_FAILED',message:error instanceof Error?error.message:'unknown error'},{status}); }
}

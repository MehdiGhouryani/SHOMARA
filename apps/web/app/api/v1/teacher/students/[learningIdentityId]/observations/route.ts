import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { adultProjectionRuntime } from '@/lib/adult-projections';

export async function POST(request: Request, ctx: { params: Promise<{ learningIdentityId:string }> }) {
  try { assertAdultProjectionBackendReady();
    const principal = await requireRequestAccountPrincipal(request, 'TEACHER');
    const { learningIdentityId } = await ctx.params;
    const body = await request.json() as { teacherAccountId?: string; classId?: string | null; observation?: string };
    if (body.teacherAccountId !== principal.accountId) return NextResponse.json({ code:'ACCOUNT_CONTEXT_MISMATCH' }, {status:403});
    if (!body.teacherAccountId || !body.observation) return NextResponse.json({code:'VALIDATION_ERROR',message:'teacherAccountId and observation are required'},{status:400});
    const record = await adultProjectionRuntime.service.addTeacherObservation({teacherAccountId:body.teacherAccountId,learningIdentityId,classId:body.classId,observation:body.observation});
    return NextResponse.json(record,{status:201});
  } catch(error) {
    const status=error instanceof Error && (error.message==='FORBIDDEN_STUDENT'||error.message==='ACCOUNT_CONTEXT_MISMATCH'||error.message==='DEV_ACCOUNT_PRINCIPAL_REQUIRED')?403:400;
    return NextResponse.json({code:'OBSERVATION_CREATE_FAILED',message:error instanceof Error?error.message:'unknown error'},{status});
  }
}

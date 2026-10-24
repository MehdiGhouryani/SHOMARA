import { NextResponse } from 'next/server';
import { apiErrorStatus } from '@/lib/api-errors';
import { assertAdultProjectionBackendReady } from '@/lib/runtime-gates';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';
import { adultProjectionRuntime } from '@/lib/adult-projections';
export async function GET(request: Request, ctx: { params: Promise<{ teacherAccountId:string }> }) { try { assertAdultProjectionBackendReady(); const principal = await requireRequestAccountPrincipal(request, 'TEACHER'); const {teacherAccountId}=await ctx.params; await adultProjectionRuntime.service.seedRecheckQueueFromAssignments(teacherAccountId); return NextResponse.json(await adultProjectionRuntime.service.getRecheckQueue(teacherAccountId)); } catch(error){ return NextResponse.json({code:'RECHECK_QUEUE_FAILED',message:error instanceof Error?error.message:'unknown error'},{status:apiErrorStatus(error)}); } }

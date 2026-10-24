import { NextResponse } from 'next/server';
import { teacherApplicationRepository } from '@/lib/teacher-applications';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireRequestAccountPrincipal(request, 'ADMIN');
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json(
        { code: 'ID_REQUIRED', message: 'شناسه درخواست الزامی است.' },
        { status: 400 }
      );
    }

    const record = await teacherApplicationRepository.findById(id);
    if (!record) {
      return NextResponse.json(
        { code: 'APPLICATION_NOT_FOUND', message: 'درخواستی با این شناسه یافت نشد.' },
        { status: 404 }
      );
    }

    // Return non-sensitive status info
    return NextResponse.json({
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      schoolName: record.schoolName,
      city: record.city,
      status: record.status,
      submittedAt: record.submittedAt,
      reviewedAt: record.reviewedAt ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'ROLE_REQUIRED') {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'ورود مدیر الزامی است.' }, { status: 403 });
    }
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'خطای سرور',
      },
      { status: 500 }
    );
  }
}

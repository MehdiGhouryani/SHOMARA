import { NextResponse } from 'next/server';
import {
  teacherApplicationRepository,
  validateAndNormalizeTeacherApplication,
  TeacherApplicationValidationError,
} from '@/lib/teacher-applications';
import { requireRequestAccountPrincipal } from '@/lib/request-principal';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        {
          code: 'PAYLOAD_REQUIRED',
          message: 'بدنه درخواست نامعتبر است یا داده‌ای ارسال نشده است.',
        },
        { status: 400 }
      );
    }

    // Validate minimal necessary data
    const submission = validateAndNormalizeTeacherApplication(rawBody);

    // Persist with mandatory PENDING status
    const record = await teacherApplicationRepository.create(submission);

    return NextResponse.json(
      {
        success: true,
        message: 'درخواست همکاری شما با موفقیت ثبت شد و در نوبت بررسی قرار گرفت.',
        application: {
          id: record.id,
          firstName: record.firstName,
          lastName: record.lastName,
          phoneNumber: record.phoneNumber,
          schoolName: record.schoolName,
          city: record.city,
          notes: record.notes,
          status: record.status, // 'PENDING'
          submittedAt: record.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof TeacherApplicationValidationError) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'خطایی در ثبت درخواست رخ داد. لطفاً مجدداً تلاش فرمایید.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await requireRequestAccountPrincipal(request, 'ADMIN');
  } catch {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'ورود مدیر الزامی است.' }, { status: 403 });
  }
  // Allow filtering by status if needed
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const validStatus =
    statusParam === 'PENDING' || statusParam === 'APPROVED' || statusParam === 'REJECTED'
      ? statusParam
      : undefined;

  const applications = await teacherApplicationRepository.list(
    validStatus ? { status: validStatus } : undefined
  );

  return NextResponse.json({
    applications: applications.map((app) => ({
      id: app.id,
      firstName: app.firstName,
      lastName: app.lastName,
      phoneNumber: app.phoneNumber,
      schoolName: app.schoolName,
      city: app.city,
      status: app.status,
      submittedAt: app.submittedAt,
      reviewedAt: app.reviewedAt,
    })),
  });
}

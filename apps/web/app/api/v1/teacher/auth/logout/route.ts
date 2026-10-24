import { NextResponse } from 'next/server';
import { clearTeacherSessionCookie } from '@/lib/teacher-auth';

export async function POST() {
  await clearTeacherSessionCookie();
  return NextResponse.json({
    success: true,
    message: 'خروج از حساب معلم با موفقیت انجام شد.',
  });
}

import { NextResponse } from 'next/server';
import { getTeacherSessionFromRequest } from '@/lib/teacher-auth';

export async function GET(request: Request) {
  try {
    const session = await getTeacherSessionFromRequest(request);

    if (!session || !session.isTeacher) {
      return NextResponse.json(
        {
          authenticated: false,
          message: 'کاربر وارد نشده است یا فاقد نقش معلمی است.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        accountId: session.accountId,
        username: session.username,
        displayName: session.displayName,
        roles: session.roles,
        isTeacher: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        message: error instanceof Error ? error.message : 'خطای سرور',
      },
      { status: 500 }
    );
  }
}

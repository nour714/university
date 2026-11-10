import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionCookie } from '@/server/auth/cookies';
import { validateSession } from '@/server/auth/session';

export const maxDuration = 30;

export async function GET() {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ student: null }, { status: 401 });
  }

  const session = await validateSession(token);
  if (!session) {
    return NextResponse.json({ student: null }, { status: 401 });
  }

  return NextResponse.json(
    { student: session.studentProfile },
    {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    }
  );
}

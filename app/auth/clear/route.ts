import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeSession } from '@/server/auth/session';
import { SESSION_COOKIE_NAME } from '@/server/auth/cookies';

export const maxDuration = 30;

async function handleClear(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await revokeSession(token);
    } catch {
      // Ignore database connection failures during cleanup
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);

  const url = new URL('/login?reason=expired', request.url);
  const response = NextResponse.redirect(url, 303);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET(request: Request) {
  return handleClear(request);
}

export async function POST(request: Request) {
  return handleClear(request);
}

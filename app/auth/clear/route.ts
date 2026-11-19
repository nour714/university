import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeSession } from '@/server/auth/session';
import { SESSION_COOKIE_NAME } from '@/server/auth/cookies';

export const maxDuration = 30;

function isCrossSiteRequest(request: Request): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return true;
  }

  const reqUrl = new URL(request.url);

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== reqUrl.host) {
        return true;
      }
    } catch {
      return true;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.host !== reqUrl.host) {
        return true;
      }
    } catch {
      return true;
    }
  }

  return false;
}

async function handleClear(request: Request) {
  if (isCrossSiteRequest(request)) {
    return new Response('Forbidden: Cross-site request rejected', { status: 403 });
  }

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

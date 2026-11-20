import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeSession } from '@/server/auth/session';
import { SESSION_COOKIE_NAME, MUST_CHANGE_COOKIE_NAME } from '@/server/auth/cookies';

export const maxDuration = 30;

function isCrossSiteRequest(request: Request): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return true;
  }

  const reqUrl = new URL(request.url);
  const normalizeHost = (host: string) => host.replace(/^127\.0\.0\.1/, 'localhost');

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (normalizeHost(originUrl.host) !== normalizeHost(reqUrl.host)) {
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
      if (normalizeHost(refUrl.host) !== normalizeHost(reqUrl.host)) {
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
  cookieStore.delete(MUST_CHANGE_COOKIE_NAME);

  const reqUrl = new URL(request.url);
  const reasonParam = reqUrl.searchParams.get('reason');
  const reason = reasonParam === 'logged_out' ? 'logged_out' : 'expired';

  const url = new URL(`/login?reason=${reason}`, request.url);
  const response = NextResponse.redirect(url, 303);
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(MUST_CHANGE_COOKIE_NAME);
  return response;
}

export async function GET(request: Request) {
  return handleClear(request);
}

export async function POST(request: Request) {
  return handleClear(request);
}

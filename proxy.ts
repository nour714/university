import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isE2EHttp = process.env.E2E_HTTP_ONLY === '1';

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' && !isE2EHttp ? '__Host-sid' : 'academic_sid';

const MUST_CHANGE_COOKIE_NAME =
  process.env.NODE_ENV === 'production' && !isE2EHttp ? '__Host-mcp' : 'academic_mcp';

// Routes requiring authenticated session
const PROTECTED_PREFIXES = ['/courses', '/exams', '/codes', '/settings', '/account', '/notifications'];

/**
 * NOTE: The proxy is a routing hint, not a security boundary.
 * Actual authentication, authorization, and ownership checks are strictly enforced
 * inside Server Components, Server Actions, and Route Handlers via requireAuth().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, images, API routes, cron, and internal Next.js requests
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isProtectedPath =
    pathname === '/' ||
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );

  // 2. Unauthenticated user without cookie trying to access a protected route -> redirect to /login
  if (!sessionCookie && isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. User with active session but required password change -> deterministically enforce /account/change-password
  const mustChangeCookie = request.cookies.get(MUST_CHANGE_COOKIE_NAME)?.value;
  if (sessionCookie && mustChangeCookie === '1') {
    const isAllowedForPasswordChange =
      pathname === '/account/change-password' ||
      pathname.startsWith('/account/change-password/');

    if (!isAllowedForPasswordChange && isProtectedPath) {
      const changePasswordUrl = new URL('/account/change-password', request.url);
      return NextResponse.redirect(changePasswordUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-sid' : 'academic_sid';

// Public routes that never require a session
const PUBLIC_PATHS = ['/login', '/auth/clear', '/favicon.ico'];

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
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // 2. Unauthenticated user without cookie trying to access a protected route -> redirect to /login
  if (!sessionCookie && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: Removed the "cookie present + /login -> /" redirect.
  // Stale/expired/must-change cookies must be allowed to reach /login or /account/change-password
  // without triggering an infinite redirect loop. Verification happens in the page Server Component.

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

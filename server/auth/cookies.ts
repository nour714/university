import 'server-only';
import { cookies } from 'next/headers';

/**
 * Enterprise Academic Cookie Configuration
 *
 * Security Rationale (OWASP ASVS 4.0 & Campus Shared Terminal Policy):
 * - SESSION_COOKIE_NAME uses '__Host-sid' in production (strict host-only, Secure, Path=/).
 * - maxAge is intentionally omitted so cookies act strictly as browser Session Cookies.
 *   University lab terminals are shared across dozens of students daily; omitting maxAge
 *   ensures session cookies are cleared immediately upon browser termination, eliminating
 *   session abandonment and cross-student hijacking risks.
 * - MUST_CHANGE_COOKIE_NAME flags accounts required to complete mandatory password change,
 *   allowing edge proxy routing to instantly redirect uncompleted accounts with zero UI flash.
 */
const isE2EHttp = process.env.E2E_HTTP_ONLY === '1';

// Strict safety check: Never allow E2E_HTTP_ONLY in real production deployment environments (e.g. Vercel)
if (isE2EHttp && (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV === 'production')) {
  throw new Error('E2E_HTTP_ONLY is strictly prohibited in production deployments.');
}

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' && !isE2EHttp ? '__Host-sid' : 'academic_sid';

export const MUST_CHANGE_COOKIE_NAME =
  process.env.NODE_ENV === 'production' && !isE2EHttp ? '__Host-mcp' : 'academic_mcp';

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isE2EHttp,
    sameSite: 'lax',
    path: '/',
    // Omit maxAge so this acts strictly as a browser Session Cookie.
    // The cookie is deleted as soon as the browser is closed.
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function setMustChangePasswordCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MUST_CHANGE_COOKIE_NAME, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isE2EHttp,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getMustChangePasswordCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(MUST_CHANGE_COOKIE_NAME)?.value;
}

export async function clearMustChangePasswordCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MUST_CHANGE_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isE2EHttp,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isE2EHttp,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  cookieStore.set(MUST_CHANGE_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isE2EHttp,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

import 'server-only';
import { redirect } from 'next/navigation';
import { getSessionCookie } from './cookies';
import { validateSession, AuthenticatedStudent } from './session';

export interface RequireAuthOptions {
  allowMustChangePassword?: boolean;
}

/**
 * Enforces session authentication for Server Actions and Server Components.
 * Redirects or throws if unauthenticated or account is locked/inactive.
 */
export async function requireAuth(options: RequireAuthOptions = {}): Promise<AuthenticatedStudent> {
  const token = await getSessionCookie();

  if (!token) {
    redirect('/login');
  }

  const student = await validateSession(token);

  if (!student) {
    redirect('/login');
  }

  if (student.mustChangePassword && !options.allowMustChangePassword) {
    redirect('/login?changePassword=true');
  }

  return student;
}

/**
 * Safe auth check that does not throw or redirect (for public / conditionally authenticated views).
 */
export async function getOptionalAuth(): Promise<AuthenticatedStudent | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return validateSession(token);
}

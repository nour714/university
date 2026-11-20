import 'server-only';
import { redirect } from 'next/navigation';
import {
  getSessionCookie,
  setMustChangePasswordCookie,
  clearMustChangePasswordCookie,
} from './cookies';
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

  // No cookie present -> user is unauthenticated
  if (!token) {
    redirect('/login');
  }

  const student = await validateSession(token);

  // Cookie is present but maps to an invalid, expired, or revoked session -> clear cookie to prevent loops
  if (!student) {
    redirect('/auth/clear');
  }

  // Account requires forced password change
  if (student.mustChangePassword && !options.allowMustChangePassword) {
    await setMustChangePasswordCookie();
    redirect('/account/change-password');
  }

  // Account completed password change -> ensure cookie is cleared
  if (!student.mustChangePassword && !options.allowMustChangePassword) {
    await clearMustChangePasswordCookie();
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

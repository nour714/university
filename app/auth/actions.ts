'use server';

import 'server-only';
import { z } from 'zod';
import { appSql } from '@/lib/db/app.server';
import {
  verifyPassword,
  verifyDummyPassword,
  hashPassword,
  validatePasswordStrength,
} from '@/server/auth/password';
import { createSession, revokeSession, revokeAllAccountSessions } from '@/server/auth/session';
import { setSessionCookie, clearSessionCookie, getSessionCookie } from '@/server/auth/cookies';
import { requireAuth } from '@/server/auth/requireAuth';
import { checkRateLimit } from '@/server/security/rateLimit';

const LoginSchema = z.object({
  identifier: z.string().trim().min(6, 'يرجى إدخال الرقم القومي أو الرقم الأكاديمي').max(30),
  password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف').max(100),
});

export type LoginActionResult =
  | { success: true; mustChangePassword: boolean }
  | { success: false; error: string };

export async function loginAction(input: unknown): Promise<LoginActionResult> {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'البيانات المدخلة غير صحيحة' };
  }

  const { identifier, password } = parsed.data;

  // Rate limit: maximum 10 attempts per 10 minutes per identifier
  const rateLimit = await checkRateLimit(identifier, 'login', 10, 600);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار 10 دقائق ثم المحاولة مجدداً.',
    };
  }

  const [account] = await appSql`
    SELECT a.id, a.national_id, a.password_hash, a.must_change_password, a.failed_login_count, a.locked_until, a.is_active
    FROM public.academic_accounts a
    LEFT JOIN public.academic_profiles p ON p.id = a.id
    WHERE a.national_id = ${identifier} OR p.student_code = ${identifier}
  `;

  // Protect against user enumeration & timing attacks
  if (!account || !account.is_active) {
    await verifyDummyPassword();
    return { success: false, error: 'الرقم القومي أو كلمة المرور غير صحيحة.' };
  }

  // Check account lockout
  if (account.locked_until && new Date(account.locked_until).getTime() > Date.now()) {
    const minutesLeft = Math.ceil((new Date(account.locked_until).getTime() - Date.now()) / (60 * 1000));
    return {
      success: false,
      error: `الحساب مقفل مؤقتاً لحمايتك بسبب تكرار المحاولات الخاطئة. يرجى المحاولة بعد ${minutesLeft} دقيقة.`,
    };
  }

  const isValidPassword = await verifyPassword(password, account.password_hash);

  if (!isValidPassword) {
    const newFailedCount = (account.failed_login_count || 0) + 1;
    const shouldLock = newFailedCount >= 5;

    await appSql`
      UPDATE public.academic_accounts
         SET failed_login_count = ${newFailedCount},
             locked_until = ${shouldLock ? appSql`now() + interval '15 minutes'` : null}
       WHERE id = ${account.id}
    `;

    return {
      success: false,
      error: shouldLock
        ? 'تم قفل الحساب لمدة 15 دقيقة بسبب تكرار المحاولات الخاطئة.'
        : 'الرقم القومي أو كلمة المرور غير صحيحة.',
    };
  }

  // Reset lock & update last login
  await appSql`
    UPDATE public.academic_accounts
       SET failed_login_count = 0,
           locked_until = null,
           last_login_at = now()
     WHERE id = ${account.id}
  `;

  // Create opaque 256-bit session
  const token = await createSession(account.id);
  await setSessionCookie(token);

  // Record audit log
  await appSql`
    INSERT INTO academic_private.audit_log (actor, action, details)
    VALUES (${account.id}, 'LOGIN_SUCCESS', ${JSON.stringify({ identifier: identifier.slice(0, 4) + '***' })}::jsonb)
  `;

  return { success: true, mustChangePassword: account.must_change_password };
}

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const token = await getSessionCookie();
    if (token) {
      await revokeSession(token);
    }
  } catch {
    // Continue cleanup even if DB is temporarily unreachable
  } finally {
    await clearSessionCookie();
  }

  return { success: true };
}

export async function changePasswordAction(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const student = await requireAuth({ allowMustChangePassword: true });

  const strength = validatePasswordStrength(newPassword, student.nationalId);
  if (!strength.valid) {
    return { success: false, error: strength.message };
  }

  if (currentPassword === newPassword) {
    return { success: false, error: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.' };
  }

  const [account] = await appSql`
    SELECT password_hash FROM public.academic_accounts WHERE id = ${student.accountId}
  `;

  if (!account) {
    return { success: false, error: 'الحساب غير موجود.' };
  }

  const isCurrentValid = await verifyPassword(currentPassword, account.password_hash);
  if (!isCurrentValid) {
    return { success: false, error: 'كلمة المرور الحالية غير صحيحة.' };
  }

  const newHash = await hashPassword(newPassword);

  await appSql`
    UPDATE public.academic_accounts
       SET password_hash = ${newHash},
           must_change_password = false,
           password_changed_at = now()
     WHERE id = ${student.accountId}
  `;

  // Revoke other active sessions except current
  await revokeAllAccountSessions(student.accountId);

  // Record audit log
  await appSql`
    INSERT INTO academic_private.audit_log (actor, action, details)
    VALUES (${student.accountId}, 'PASSWORD_CHANGED', '{}'::jsonb)
  `;

  return { success: true };
}

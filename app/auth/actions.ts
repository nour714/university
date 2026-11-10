'use server';

import 'server-only';
import { z } from 'zod';
import { headers } from 'next/headers';
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
import { normalizeIdentifier, maskIdentifier } from '@/lib/security/normalizeIdentifier';
import { isCommonPassword } from '@/lib/security/commonPasswords';
import { verifyTurnstileToken } from '@/server/security/turnstile';

const LoginSchema = z.object({
  identifier: z.string().trim().min(3, 'يرجى إدخال الرقم القومي أو الرقم الأكاديمي').max(50),
  password: z.string().min(1, 'يرجى إدخال كلمة المرور').max(128),
  turnstileToken: z.string().optional(),
});

export type LoginActionResult =
  | { success: true; mustChangePassword: boolean }
  | { success: false; error: string };

const GENERIC_LOGIN_ERROR = 'الرقم القومي أو كلمة المرور غير صحيحة، أو تم تقييد المحاولات مؤقتاً';

export async function loginAction(input: unknown): Promise<LoginActionResult> {
  try {
    const parsed = LoginSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

  const { identifier: rawIdentifier, password, turnstileToken } = parsed.data;
  const normId = normalizeIdentifier(rawIdentifier);

  const h = await headers();
  const rawXForwarded = h.get('x-forwarded-for');
  const clientIp = rawXForwarded ? rawXForwarded.split(',')[0].trim() : (h.get('x-real-ip') || '127.0.0.1');
  const userAgent = h.get('user-agent') || 'Unknown';

  // 1. Sliding window rate limiting:
  // - Per-IP: 30 attempts per 10 minutes
  const ipLimit = await checkRateLimit(clientIp, 'login', 30, 600);
  if (!ipLimit.allowed) {
    await verifyDummyPassword();
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  // - Per-(Identifier + IP): 5 attempts per 10 minutes
  const ipIdentifierLimit = await checkRateLimit(`${normId}:${clientIp}`, 'login', 5, 600);
  if (!ipIdentifierLimit.allowed) {
    await verifyDummyPassword();
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  // - Per-Identifier: 20 attempts per 15 minutes
  const idLimit = await checkRateLimit(normId, 'login', 20, 900);
  if (!idLimit.allowed) {
    // Require Turnstile captcha when per-identifier threshold is exceeded
    const captchaValid = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!captchaValid) {
      await verifyDummyPassword();
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }
  }

  // 2. Fetch account by national_id or student_code
  const [account] = await appSql`
    SELECT a.id, a.national_id, a.password_hash, a.must_change_password, a.failed_login_count, a.locked_until, a.is_active
    FROM public.academic_accounts a
    LEFT JOIN public.academic_profiles p ON p.id = a.id
    WHERE a.national_id = ${normId} OR p.student_code = ${normId}
  `;

  // Protect against user enumeration & timing attacks: constant-time dummy verification
  if (!account || !account.is_active) {
    await verifyDummyPassword();
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  // Account lockout check (locked for temporary window)
  if (account.locked_until && new Date(account.locked_until).getTime() > Date.now()) {
    await verifyDummyPassword();
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  // Verify password with argon2id
  const isValidPassword = await verifyPassword(password, account.password_hash);

  if (!isValidPassword) {
    // Atomic failure counter & progressive lock:
    // 5+ failures -> 1 minute lock
    // 10+ failures -> 5 minutes lock
    await appSql`
      UPDATE public.academic_accounts
         SET failed_login_count = failed_login_count + 1,
             locked_until = CASE
               WHEN failed_login_count + 1 >= 10 THEN now() + interval '5 minutes'
               WHEN failed_login_count + 1 >= 5 THEN now() + interval '1 minute'
               ELSE NULL
             END
       WHERE id = ${account.id}
    `;

    try {
      await appSql`
        INSERT INTO academic_private.audit_log (actor, action, details)
        VALUES (${account.id}, 'LOGIN_FAILED', ${JSON.stringify({ ip: clientIp, userAgent: userAgent.slice(0, 200) })}::jsonb)
      `;
    } catch {
      // Non-critical audit log failure should not crash response
    }

    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  // Reset failure count & update last_login
  await appSql`
    UPDATE public.academic_accounts
       SET failed_login_count = 0,
           locked_until = NULL,
           last_login_at = now()
     WHERE id = ${account.id}
  `;

  // Create opaque 256-bit session with IP & UA metadata
  const token = await createSession(account.id, { ip: clientIp, userAgent });
  await setSessionCookie(token);

  // Record audit log with masked identifier
  try {
    await appSql`
      INSERT INTO academic_private.audit_log (actor, action, details)
      VALUES (${account.id}, 'LOGIN_SUCCESS', ${JSON.stringify({ identifier: maskIdentifier(normId) })}::jsonb)
    `;
  } catch {
    // Audit failure non-blocking
  }

    return { success: true, mustChangePassword: account.must_change_password };
  } catch (err) {
    console.error('[loginAction error]:', err);
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return { success: false, error: `حدث خطأ: ${msg}` };
  }
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

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'يرجى إدخال كلمة المرور الحالية').max(128),
  newPassword: z.string().min(10, 'كلمة المرور الجديدة يجب أن لا تقل عن 10 أحرف').max(128),
});

export async function changePasswordAction(
  currentPasswordInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: currentPasswordInput,
    newPassword: newPasswordInput,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'البيانات المدخلة غير صالحة' };
  }

  const { currentPassword, newPassword } = parsed.data;
  const student = await requireAuth({ allowMustChangePassword: true });

  // Rate limit: max 5 password change attempts per 15 minutes per account
  const rateLimit = await checkRateLimit(student.accountId, 'password_change', 5, 900);
  if (!rateLimit.allowed) {
    return { success: false, error: 'تم تجاوز الحد المسموح به لتغيير كلمة المرور. يرجى الانتظار 15 دقيقة.' };
  }

  // Validate complexity
  const strength = validatePasswordStrength(newPassword, student.nationalId);
  if (!strength.valid) {
    return { success: false, error: strength.message };
  }

  if (isCommonPassword(newPassword)) {
    return { success: false, error: 'كلمة المرور شائعة وسهلة التخمين. يرجى اختيار كلمة مرور أكثر أماناً.' };
  }

  if (student.profile.studentCode && newPassword.toLowerCase().includes(student.profile.studentCode.toLowerCase())) {
    return { success: false, error: 'لا يمكن تضمين كود الطالب في كلمة المرور.' };
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

  const h = await headers();
  const rawXForwarded = h.get('x-forwarded-for');
  const clientIp = rawXForwarded ? rawXForwarded.split(',')[0].trim() : (h.get('x-real-ip') || '127.0.0.1');
  const userAgent = h.get('user-agent') || 'Unknown';

  const newHash = await hashPassword(newPassword);

  // Single transaction: update hash, rotate session, revoke other sessions, log audit
  await appSql.begin(async (sql) => {
    await sql`
      UPDATE public.academic_accounts
         SET password_hash = ${newHash},
             must_change_password = false,
             password_changed_at = now()
       WHERE id = ${student.accountId}
    `;

    const newToken = await createSession(student.accountId, { ip: clientIp, userAgent });
    await setSessionCookie(newToken);
    await revokeAllAccountSessions(student.accountId, newToken);

    await sql`
      INSERT INTO academic_private.audit_log (actor, action, details)
      VALUES (${student.accountId}, 'PASSWORD_CHANGED', '{}'::jsonb)
    `;
  });

  return { success: true };
}

'use server';

import 'server-only';
import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
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
import {
  checkRateLimit,
  getRateLimitCount,
  recordFailedAttempt,
  resetRateLimit,
} from '@/server/security/rateLimit';
import { normalizeIdentifier, maskIdentifier } from '@/lib/security/normalizeIdentifier';
import { isCommonPassword } from '@/lib/security/commonPasswords';
import { verifyTurnstileToken } from '@/server/security/turnstile';
import { extractClientIp } from '@/server/security/clientIp';
import { env } from '@/lib/env';

const LoginSchema = z.object({
  identifier: z.string().trim().min(3, 'يرجى إدخال الرقم القومي أو الرقم الأكاديمي').max(50),
  password: ***REMOVED*** 'يرجى إدخال كلمة المرور').max(128),
  turnstileToken: ***REMOVED***
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
    const clientIp = extractClientIp(h);
    const userAgent = h.get('user-agent') || 'Unknown';

    // 1. Sliding window rate limiting:
    // (c) Per-IP limiter: count ONLY FAILED attempts (threshold: 100 failed attempts / 10 min)
    const ipFailures = await getRateLimitCount(clientIp, 'login_fail_ip', 600);
    if (ipFailures >= 100) {
      await verifyDummyPassword(password);
      await appSql`SELECT 1`;
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    // (a) Per-(Identifier + IP) limiter: 5 attempts per 10 minutes
    const ipIdentifierFailures = await getRateLimitCount(`${normId}:${clientIp}`, 'login_ip_id', 600);
    if (ipIdentifierFailures >= 5) {
      await verifyDummyPassword(password);
      await appSql`SELECT 1`;
      await recordFailedAttempt(clientIp, 'login_fail_ip', 600);
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    // (b) Account-wide defense against distributed credential stuffing:
    // If >= 10 failed attempts occur from ANY IP within 10 min, require Turnstile captcha token.
    // If Turnstile is not configured in env, fall back to per-(identifier + IP) limiter only.
    const idFailures = await getRateLimitCount(normId, 'login_fail_id', 600);
    if (idFailures >= 10 && env.TURNSTILE_SECRET_KEY) {
      const captchaValid = await verifyTurnstileToken(turnstileToken, clientIp);
      if (!captchaValid) {
        await verifyDummyPassword(password);
        await appSql`SELECT 1`;
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

    // 3. User enumeration & timing attack mitigation:
    // If account not found or inactive, execute dummy verify and match DB write path
    if (!account || !account.is_active) {
      await verifyDummyPassword(password);
      await recordFailedAttempt(clientIp, 'login_fail_ip', 600);
      await recordFailedAttempt(`${normId}:${clientIp}`, 'login_ip_id', 600);
      await recordFailedAttempt(normId, 'login_fail_id', 600);
      try {
        await appSql`
          INSERT INTO academic_private.audit_log (actor, action, details)
          VALUES (NULL, 'LOGIN_FAILED', ${appSql.json({ ip: clientIp, userAgent: userAgent.slice(0, 200) })})
        `;
      } catch {
        // Non-blocking
      }
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    // If account has an explicit admin lockout
    if (account.locked_until && new Date(account.locked_until).getTime() > Date.now()) {
      await verifyDummyPassword(password);
      await appSql`SELECT 1`;
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    // Verify password with argon2id
    const isValidPassword = await verifyPassword(password, account.password_hash);

    if (!isValidPassword) {
      // Record failed attempts in limiters (without locking account globally in academic_accounts)
      await recordFailedAttempt(clientIp, 'login_fail_ip', 600);
      await recordFailedAttempt(`${normId}:${clientIp}`, 'login_ip_id', 600);
      await recordFailedAttempt(normId, 'login_fail_id', 600);

      try {
        await appSql`
          INSERT INTO academic_private.audit_log (actor, action, details)
          VALUES (${account.id}, 'LOGIN_FAILED', ${appSql.json({ ip: clientIp, userAgent: userAgent.slice(0, 200) })})
        `;
      } catch {
        // Non-blocking
      }

      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    // On successful login: reset failed attempt trackers for this student & IP
    await resetRateLimit(`${normId}:${clientIp}`, 'login_ip_id');
    await resetRateLimit(normId, 'login_fail_id');

    // Update last_login
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
        VALUES (${account.id}, 'LOGIN_SUCCESS', ${appSql.json({ identifier: maskIdentifier(normId) })})
      `;
    } catch {
      // Audit failure non-blocking
    }

    return { success: true, mustChangePassword: account.must_change_password };
  } catch (err) {
    console.error('[loginAction error]:', err);
    return { success: false, error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى لاحقاً.' };
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
  currentPassword: ***REMOVED*** 'يرجى إدخال كلمة المرور الحالية').max(128),
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
  const clientIp = extractClientIp(h);
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
      VALUES (${student.accountId}, 'PASSWORD_CHANGED', ${sql.json({})})
    `;
  });

  revalidatePath('/account/change-password');
  revalidatePath('/', 'layout');

  return { success: true };
}

const PublicSupportTicketSchema = z.object({
  identifier: z.string().trim().max(100).optional().default(''),
  issueType: z.string().trim().min(1).max(50),
  message: z.string().trim().min(5, 'تفاصيل المشكلة يجب ألا تقل عن 5 أحرف').max(2000, 'تفاصيل المشكلة يجب ألا تتجاوز 2000 حرف'),
});

const ISSUE_TYPE_LABELS: Record<string, { label: string; category: string }> = {
  login_issue: { label: 'صعوبة في تسجيل الدخول بالرقم القومي', category: 'technical' },
  password_issue: { label: 'نسيان أو فقدان كلمة المرور', category: 'technical' },
  account_inactive: { label: 'الحساب غير مفعل لدى شؤون الطلاب', category: 'academic' },
  technical_bug: { label: 'عطل تقني أو خطأ في المنصة', category: 'technical' },
  other: { label: 'استفسار أو مشكلة أخرى', category: 'inquiry' },
};

export async function submitPublicSupportTicketAction(
  input: unknown
): Promise<{ success: boolean; ticketNo?: string; error?: string }> {
  try {
    const parsed = PublicSupportTicketSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'البيانات المدخلة غير صالحة',
      };
    }

    const { identifier: rawIdentifier, issueType, message } = parsed.data;

    const h = await headers();
    const clientIp = extractClientIp(h);

    // Rate limit: 5 public support tickets per hour per IP (or IP+identifier)
    const rateLimitKey = rawIdentifier ? `${clientIp}:${normalizeIdentifier(rawIdentifier)}` : clientIp;
    const rateLimit = await checkRateLimit(rateLimitKey, 'ticket', 5, 3600);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: 'تم تجاوز الحد الأقصى لإرسال تذاكر الدعم (5 تذاكر في الساعة). يرجى المحاولة لاحقاً.',
      };
    }

    // Try to associate with existing account if identifier is provided
    let matchedAccountId: string | null = null;
    if (rawIdentifier) {
      const normId = normalizeIdentifier(rawIdentifier);
      const [matchedAccount] = await appSql`
        SELECT a.id
        FROM public.academic_accounts a
        LEFT JOIN public.academic_profiles p ON p.id = a.id
        WHERE a.national_id = ${normId} OR p.student_code = ${normId}
        LIMIT 1
      `;
      if (matchedAccount?.id) {
        matchedAccountId = matchedAccount.id;
      }
    }

    const issueInfo = ISSUE_TYPE_LABELS[issueType] || {
      label: 'طلب مساعدة عام',
      category: 'technical',
    };

    const subject = `[دعم تسجيل الدخول] ${issueInfo.label}${rawIdentifier ? ` - ${rawIdentifier}` : ''}`.slice(0, 150);
    const fullMessage = `معرف الطالب/رقم التواصل: ${rawIdentifier || 'غير مسجل'}\nنوع المشكلة: ${issueInfo.label}\n\nنص البلاغ:\n${message}`.slice(0, 2000);

    const [ticket] = await appSql`
      INSERT INTO public.academic_support_tickets (
        student_id, category, subject, message, status, priority
      ) VALUES (
        ${matchedAccountId}, ${issueInfo.category}, ${subject}, ${fullMessage}, 'open', 'medium'
      ) RETURNING ticket_no;
    `;

    return {
      success: true,
      ticketNo: ticket.ticket_no,
    };
  } catch (err) {
    console.error('Failed to submit public support ticket:', err);
    return {
      success: false,
      error: 'حدث خطأ أثناء حفظ البلاغ. يرجى المحاولة لاحقاً أو التواصل عبر واتساب الدعم.',
    };
  }
}


import 'server-only';
import crypto from 'node:crypto';
import { cache } from 'react';
import { appSql } from '@/lib/db/app.server';
import { StudentProfile } from '@/data/student';

export interface AuthenticatedStudent {
  accountId: string;
  nationalId: string;
  mustChangePassword: boolean;
  profile: {
    fullName: string;
    email: string;
    studentCode: string;
    department: string;
    level: string;
    currentGpa: number;
    maxGpa: number;
    avatarUrl: string | null;
  };
  studentProfile: StudentProfile;
}

/**
 * Creates a cryptographically secure opaque session (256-bit random).
 * Stores only the SHA-256 hash in the database.
 */
export async function createSession(
  accountId: string,
  meta?: { ip?: string; userAgent?: string }
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest();

  await appSql`
    INSERT INTO public.academic_sessions (
      account_id,
      token_hash,
      idle_expires_at,
      absolute_expires_at,
      ip,
      user_agent
    ) VALUES (
      ${accountId},
      ${tokenHash},
      now() + interval '30 minutes',
      now() + interval '12 hours',
      ${meta?.ip || null},
      ${meta?.userAgent || null}
    )
  `;

  return token;
}

/**
 * Validates a raw session token against the database with React per-request memoization.
 * Sliding window: extends idle_expires_at by 30 minutes when > 5 minutes have elapsed.
 */
export const validateSession = cache(async (rawToken: string): Promise<AuthenticatedStudent | null> => {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 32) {
    return null;
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest();

  const [row] = await appSql`
    SELECT 
      s.id AS session_id,
      s.account_id,
      s.last_seen_at,
      a.national_id,
      a.must_change_password,
      a.is_active,
      a.locked_until,
      p.full_name,
      p.email,
      p.student_code,
      p.department,
      p.level,
      p.current_gpa,
      p.max_gpa,
      p.avatar_url,
      (SELECT count(*) FROM public.academic_student_codes sc WHERE sc.student_id = p.id AND sc.status = 'active') AS courses_count
    FROM public.academic_sessions s
    JOIN public.academic_accounts a ON a.id = s.account_id
    LEFT JOIN public.academic_profiles p ON p.id = s.account_id
    WHERE s.token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
      AND s.absolute_expires_at > now()
      AND s.idle_expires_at > now()
      AND a.is_active = true
      AND (a.locked_until IS NULL OR a.locked_until < now())
  `;

  if (!row) {
    return null;
  }

  // Sliding idle window update: only write to DB if > 5 minutes elapsed since last update
  // Eliminates blocking write transactions and table locks on frequent page navigations
  const lastSeenMs = row.last_seen_at ? new Date(row.last_seen_at).getTime() : 0;
  if (Date.now() - lastSeenMs > 5 * 60 * 1000) {
    await appSql`
      UPDATE public.academic_sessions
         SET last_seen_at = now(),
             idle_expires_at = LEAST(now() + interval '30 minutes', absolute_expires_at)
       WHERE id = ${row.session_id}
    `;
  }

  const gpa = Number(row.current_gpa) || 3.84;
  let gpaRating = 'امتياز مع مرتبة الشرف';
  if (gpa < 2.0) gpaRating = 'مقبول';
  else if (gpa < 3.0) gpaRating = 'جيد';
  else if (gpa < 3.5) gpaRating = 'جيد جداً';

  const studentProfile: StudentProfile = {
    id: row.account_id,
    fullName: row.full_name || 'طالب أكاديمي',
    academicId: row.student_code || row.national_id,
    department: row.department || 'الذكاء الاصطناعي العام',
    faculty: 'كلية الذكاء الاصطناعي',
    level: row.level || 'المستوى الثالث',
    levelNumber: 3,
    gpa,
    maxGpa: Number(row.max_gpa) || 4.0,
    gpaRating,
    registeredHours: 18,
    coursesCount: Number(row.courses_count) || 6,
    academicYear: '2026/2027',
    semester: 'الفصل الدراسي الأول',
    status: 'منتظم',
  };

  return {
    accountId: row.account_id,
    nationalId: row.national_id,
    mustChangePassword: Boolean(row.must_change_password),
    profile: {
      fullName: row.full_name || 'طالب جامعي',
      email: row.email || '',
      studentCode: row.student_code || '',
      department: row.department || '',
      level: row.level || 'المستوى الثاني',
      currentGpa: Number(row.current_gpa) || 0,
      maxGpa: Number(row.max_gpa) || 4.0,
      avatarUrl: row.avatar_url || null,
    },
    studentProfile,
  };
});

/**
 * Revokes an individual session upon logout.
 */
export async function revokeSession(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest();
  await appSql`
    UPDATE public.academic_sessions
       SET revoked_at = now()
     WHERE token_hash = ${tokenHash}
  `;
}

/**
 * Revokes all active sessions for an account (e.g. upon password change).
 */
export async function revokeAllAccountSessions(accountId: string): Promise<void> {
  await appSql`
    UPDATE public.academic_sessions
       SET revoked_at = now()
     WHERE account_id = ${accountId}
       AND revoked_at IS NULL
  `;
}

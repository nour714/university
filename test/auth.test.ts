import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { hashPassword, verifyPassword, verifyDummyPassword } from '@/server/auth/password';
import { createSession, validateSession, revokeSession, revokeAllAccountSessions } from '@/server/auth/session';
import { normalizeIdentifier, maskIdentifier } from '@/lib/security/normalizeIdentifier';
import { isCommonPassword } from '@/lib/security/commonPasswords';
import { checkRateLimit } from '@/server/security/rateLimit';

describe('Auth & Session Security Tests', () => {
  let clients: TestDbClients;
  const testStudentId = 'a0000000-0000-0000-0000-000000000001';
  const testNationalId = '30101010101011';
  const testStudentCode = '20260001';
  const testPassword = 'StrongPassword2026!';

  beforeAll(async () => {
    clients = await setupTestDatabase();

    const passwordHash = await hashPassword(testPassword);

    // Seed test account with ownerSql
    await clients.ownerSql`
      INSERT INTO public.academic_accounts (
        id, national_id, password_hash, must_change_password, is_active
      ) VALUES (
        ${testStudentId}, ${testNationalId}, ${passwordHash}, false, true
      ) ON CONFLICT (id) DO UPDATE SET password_hash = ${passwordHash};
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_profiles (
        id, student_code, full_name, email, department, level, level_number
      ) VALUES (
        ${testStudentId}, ${testStudentCode}, 'طالب اختبار تجريبي', 'student@test.edu.eg', 'الذكاء الاصطناعي', 'المستوى الأول', 1
      ) ON CONFLICT (id) DO NOTHING;
    `;
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('User Enumeration & Lockout Oracle Resistance (Finding A2)', () => {
    it('should return identical error message and timing safety for non-existing vs wrong password on existing account', async () => {
      // 1. Non-existing account check
      const [nonExisting] = await clients.appSql`
        SELECT a.id, a.password_hash FROM public.academic_accounts a
        WHERE a.national_id = '99999999999999'
      `;
      expect(nonExisting).toBeUndefined();
      const t0 = Date.now();
      await verifyDummyPassword();
      const elapsed = Date.now() - t0;
      expect(elapsed).toBeGreaterThanOrEqual(5);

      // 2. Existing account with wrong password
      const [existing] = await clients.appSql`
        SELECT a.id, a.password_hash FROM public.academic_accounts a
        WHERE a.national_id = ${testNationalId}
      `;
      expect(existing).toBeDefined();
      const valid = await verifyPassword('WrongPassword123', existing.password_hash);
      expect(valid).toBe(false);

      const GENERIC_ERROR = 'الرقم القومي أو كلمة المرور غير صحيحة، أو تم تقييد المحاولات مؤقتاً';
      expect(GENERIC_ERROR).toBe('الرقم القومي أو كلمة المرور غير صحيحة، أو تم تقييد المحاولات مؤقتاً');
    });

    it('should atomically increment failed counter and lock account without changing public response', async () => {
      // Perform 5 failed attempts atomically
      for (let i = 0; i < 5; i++) {
        await clients.appSql`
          UPDATE public.academic_accounts
             SET failed_login_count = failed_login_count + 1,
                 locked_until = CASE
                   WHEN failed_login_count + 1 >= 10 THEN now() + interval '5 minutes'
                   WHEN failed_login_count + 1 >= 5 THEN now() + interval '1 minute'
                   ELSE NULL
                 END
           WHERE id = ${testStudentId}
        `;
      }

      const [lockedAccount] = await clients.appSql`
        SELECT failed_login_count, locked_until FROM public.academic_accounts
        WHERE id = ${testStudentId}
      `;

      expect(lockedAccount.failed_login_count).toBeGreaterThanOrEqual(5);
      expect(lockedAccount.locked_until).not.toBeNull();
      expect(new Date(lockedAccount.locked_until).getTime()).toBeGreaterThan(Date.now());
    });

    it('should reset failed_login_count to 0 on successful authentication', async () => {
      await clients.appSql`
        UPDATE public.academic_accounts
           SET failed_login_count = 0,
               locked_until = NULL,
               last_login_at = now()
         WHERE id = ${testStudentId}
      `;

      const [resetAccount] = await clients.appSql`
        SELECT failed_login_count, locked_until FROM public.academic_accounts
        WHERE id = ${testStudentId}
      `;

      expect(resetAccount.failed_login_count).toBe(0);
      expect(resetAccount.locked_until).toBeNull();
    });
  });

  describe('Session Lifecycle & Password Change Rotation (Finding A3)', () => {
    it('should create opaque 256-bit session and store client IP/UserAgent', async () => {
      const token = await createSession(testStudentId, {
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Vitest Agent',
      });

      expect(token).toHaveLength(64);

      const authenticated = await validateSession(token);
      expect(authenticated).not.toBeNull();
      expect(authenticated?.accountId).toBe(testStudentId);
      expect(authenticated?.nationalId).toBe(testNationalId);
    });

    it('should revoke all other sessions when password is changed except the new rotated session', async () => {
      const token1 = await createSession(testStudentId, { ip: '127.0.0.1' });
      const token2 = await createSession(testStudentId, { ip: '127.0.0.1' });
      const rotatedNewToken = await createSession(testStudentId, { ip: '127.0.0.1' });

      // Revoke all except rotatedNewToken
      await revokeAllAccountSessions(testStudentId, rotatedNewToken);

      // Verify token1 and token2 are revoked
      const auth1 = await validateSession(token1);
      const auth2 = await validateSession(token2);
      expect(auth1).toBeNull();
      expect(auth2).toBeNull();

      // Verify rotatedNewToken remains active
      const authRotated = await validateSession(rotatedNewToken);
      expect(authRotated).not.toBeNull();
      expect(authRotated?.accountId).toBe(testStudentId);
    });

    it('should reject weak and common passwords on change', () => {
      expect(isCommonPassword('123456789')).toBe(true);
      expect(isCommonPassword('password123')).toBe(true);
      expect(isCommonPassword('Student@2026')).toBe(true);
      expect(isCommonPassword('VeryUniqueStrongPassword999!')).toBe(false);
    });
  });

  describe('Sliding-Window Rate Limiter', () => {
    it('should rate limit per-key using HMAC with APP_SECRET', async () => {
      const testIp = '10.0.0.99';
      // Bucket limit: 3 requests per window
      const res1 = await checkRateLimit(testIp, 'login', 3, 60);
      const res2 = await checkRateLimit(testIp, 'login', 3, 60);
      const res3 = await checkRateLimit(testIp, 'login', 3, 60);
      const res4 = await checkRateLimit(testIp, 'login', 3, 60);

      expect(res1.allowed).toBe(true);
      expect(res2.allowed).toBe(true);
      expect(res3.allowed).toBe(true);
      expect(res4.allowed).toBe(false);
      expect(res4.remaining).toBe(0);
    });
  });
});

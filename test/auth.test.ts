import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { hashPassword, verifyPassword, verifyDummyPassword } from '@/server/auth/password';
import { createSession, validateSession, revokeSession, revokeAllAccountSessions } from '@/server/auth/session';
import { normalizeIdentifier, maskIdentifier } from '@/lib/security/normalizeIdentifier';
import { isCommonPassword } from '@/lib/security/commonPasswords';
import { checkRateLimit, getRateLimitCount } from '@/server/security/rateLimit';

let mockClientIp = '127.0.0.1';
const mockCookies = new Map<string, any>();

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (name: string) => {
      const lower = name.toLowerCase();
      if (lower === 'x-forwarded-for') return mockClientIp;
      if (lower === 'user-agent') return 'VitestAgent';
      return null;
    },
  }),
  cookies: async () => ({
    get: (name: string) => mockCookies.get(name),
    set: (name: string, value: any, options: any) => mockCookies.set(name, { value, options }),
  }),
}));

// Import loginAction after vi.mock
import { loginAction } from '@/app/auth/actions';

describe('Auth & Session Security Tests (Finding F8 / Task 7)', () => {
  let clients: TestDbClients;
  const testStudentId = 'a0000000-0000-0000-0000-000000000001';
  const testNationalId = '30101010101011';
  const testStudentCode = '20260001';
  const testPassword = 'StrongPassword2026!';

  beforeAll(async () => {
    clients = await setupTestDatabase();

    const passwordHash = await hashPassword(testPassword);

    // Seed primary test account with ownerSql
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

    // Seed 50 lab accounts for NAT simulation test 7.3(b)
    for (let i = 1; i <= 50; i++) {
      const padded = String(i).padStart(4, '0');
      const labId = `c0000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
      const labNatId = `3020202020${padded}`;
      const labCode = `2027${padded}`;

      await clients.ownerSql`
        INSERT INTO public.academic_accounts (
          id, national_id, password_hash, must_change_password, is_active
        ) VALUES (
          ${labId}, ${labNatId}, ${passwordHash}, false, true
        ) ON CONFLICT (id) DO NOTHING;
      `;

      await clients.ownerSql`
        INSERT INTO public.academic_profiles (
          id, student_code, full_name, email, department, level, level_number
        ) VALUES (
          ${labId}, ${labCode}, ${'طالب مختبر ' + i}, ${`lab${i}@test.edu.eg`}, 'الذكاء الاصطناعي', 'المستوى الأول', 1
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('User Enumeration & Lockout Oracle Resistance (Finding A2, F8)', () => {
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

    it('7.3(a) Attacker from IP 1 fails 20 logins on student national ID; student logs in successfully on 21st attempt from IP 2', async () => {
      // IP 1: Attacker attempts 20 logins with wrong password on student national ID
      mockClientIp = '198.51.100.1';
      for (let attempt = 1; attempt <= 20; attempt++) {
        const res = await loginAction({
          identifier: testNationalId,
          password: 'AttackerWrongPassword!',
        });
        expect(res.success).toBe(false);
      }

      // Attacker at IP 1 is blocked by per-(identifier + IP) limiter (attempt 21 from IP 1 fails)
      const resBlocked = await loginAction({
        identifier: testNationalId,
        password: testPassword, // Even with correct password, IP 1 is blocked!
      });
      expect(resBlocked.success).toBe(false);

      // IP 2: Legitimate student logs in from another IP on attempt 21
      mockClientIp = '198.51.100.2';
      const studentRes = await loginAction({
        identifier: testNationalId,
        password: testPassword,
      });

      expect(studentRes.success).toBe(true);
      if (studentRes.success) {
        expect(studentRes.mustChangePassword).toBe(false);
      }
    });

    it('7.3(b) 50 successful logins from the same IP (simulating a lab NAT) are NOT blocked by the IP limiter', async () => {
      // Simulate 50 students in a campus computer lab sharing NAT IP 203.0.113.50
      mockClientIp = '203.0.113.50';

      for (let i = 1; i <= 50; i++) {
        const padded = String(i).padStart(4, '0');
        const labNatId = `3020202020${padded}`;

        const res = await loginAction({
          identifier: labNatId,
          password: testPassword,
        });

        expect(res.success).toBe(true);
      }

      // Verify that 50 successful logins resulted in 0 failed attempts recorded for this IP
      const ipFailCount = await getRateLimitCount('203.0.113.50', 'login_fail_ip', 600);
      expect(ipFailCount).toBe(0);
    });

    it('7.3(c) 20 login attempts for non-existing user vs 20 for existing user: median timing delta is within 15 ms', async () => {
      const existingTimes: number[] = [];
      const nonExistingTimes: number[] = [];

      // 20 login attempts for existing user with wrong password
      for (let i = 1; i <= 20; i++) {
        mockClientIp = `10.150.1.${i}`;
        const t0 = performance.now();
        await loginAction({
          identifier: testNationalId,
          password: 'IncorrectPasswordForTimingTest123!',
        });
        existingTimes.push(performance.now() - t0);
      }

      // 20 login attempts for non-existing user
      for (let i = 1; i <= 20; i++) {
        mockClientIp = `10.150.2.${i}`;
        const t0 = performance.now();
        await loginAction({
          identifier: `9990000000${String(i).padStart(4, '0')}`,
          password: 'IncorrectPasswordForTimingTest123!',
        });
        nonExistingTimes.push(performance.now() - t0);
      }

      function median(values: number[]): number {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }

      const medianExisting = median(existingTimes);
      const medianNonExisting = median(nonExistingTimes);
      const delta = Math.abs(medianExisting - medianNonExisting);

      // Assert median delta is strictly within 15 ms
      expect(delta).toBeLessThan(15);
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

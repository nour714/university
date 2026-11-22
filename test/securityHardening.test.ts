import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractClientIp } from '@/server/security/clientIp';
import { verifyTurnstileToken } from '@/server/security/turnstile';
import { isSafeExternalUrl } from '@/lib/safeUrl';
import { GET as cronGet } from '@/app/api/cron/finalize/route';
import { env } from '@/lib/env';

// Mock finalizeExpiredSessions to isolate cron authorization logic
vi.mock('@/server/exams/finalize', () => ({
  finalizeExpiredSessions: vi.fn().mockResolvedValue({
    attempted: 0,
    finalizedCount: 0,
    failedCount: 0,
  }),
}));

describe('Security Hardening — OWASP ASVS Enterprise Upgrade Tests', () => {
  const originalEnv = { ...process.env };
  const setNodeEnv = (val: string) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = val;
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('1. Prevent IP Spoofing & Rate-Limit Bypass (clientIp.ts)', () => {
    it('prioritizes x-vercel-forwarded-for over all other headers on Vercel runtime', () => {
      process.env.VERCEL = '1';

      const headers = new Headers({
        'x-vercel-forwarded-for': '203.0.113.195, 10.0.0.1',
        'x-real-ip': '198.51.100.1',
        'cf-connecting-ip': '192.0.2.1',
        'x-forwarded-for': '192.0.2.2',
      });

      expect(extractClientIp(headers)).toBe('203.0.113.195');
    });

    it('rejects client-spoofed cf-connecting-ip and x-forwarded-for on Vercel when vercel headers missing', () => {
      process.env.VERCEL = '1';
      setNodeEnv('production');

      const headers = new Headers({
        'cf-connecting-ip': '192.0.2.1',
        'x-forwarded-for': '192.0.2.2',
      });

      // Must NOT trust spoofed cf-connecting-ip on Vercel; should fall back to 'unknown' in production
      expect(extractClientIp(headers)).toBe('unknown');
    });

    it('falls back to x-real-ip on Vercel when valid and x-vercel-forwarded-for is missing', () => {
      process.env.VERCEL = '1';

      const headers = new Headers({
        'x-real-ip': '198.51.100.1',
        'cf-connecting-ip': '192.0.2.1',
      });

      expect(extractClientIp(headers)).toBe('198.51.100.1');
    });

    it('strictly rejects malformed IPs on all headers', () => {
      process.env.VERCEL = '1';
      setNodeEnv('production');

      const malformedCases = [
        '999.999.999.999',
        'abc',
        '192.168.1.300',
        '1.2.3.4.5',
        '::ffff:999.999.999.999',
        'javascript:alert(1)',
      ];

      for (const badIp of malformedCases) {
        const headers = new Headers({
          'x-vercel-forwarded-for': badIp,
          'x-real-ip': badIp,
        });
        expect(extractClientIp(headers)).toBe('unknown');
      }
    });

    it('outside Vercel, safely parses x-real-ip, cf-connecting-ip, or x-forwarded-for', () => {
      delete process.env.VERCEL;

      const hReal = new Headers({ 'x-real-ip': '198.51.100.10' });
      expect(extractClientIp(hReal)).toBe('198.51.100.10');

      const hCf = new Headers({ 'cf-connecting-ip': '198.51.100.20' });
      expect(extractClientIp(hCf)).toBe('198.51.100.20');

      const hForwarded = new Headers({ 'x-forwarded-for': '198.51.100.30, 10.0.0.1' });
      expect(extractClientIp(hForwarded)).toBe('198.51.100.30');
    });

    it('uses distinct "unknown" token in production fallback and "127.0.0.1" in dev/test', () => {
      delete process.env.VERCEL;

      setNodeEnv('production');
      expect(extractClientIp(new Headers())).toBe('unknown');

      setNodeEnv('development');
      expect(extractClientIp(new Headers())).toBe('127.0.0.1');
    });
  });

  describe('2. Turnstile Fail-Closed & Timeout Protection (turnstile.ts)', () => {
    it('fails closed in production when TURNSTILE_SECRET_KEY is missing and not explicitly disabled', async () => {
      setNodeEnv('production');
      delete process.env.TURNSTILE_SECRET_KEY;
      delete process.env.TURNSTILE_DISABLED;

      const result = await verifyTurnstileToken('sample-token', '198.51.100.1');
      expect(result).toBe(false);
    });

    it('allows bypassing in production only when TURNSTILE_DISABLED is explicitly "true"', async () => {
      setNodeEnv('production');
      delete process.env.TURNSTILE_SECRET_KEY;
      process.env.TURNSTILE_DISABLED = 'true';

      const result = await verifyTurnstileToken('sample-token', '198.51.100.1');
      expect(result).toBe(true);
    });

    it('returns false when Cloudflare siteverify responds with non-200 status', async () => {
      // Simulate configured secret key
      process.env.TURNSTILE_SECRET_KEY = '0x4AAAAAAATestSecretKey';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('Service Unavailable', { status: 503 })
      );

      const result = await verifyTurnstileToken('sample-token', '198.51.100.1');
      expect(result).toBe(false);
    });

    it('returns false when Cloudflare siteverify network error or timeout occurs', async () => {
      process.env.TURNSTILE_SECRET_KEY = '0x4AAAAAAATestSecretKey';

      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new DOMException('The operation was aborted due to timeout', 'TimeoutError')
      );

      const result = await verifyTurnstileToken('sample-token', '198.51.100.1');
      expect(result).toBe(false);
    });
  });

  describe('3. Safe URL Validation & Authenticated Cache Headers (safeUrl.ts & files/download)', () => {
    it('validates internal API paths against strict INTERNAL_PATH_REGEX (blocking //, \\, control chars)', () => {
      // Valid internal paths
      expect(isSafeExternalUrl('/api/files/download?contentId=123')).toBe(true);
      expect(isSafeExternalUrl('/api/courses/intro')).toBe(true);
      expect(isSafeExternalUrl('https://example.com/file.pdf')).toBe(true);

      // Traversal and injection attacks must be blocked
      expect(isSafeExternalUrl('/api//evil.com')).toBe(false);
      expect(isSafeExternalUrl('/api/\\evil.com')).toBe(false);
      expect(isSafeExternalUrl('/api/test\r\nevil')).toBe(false);
      expect(isSafeExternalUrl('/api/test\nevil')).toBe(false);
      expect(isSafeExternalUrl('http://insecure.com/file.pdf')).toBe(false);
      expect(isSafeExternalUrl('https://user:pass@evil.com/file.pdf')).toBe(false);
      expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    });

    it('ensures files/download fallback responses specify private, no-store Cache-Control', async () => {
      const fs = await import('node:fs');
      const downloadRouteSrc = fs.readFileSync('app/api/files/download/route.ts', 'utf-8');

      // Assert no public cache headers exist in the download endpoint
      expect(downloadRouteSrc).not.toContain("'Cache-Control': 'public");
      expect(downloadRouteSrc).not.toContain('"Cache-Control": "public');
      // Assert private, no-store is used for SVG, PDF, and HTML previews
      expect(downloadRouteSrc).toContain("'Cache-Control': 'private, no-store'");
    });
  });

  describe('4. Length-Hiding Timing-Safe Cron Authorization (cron/finalize)', () => {
    it('verifies SHA-256 timing-safe rejection of wrong, short, and long bearer tokens', async () => {
      // 1. Shorter token
      const reqShort = new Request('http://localhost:3000/api/cron/finalize', {
        headers: { authorization: 'Bearer short' },
      });
      const resShort = await cronGet(reqShort);
      expect(resShort.status).toBe(401);

      // 2. Same-length wrong token
      const wrongSameLen = 'x'.repeat(env.CRON_SECRET.length);
      const reqSameLen = new Request('http://localhost:3000/api/cron/finalize', {
        headers: { authorization: `Bearer ${wrongSameLen}` },
      });
      const resSameLen = await cronGet(reqSameLen);
      expect(resSameLen.status).toBe(401);

      // 3. Longer token
      const reqLong = new Request('http://localhost:3000/api/cron/finalize', {
        headers: { authorization: `Bearer ${env.CRON_SECRET}_extra_padding_bytes` },
      });
      const resLong = await cronGet(reqLong);
      expect(resLong.status).toBe(401);

      // 4. Exact valid token
      const reqValid = new Request('http://localhost:3000/api/cron/finalize', {
        headers: { authorization: `Bearer ${env.CRON_SECRET}` },
      });
      const resValid = await cronGet(reqValid);
      expect(resValid.status).toBe(200);
    });
  });
});

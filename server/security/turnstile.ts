import 'server-only';
import { env } from '@/lib/env';
import { logger } from '@/lib/log';

/**
 * Verifies Cloudflare Turnstile token on server-side.
 * In production, fails closed if TURNSTILE_SECRET_KEY is missing unless TURNSTILE_DISABLED === 'true'.
 */
export async function verifyTurnstileToken(token?: string, remoteIp?: string): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === 'production';
  const secretKey = process.env.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET_KEY;
  const isExplicitlyDisabled = process.env.TURNSTILE_DISABLED === 'true' || env.TURNSTILE_DISABLED === 'true';

  if (!secretKey) {
    if (!isProduction || isExplicitlyDisabled) {
      return true;
    }
    logger.warn('[SECURITY WARNING] Turnstile verification failed closed: TURNSTILE_SECRET_KEY is missing in production and TURNSTILE_DISABLED is not set.');
    return false;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp && remoteIp !== 'unknown') {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      logger.warn('[SECURITY WARNING] Turnstile siteverify responded with non-OK HTTP status:', { status: res.status });
      return false;
    }

    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    logger.error('Turnstile verification failed:', err);
    return false;
  }
}

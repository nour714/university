import 'server-only';
import { env } from '@/lib/env';

/**
 * Verifies Cloudflare Turnstile token on server-side.
 * If TURNSTILE_SECRET_KEY is not configured, silently succeeds.
 */
export async function verifyTurnstileToken(token?: string, remoteIp?: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }
  if (!token) {
    return false;
  }
  try {
    const formData = new URLSearchParams();
    formData.append('secret', env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('Turnstile verification failed:', err);
    return false;
  }
}

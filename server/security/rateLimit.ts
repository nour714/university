import 'server-only';
import crypto from 'node:crypto';
import { appSql } from '@/lib/db/app.server';
import { env } from '@/lib/env';

export type RateLimitBucket =
  | 'login'
  | 'login_ip_id'
  | 'login_fail_ip'
  | 'login_fail_id'
  | 'redeem'
  | 'ticket'
  | 'api'
  | 'password_change'
  | 'download';

/**
 * Obscure identifiers and IPs with an HMAC keyed by APP_SECRET.
 */
function hashKey(rawIdentifier: string): string {
  return crypto
    .createHmac('sha256', env.APP_SECRET)
    .update(rawIdentifier)
    .digest('hex');
}

/**
 * Atomic sliding-window rate limiter using Postgres academic_private.rate_limits.
 */
export async function checkRateLimit(
  rawIdentifier: string,
  bucket: RateLimitBucket,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const key = hashKey(rawIdentifier);

    const [row] = await appSql`
      INSERT INTO academic_private.rate_limits (key, bucket, window_start, count)
      VALUES (${key}, ${bucket}, now(), 1)
      ON CONFLICT (key, bucket) DO UPDATE
      SET count = CASE 
            WHEN academic_private.rate_limits.window_start + (${windowSeconds} * interval '1 second') < now() THEN 1
            ELSE academic_private.rate_limits.count + 1
          END,
          window_start = CASE 
            WHEN academic_private.rate_limits.window_start + (${windowSeconds} * interval '1 second') < now() THEN now()
            ELSE academic_private.rate_limits.window_start
          END
      RETURNING count;
    `;

    const currentCount = Number(row?.count || 1);
    const allowed = currentCount <= maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount);

    return { allowed, remaining };
  } catch (err) {
    console.error('[checkRateLimit warning]:', err);
    // Fail-open on transient rate-limiting errors to prevent blocking legitimate students
    return { allowed: true, remaining: maxRequests };
  }
}

/**
 * Inspects current attempt count in the active sliding window without incrementing.
 */
export async function getRateLimitCount(
  rawIdentifier: string,
  bucket: RateLimitBucket,
  windowSeconds: number
): Promise<number> {
  try {
    const key = hashKey(rawIdentifier);

    const [row] = await appSql`
      SELECT count, window_start
      FROM academic_private.rate_limits
      WHERE key = ${key} AND bucket = ${bucket};
    `;

    if (!row) return 0;
    const windowStartMs = new Date(row.window_start).getTime();
    if (Date.now() - windowStartMs > windowSeconds * 1000) {
      return 0; // Expired window
    }
    return Number(row.count || 0);
  } catch (err) {
    console.error('[getRateLimitCount warning]:', err);
    return 0;
  }
}

/**
 * Records a failed attempt in the sliding window.
 */
export async function recordFailedAttempt(
  rawIdentifier: string,
  bucket: RateLimitBucket,
  windowSeconds: number
): Promise<number> {
  try {
    const key = hashKey(rawIdentifier);

    const [row] = await appSql`
      INSERT INTO academic_private.rate_limits (key, bucket, window_start, count)
      VALUES (${key}, ${bucket}, now(), 1)
      ON CONFLICT (key, bucket) DO UPDATE
      SET count = CASE 
            WHEN academic_private.rate_limits.window_start + (${windowSeconds} * interval '1 second') < now() THEN 1
            ELSE academic_private.rate_limits.count + 1
          END,
          window_start = CASE 
            WHEN academic_private.rate_limits.window_start + (${windowSeconds} * interval '1 second') < now() THEN now()
            ELSE academic_private.rate_limits.window_start
          END
      RETURNING count;
    `;
    return Number(row?.count || 1);
  } catch (err) {
    console.error('[recordFailedAttempt warning]:', err);
    return 1;
  }
}

/**
 * Resets rate limit counter for a specific key and bucket (e.g. after successful login).
 */
export async function resetRateLimit(
  rawIdentifier: string,
  bucket: RateLimitBucket
): Promise<void> {
  try {
    const key = hashKey(rawIdentifier);

    await appSql`
      DELETE FROM academic_private.rate_limits
      WHERE key = ${key} AND bucket = ${bucket};
    `;
  } catch (err) {
    console.error('[resetRateLimit warning]:', err);
  }
}

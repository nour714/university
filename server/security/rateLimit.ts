import 'server-only';
import crypto from 'node:crypto';
import { appSql } from '@/lib/db/app.server';
import { env } from '@/lib/env';

export type RateLimitBucket =
  | 'login'
  | 'redeem'
  | 'ticket'
  | 'api'
  | 'password_change'
  | 'download';

/**
 * Atomic sliding-window rate limiter using Postgres academic_private.rate_limits.
 * Obscures identifiers and IPs with an HMAC keyed by APP_SECRET.
 */
export async function checkRateLimit(
  rawIdentifier: string,
  bucket: RateLimitBucket,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = crypto
    .createHmac('sha256', env.APP_SECRET)
    .update(rawIdentifier)
    .digest('hex');

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

  const currentCount = Number(row.count);
  const allowed = currentCount <= maxRequests;
  const remaining = Math.max(0, maxRequests - currentCount);

  return { allowed, remaining };
}

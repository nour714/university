import 'server-only';
import { isIP } from 'node:net';

/**
 * Extracts and sanitizes client IP address from request headers.
 * Prioritizes verified platform edge headers based on runtime environment.
 * On Vercel, x-vercel-forwarded-for is set by the edge infrastructure and cannot be spoofed by clients.
 */
export function extractClientIp(h: Headers): string {
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    // 1. On Vercel: strictly prioritize verified edge headers
    const vercelForwarded = h.get('x-vercel-forwarded-for');
    if (vercelForwarded) {
      const candidate = vercelForwarded.split(',')[0].trim();
      if (isIP(candidate) !== 0) {
        return candidate;
      }
    }

    const realIp = h.get('x-real-ip')?.trim();
    if (realIp && isIP(realIp) !== 0) {
      return realIp;
    }

    // Do NOT trust client-spoofable cf-connecting-ip or arbitrary x-forwarded-for ahead of Vercel headers
  } else {
    // 2. Outside Vercel (standalone / reverse proxy):
    const realIp = h.get('x-real-ip')?.trim();
    if (realIp && isIP(realIp) !== 0) {
      return realIp;
    }

    const cfIp = h.get('cf-connecting-ip')?.trim();
    if (cfIp && isIP(cfIp) !== 0) {
      return cfIp;
    }

    const rawForwarded = h.get('x-forwarded-for');
    if (rawForwarded) {
      const parts = rawForwarded.split(',').map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (isIP(part) !== 0) {
          return part;
        }
      }
    }
  }

  // 3. Fallback: in production, use distinct 'unknown' token to avoid collision with localhost test buckets
  return process.env.NODE_ENV === 'production' ? 'unknown' : '127.0.0.1';
}


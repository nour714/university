import 'server-only';

/**
 * Extracts and sanitizes client IP address from request headers.
 * Prioritizes trusted provider headers (x-real-ip / cf-connecting-ip)
 * over client-controllable x-forwarded-for chains to prevent IP spoofing & rate limit bypasses.
 */
export function extractClientIp(h: Headers): string {
  // 1. Trusted provider edge headers (Vercel, Cloudflare, AWS ALB)
  const realIp = h.get('x-real-ip')?.trim();
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  const cfIp = h.get('cf-connecting-ip')?.trim();
  if (cfIp && isValidIp(cfIp)) {
    return cfIp;
  }

  // 2. x-forwarded-for fallback
  const rawForwarded = h.get('x-forwarded-for');
  if (rawForwarded) {
    const parts = rawForwarded.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0 && isValidIp(parts[0])) {
      return parts[0];
    }
  }

  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  // Basic IPv4 & IPv6 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

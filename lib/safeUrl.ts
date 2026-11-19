const INTERNAL_PATH_REGEX = /^\/(?!\/)[A-Za-z0-9\-_/?=&%.#]*$/;

export function safeInternalPath(u: unknown, fallback = '/courses'): string {
  if (typeof u === 'string' && INTERNAL_PATH_REGEX.test(u)) {
    return u;
  }
  return fallback;
}

export function isSafeExternalUrl(u: unknown): u is string {
  if (typeof u !== 'string' || !u) {
    return false;
  }
  // Allow internal API routes such as secure file download endpoint
  if (u.startsWith('/api/') || INTERNAL_PATH_REGEX.test(u)) {
    return true;
  }
  try {
    const parsed = new URL(u);
    // Protocol must strictly be https:
    if (parsed.protocol !== 'https:') {
      return false;
    }
    // Disallow userinfo (e.g. https://user:pass@evil.com)
    if (parsed.username || parsed.password) {
      return false;
    }
    // Hostname must be valid and non-empty
    if (!parsed.hostname || parsed.hostname.includes(' ') || parsed.hostname.startsWith('.')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

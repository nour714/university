const INTERNAL_PATH_REGEX = /^\/[A-Za-z0-9\-_/?=&%.#]*$/;

export function safeInternalPath(u: unknown, fallback = '/courses'): string {
  if (
    typeof u === 'string' &&
    !u.includes('//') &&
    !u.includes('\\') &&
    !/[\r\n\t\0]/.test(u) &&
    INTERNAL_PATH_REGEX.test(u)
  ) {
    return u;
  }
  return fallback;
}

export function isSafeExternalUrl(u: unknown): u is string {
  if (typeof u !== 'string' || !u) {
    return false;
  }
  // Block protocol-relative slashes, backslashes, and control chars
  if (u.includes('//') && !u.startsWith('https://')) {
    return false;
  }
  if (u.includes('\\') || /[\r\n\t\0]/.test(u)) {
    return false;
  }

  // Allow internal API routes and internal paths
  if (u.startsWith('/api/')) {
    return INTERNAL_PATH_REGEX.test(u);
  }
  if (u.startsWith('/') && INTERNAL_PATH_REGEX.test(u)) {
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

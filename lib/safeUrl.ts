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
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

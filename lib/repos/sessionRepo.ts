// TODO(backend): Session destruction must be performed on the server by invalidating the HTTP-only session cookie/token and revoking active refresh tokens.
export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem('academic_tab_active');
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('academic_') || key.startsWith('exam_'))) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors on cleanup
  }
}

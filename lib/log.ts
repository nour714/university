const SENSITIVE_KEY_REGEX = /password|secret|token|authorization|cookie|pepper|key/i;
const NATIONAL_ID_REGEX = /\b([1-3]\d{13})\b/g;
const CONNECTION_STRING_REGEX = /postgres(ql)?:\/\/[^:]+:[^@]+@[^\s"']+/gi;

export function redactValue(val: unknown): unknown {
  if (typeof val === 'string') {
    let result = val.replace(CONNECTION_STRING_REGEX, 'postgres://[REDACTED_USER]:[REDACTED_PASSWORD]@[HOST]');
    result = result.replace(NATIONAL_ID_REGEX, (_match, id: string) => `${id.slice(0, 4)}••••••${id.slice(-3)}`);
    return result;
  }

  if (Array.isArray(val)) {
    return val.map((item) => redactValue(item));
  }

  if (val !== null && typeof val === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(k)) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = redactValue(v);
      }
    }
    return sanitized;
  }

  return val;
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log(JSON.stringify({
      level: 'info',
      message: redactValue(message),
      context: context ? redactValue(context) : undefined,
      timestamp: new Date().toISOString(),
    }));
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(JSON.stringify({
      level: 'warn',
      message: redactValue(message),
      context: context ? redactValue(context) : undefined,
      timestamp: new Date().toISOString(),
    }));
  },
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: redactValue(error.message) }
      : redactValue(error);

    console.error(JSON.stringify({
      level: 'error',
      message: redactValue(message),
      error: errorDetails,
      context: context ? redactValue(context) : undefined,
      timestamp: new Date().toISOString(),
    }));
  },
};

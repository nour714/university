const SENSITIVE_KEY_REGEX = /password|secret|token|authorization|cookie|pepper|key|credential|session|academic_code|auth|private_key/i;
const NATIONAL_ID_REGEX = /\b([1-3]\d{13})\b/g;
const CONNECTION_STRING_REGEX = /postgres(ql)?:\/\/[^:]+:[^@]+@[^\s"']+/gi;
const BEARER_TOKEN_REGEX = /\bBearer\s+[A-Za-z0-9._~+/-]+=*\b/gi;
const COOKIE_HEADER_REGEX = /\b(__Host-sid|__Host-mcp|academic_mcp|sid)=[A-Za-z0-9._~+/-]+/gi;
const PHONE_NUMBER_REGEX = /\b(01[0125])\d{6}(\d{2})\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

export function redactValue(val: unknown, seen = new WeakSet()): unknown {
  if (typeof val === 'string') {
    let result = val.replace(CONNECTION_STRING_REGEX, 'postgres://[REDACTED_USER]:[REDACTED_PASSWORD]@[HOST]');
    result = result.replace(NATIONAL_ID_REGEX, (_match, id: string) => `${id.slice(0, 4)}••••••${id.slice(-3)}`);
    result = result.replace(BEARER_TOKEN_REGEX, 'Bearer [REDACTED]');
    result = result.replace(COOKIE_HEADER_REGEX, '$1=[REDACTED]');
    result = result.replace(PHONE_NUMBER_REGEX, '$1••••••$2');
    result = result.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
    return result;
  }

  if (Array.isArray(val)) {
    return val.map((item) => redactValue(item, seen));
  }

  if (val !== null && typeof val === 'object') {
    if (seen.has(val as object)) {
      return '[CIRCULAR]';
    }
    seen.add(val as object);

    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(k)) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = redactValue(v, seen);
      }
    }
    return sanitized;
  }

  return val;
}

interface StructuredLogPayload {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: unknown;
  error?: {
    name?: string;
    message?: unknown;
    digest?: string;
    stack?: unknown;
  } | unknown;
  context?: unknown;
  timestamp: string;
  environment: string;
}

async function reportToExternalWebhook(payload: StructuredLogPayload): Promise<void> {
  const webhookUrl = process.env.ERROR_WEBHOOK_URL || process.env.SENTRY_DSN;
  if (!webhookUrl || typeof fetch === 'undefined') return;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
  } catch {
    // Fail silently so external reporting never interrupts the application or CI
  }
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    const payload: StructuredLogPayload = {
      level: 'info',
      message: redactValue(message),
      context: context ? redactValue(context) : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
    console.log(JSON.stringify(payload));
  },

  warn(message: string, context?: Record<string, unknown>) {
    const payload: StructuredLogPayload = {
      level: 'warn',
      message: redactValue(message),
      context: context ? redactValue(context) : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
    console.warn(JSON.stringify(payload));
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const errorDetails = error instanceof Error
      ? {
          name: error.name,
          message: redactValue(error.message),
          digest: (error as Error & { digest?: string }).digest,
          stack: error.stack ? redactValue(error.stack) : undefined,
        }
      : error !== undefined ? redactValue(error) : undefined;

    const payload: StructuredLogPayload = {
      level: 'error',
      message: redactValue(message),
      error: errorDetails,
      context: context ? redactValue(context) : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    console.error(JSON.stringify(payload));

    // Optional fire-and-forget reporting if webhook / Sentry URL is configured
    if (process.env.ERROR_WEBHOOK_URL || process.env.SENTRY_DSN) {
      reportToExternalWebhook(payload).catch(() => {});
    }
  },

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      const payload: StructuredLogPayload = {
        level: 'debug',
        message: redactValue(message),
        context: context ? redactValue(context) : undefined,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      };
      console.debug(JSON.stringify(payload));
    }
  },
};

export const logInfo = logger.info;
export const logWarn = logger.warn;
export const logError = logger.error;

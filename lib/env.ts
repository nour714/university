import 'server-only';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

const EnvSchema = z.object({
  DATABASE_URL_APP: z.string().min(1, 'DATABASE_URL_APP is required'),
  DATABASE_URL_GRADER: z.string().min(1, 'DATABASE_URL_GRADER is required'),
  CODE_PEPPER: z.string().min(32, 'CODE_PEPPER must be at least 32 characters'),
  APP_SECRET: z.string().min(32, 'APP_SECRET must be at least 32 characters'),
  CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters'),

  // Optional Cloudflare R2 / S3
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default('academic-files'),

  // Optional Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  // Database Connection Configuration
  DB_SSL: z
    .enum(['require', 'disable'])
    .default(isProduction ? 'require' : 'disable'),
  DB_POOL_MAX: z.coerce.number().int().positive().default(isProduction ? 2 : 10),

  // Server Actions Configuration
  ALLOWED_ORIGINS: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const missingKeys = Array.from(
      new Set(result.error.issues.map((issue) => issue.path.join('.')))
    ).join(', ');
    const message = `[FATAL] Missing or invalid server environment variables: ${missingKeys}`;
    console.error(message);
    throw new Error(message);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export const env = new Proxy({} as AppEnv, {
  get(_target, prop: string | symbol) {
    if (typeof prop === 'string') {
      return getEnv()[prop as keyof AppEnv];
    }
    return undefined;
  },
});

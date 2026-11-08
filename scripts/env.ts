import { z } from 'zod';

function isLocalhost(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === 'host.docker.internal' ||
      host === 'postgres' ||
      host === 'university-postgres' ||
      host === 'university-postgres-test'
    );
  } catch {
    return false;
  }
}

export function validateScriptDbUrl(name: string, urlStr: string) {
  if (!urlStr) {
    throw new Error(`[SCRIPT ENV ERROR] ${name} is required.`);
  }

  const allowRemote = process.env.ALLOW_REMOTE_DB === '1';
  if (!allowRemote && !isLocalhost(urlStr)) {
    throw new Error(
      `[SECURITY BLOCK] Refusing to run script against non-localhost database (${name}). Set ALLOW_REMOTE_DB=1 explicitly if remote execution is intentional.`
    );
  }
}

const ScriptEnvSchema = z.object({
  DATABASE_URL_OWNER: z.string().min(1, 'DATABASE_URL_OWNER is required for migration/seed scripts'),
  DATABASE_URL_APP: z.string().optional(),
  DATABASE_URL_GRADER: z.string().optional(),
  CODE_PEPPER: z.string().min(32, 'CODE_PEPPER must be at least 32 characters').optional(),
  SEED_DEMO_PASSWORD: z.string().optional(),
  ALLOW_REMOTE_DB: z.string().optional(),
});

export function loadScriptEnv() {
  const result = ScriptEnvSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`[FATAL] Script environment validation failed:\n${errors}`);
  }

  validateScriptDbUrl('DATABASE_URL_OWNER', result.data.DATABASE_URL_OWNER);
  if (result.data.DATABASE_URL_APP) {
    validateScriptDbUrl('DATABASE_URL_APP', result.data.DATABASE_URL_APP);
  }
  if (result.data.DATABASE_URL_GRADER) {
    validateScriptDbUrl('DATABASE_URL_GRADER', result.data.DATABASE_URL_GRADER);
  }

  return result.data;
}

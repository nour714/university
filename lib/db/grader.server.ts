import 'server-only';
import postgres from 'postgres';
import { env } from '@/lib/env';

const globalForDb = globalThis as unknown as {
  graderSql?: postgres.Sql;
};

/**
 * EXCLUSIVE connection pool for exam grading.
 * Connects with `academic_grader` role which has SELECT on `academic_private.exam_keys`.
 * This client MUST ONLY be imported and called inside `server/exams/submit.ts` and `server/exams/finalize.ts`.
 */
export const graderSql =
  globalForDb.graderSql ||
  (globalForDb.graderSql = postgres(env.DATABASE_URL_GRADER, {
    prepare: false, // Required for Supavisor transaction mode
    fetch_types: false, // Prevents pg_catalog type introspection query on connection init
    max: env.DB_POOL_MAX,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: env.DB_SSL === 'require' ? 'require' : false,
  }));

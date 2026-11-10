import 'server-only';
import postgres from 'postgres';
import { getEnv } from '@/lib/env';

const globalForDb = globalThis as unknown as {
  graderSql?: postgres.Sql;
};

/**
 * EXCLUSIVE connection pool for exam grading.
 * Connects with `academic_grader` role which has SELECT on `academic_private.exam_keys`.
 * This client MUST ONLY be imported and called inside `server/exams/submit.ts` and `server/exams/finalize.ts`.
 */
export function getGraderSql(): postgres.Sql {
  if (!globalForDb.graderSql) {
    const env = getEnv();
    globalForDb.graderSql = postgres(env.DATABASE_URL_GRADER, {
      prepare: false, // Required for Supavisor transaction mode
      fetch_types: false, // Prevents pg_catalog type introspection query on connection init
      max: env.DB_POOL_MAX,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: env.DB_SSL === 'require' ? 'require' : false,
    });
  }
  return globalForDb.graderSql;
}

export const graderSql = new Proxy(function () {} as unknown as postgres.Sql, {
  apply(_target, _thisArg, argArray) {
    const client = getGraderSql();
    return Reflect.apply(client as unknown as (...args: unknown[]) => unknown, client, argArray);
  },
  get(_target, prop) {
    const client = getGraderSql();
    const value = Reflect.get(client, prop);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

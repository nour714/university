import 'server-only';
import postgres from 'postgres';
import { getEnv } from '@/lib/env';

const globalForDb = globalThis as unknown as {
  appSql?: postgres.Sql;
};

export function getAppSql(): postgres.Sql {
  if (!globalForDb.appSql) {
    const env = getEnv();
    globalForDb.appSql = postgres(env.DATABASE_URL_APP, {
      prepare: false, // Required for Supavisor transaction mode
      fetch_types: false, // Prevents pg_catalog type introspection query on connection init
      max: env.DB_POOL_MAX,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: env.DB_SSL === 'require' ? 'require' : false,
    });
  }
  return globalForDb.appSql;
}

export const appSql = new Proxy(function () {} as unknown as postgres.Sql, {
  apply(_target, thisArg, argArray) {
    return Reflect.apply(getAppSql() as unknown as (...args: unknown[]) => unknown, thisArg, argArray);
  },
  get(_target, prop) {
    const client = getAppSql();
    const value = Reflect.get(client, prop);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

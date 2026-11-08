import 'server-only';
import postgres from 'postgres';
import { env } from '@/lib/env';

const globalForDb = globalThis as unknown as {
  appSql?: postgres.Sql;
};

export const appSql =
  globalForDb.appSql ||
  (globalForDb.appSql = postgres(env.DATABASE_URL_APP, {
    prepare: false, // Required for Supavisor transaction mode
    fetch_types: false, // Prevents pg_catalog type introspection query on connection init
    max: env.DB_POOL_MAX,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: env.DB_SSL === 'require' ? 'require' : false,
  }));

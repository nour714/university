import 'server-only';
import postgres from 'postgres';

const globalForDb = globalThis as unknown as {
  appSql?: postgres.Sql;
};

const connectionString = process.env.DATABASE_URL_APP;

if (!connectionString) {
  throw new Error('DATABASE_URL_APP environment variable is missing.');
}

export const appSql =
  globalForDb.appSql ||
  postgres(connectionString, {
    prepare: false, // Required for Supavisor transaction mode
    max: 2,         // Kept low for serverless multiplexing
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.appSql = appSql;
}

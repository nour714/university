import 'server-only';
import postgres from 'postgres';

const globalForDb = globalThis as unknown as {
  graderSql?: postgres.Sql;
};

const connectionString = process.env.DATABASE_URL_GRADER;

if (!connectionString) {
  throw new Error('DATABASE_URL_GRADER environment variable is missing.');
}

/**
 * EXCLUSIVE connection pool for exam grading.
 * Connects with `academic_grader` role which has SELECT on `academic_private.exam_keys`.
 * This client MUST ONLY be imported and called inside `server/exams/submit.ts`.
 */
export const graderSql =
  globalForDb.graderSql ||
  (globalForDb.graderSql = postgres(connectionString, {
    prepare: false, // Required for Supavisor transaction mode
    fetch_types: false, // Prevents pg_catalog type introspection query on connection init
    max: 2,         // Kept low for serverless multiplexing
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require',
  }));

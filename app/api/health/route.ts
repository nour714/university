import { NextResponse, connection } from 'next/server';
import { appSql } from '@/lib/db/app.server';

export const maxDuration = 30;

export async function GET() {
  try {
    await connection();
  } catch {
    // When running in standalone test runner outside Next.js request context
  }

  try {
    const queryPromise = appSql`SELECT 1`;
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('Database health check timed out after 2000ms')),
        2000
      );
    });

    try {
      await Promise.race([queryPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }

    return NextResponse.json(
      {
        ok: true,
        timestamp: new Date().toISOString(),
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || 'Database health check failed',
      },
      { status: 503 }
    );
  }
}

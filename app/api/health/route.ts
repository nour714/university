import { NextResponse, connection } from 'next/server';
import { appSql } from '@/lib/db/app.server';
import { logger } from '@/lib/log';

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
        () => reject(new Error('Database health check timed out')),
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
        status: 'ok',
        ok: true,
        timestamp: new Date().toISOString(),
        commit: 'production',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    logger.error('Database health check failed:', err);
    return NextResponse.json(
      {
        status: 'degraded',
        ok: false,
        error: 'Service degraded',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

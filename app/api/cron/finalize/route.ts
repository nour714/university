import { NextResponse, connection } from 'next/server';
import crypto from 'node:crypto';
import { getEnv } from '@/lib/env';
import { finalizeExpiredSessions } from '@/server/exams/finalize';
import { logger } from '@/lib/log';

export const maxDuration = 30;

function verifyToken(authHeader: string, secret: string): boolean {
  const expected = `Bearer ${secret}`;
  const authHash = crypto.createHash('sha256').update(authHeader).digest();
  const expHash = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(authHash, expHash);
}

function verifyCronAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const env = getEnv();
  // Strictly enforce dedicated CRON_SECRET for cron triggers
  if (env.CRON_SECRET && verifyToken(authHeader, env.CRON_SECRET)) {
    return true;
  }
  return false;
}

export async function GET(request: Request) {
  try {
    await connection();
  } catch {
    // When running in standalone test runner outside Next.js request context
  }
  const authHeader = request.headers.get('authorization');

  if (!verifyCronAuth(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await finalizeExpiredSessions(200);

    return NextResponse.json({
      success: true,
      ...summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Cron finalize error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

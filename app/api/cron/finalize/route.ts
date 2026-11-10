import { NextResponse, connection } from 'next/server';
import crypto from 'node:crypto';
import { getEnv } from '@/lib/env';
import { finalizeExpiredSessions } from '@/server/exams/finalize';

export const maxDuration = 30;

function verifyToken(authHeader: string, secret: string): boolean {
  const expected = `Bearer ${secret}`;
  const authBuf = Buffer.from(authHeader);
  const expBuf = Buffer.from(expected);
  if (authBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(authBuf, expBuf);
}

function verifyCronAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const env = getEnv();
  if (env.CRON_SECRET && verifyToken(authHeader, env.CRON_SECRET)) {
    return true;
  }
  if (env.APP_SECRET && verifyToken(authHeader, env.APP_SECRET)) {
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
    console.error('Cron finalize error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

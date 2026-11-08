import { NextResponse, connection } from 'next/server';
import crypto from 'node:crypto';
import { env } from '@/lib/env';
import { finalizeExpiredSessions } from '@/server/exams/finalize';

function verifyCronAuth(authHeader: string | null): boolean {
  if (!env.CRON_SECRET || !authHeader) return false;
  const expected = `Bearer ${env.CRON_SECRET}`;
  const authBuf = Buffer.from(authHeader);
  const expBuf = Buffer.from(expected);
  if (authBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(authBuf, expBuf);
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

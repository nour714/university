import { NextResponse, connection } from 'next/server';
import { appSql } from '@/lib/db/app.server';
import { submitAndGradeExam } from '@/server/exams/submit';

export async function GET(request: Request) {
  await connection();
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let finalizedCount = 0;

    await appSql.begin(async (tx) => {
      // 1. Acquire transaction-level advisory lock to prevent concurrent cron execution
      const [lock] = await tx`SELECT pg_try_advisory_xact_lock(7142026) AS acquired`;
      if (!lock?.acquired) {
        return;
      }

      // 2. Find sessions that expired at least 15 seconds ago and are not yet submitted
      const expiredSessions = await tx`
        SELECT student_id, exam_id
        FROM public.academic_exam_sessions
        WHERE submitted = false
          AND now() > end_at + interval '15 seconds'
        LIMIT 50
      `;

      for (const s of expiredSessions) {
        try {
          await submitAndGradeExam(s.exam_id, s.student_id, undefined, true);
          finalizedCount++;
        } catch (itemErr) {
          console.error(`Failed to auto-finalize session for student ${s.student_id} on exam ${s.exam_id}:`, itemErr);
        }
      }
    });

    return NextResponse.json({
      success: true,
      finalizedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Cron finalize error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

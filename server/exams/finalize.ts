'use server';

import 'server-only';
import { graderSql } from '@/lib/db/grader.server';
import { submitAndGradeExam } from '@/server/exams/submit';
import { GradeResult } from '@/types/exam';

export interface FinalizeSummary {
  attempted: number;
  finalizedCount: number;
  failedCount: number;
}

/**
 * Sweeps unsubmitted sessions that have expired at least 15 seconds ago.
 * - Uses SKIP LOCKED so concurrent cron instances do not collide.
 * - Orders by end_at ASC so oldest expired sessions are processed first.
 * - Filters by finalize_attempts < 5 to prevent poison sessions from starving the queue.
 * - Executes each session in its own independent transaction.
 */
export async function finalizeExpiredSessions(limit = 200): Promise<FinalizeSummary> {
  const expiredSessions = await graderSql`
    SELECT id, student_id, exam_id
    FROM public.academic_exam_sessions
    WHERE submitted = false
      AND now() > end_at + interval '15 seconds'
      AND finalize_attempts < 5
    ORDER BY end_at ASC
    LIMIT ${limit}
    FOR UPDATE SKIP LOCKED
  `;

  let finalizedCount = 0;
  let failedCount = 0;

  for (const s of expiredSessions) {
    try {
      await submitAndGradeExam(s.exam_id, s.student_id, undefined, true);
      finalizedCount++;
    } catch (err) {
      failedCount++;
      console.error(`Failed to auto-finalize session ${s.id} for student ${s.student_id}:`, err);

      try {
        await graderSql`
          UPDATE public.academic_exam_sessions
             SET finalize_attempts = finalize_attempts + 1,
                 updated_at = now()
           WHERE id = ${s.id}
        `;

        await graderSql`
          INSERT INTO academic_private.audit_log (actor, action, details)
          VALUES (
            ${s.student_id},
            'FINALIZE_FAILED',
            ${graderSql.json({
              session_id: s.id,
              exam_id: s.exam_id,
              error: err instanceof Error ? err.message : String(err),
            })}
          )
        `;
      } catch (logErr) {
        console.error('Failed to update finalize_attempts or write audit log:', logErr);
      }
    }
  }

  return {
    attempted: expiredSessions.length,
    finalizedCount,
    failedCount,
  };
}

/**
 * Lazy finalization helper: auto-grades a student's session if time has expired and it remains unsubmitted.
 */
export async function finalizeSessionIfExpired(
  studentAccountId: string,
  examId: string
): Promise<GradeResult | null> {
  const [session] = await graderSql`
    SELECT id, submitted, end_at, now() AS db_now
    FROM public.academic_exam_sessions
    WHERE student_id = ${studentAccountId} AND exam_id = ${examId}
  `;

  if (!session) return null;
  if (session.submitted) return null;

  const dbNow = new Date(session.db_now).getTime();
  const endAt = new Date(session.end_at).getTime();

  if (dbNow > endAt) {
    try {
      return await submitAndGradeExam(examId, studentAccountId, undefined, true);
    } catch (err) {
      console.error('Lazy finalization failed:', err);
      return null;
    }
  }

  return null;
}

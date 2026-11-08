import 'server-only';
import { graderSql } from '@/lib/db/grader.server';
import { GradeResult } from '@/types/exam';

/**
 * EXCLUSIVE grading module.
 * Only this module is allowed to connect to graderSql and read academic_private.exam_keys.
 */
export async function submitAndGradeExam(
  examId: string,
  studentAccountId: string,
  incomingAnswers?: Record<string, string>,
  isAutoSubmitted: boolean = false
): Promise<GradeResult> {
  return await graderSql.begin(async (tx) => {
    // 1. Lock the session row FOR UPDATE
    const [session] = await tx`
      SELECT id, end_at, answers, submitted
      FROM public.academic_exam_sessions
      WHERE student_id = ${studentAccountId} AND exam_id = ${examId}
      FOR UPDATE
    `;

    if (!session) {
      throw new Error('لم يتم العثور على جلسة اختبار نشطة لهذا الطالب.');
    }

    // 2. If already submitted, return existing submission idempotently
    if (session.submitted) {
      const [existing] = await tx`
        SELECT score, total_marks, percentage, passed, correct_count, wrong_count, unanswered_count
        FROM public.academic_exam_submissions
        WHERE student_id = ${studentAccountId} AND exam_id = ${examId}
      `;
      if (existing) {
        return {
          score: Number(existing.score),
          totalMarks: Number(existing.total_marks),
          percentage: Number(existing.percentage),
          passed: Boolean(existing.passed),
          correctCount: existing.correct_count,
          wrongCount: existing.wrong_count,
          unansweredCount: existing.unanswered_count,
          perQuestion: {},
        };
      }
    }

    const now = new Date();
    const endAt = new Date(session.end_at);

    // 3. Save incoming answers only if submitted within valid time
    let effectiveAnswers: Record<string, string> = session.answers || {};
    if (incomingAnswers && now.getTime() <= endAt.getTime() + 10000) { // allow 10s grace period for latency
      effectiveAnswers = { ...effectiveAnswers, ...incomingAnswers };
      await tx`
        UPDATE public.academic_exam_sessions
           SET answers = ${JSON.stringify(effectiveAnswers)}::jsonb,
               updated_at = now()
         WHERE id = ${session.id}
      `;
    }

    // 4. Fetch questions and answer keys from private schema
    const [exam] = await tx`
      SELECT id, title, total_marks, passing_marks, end_date
      FROM public.academic_exams
      WHERE id = ${examId}
    `;

    if (!exam) {
      throw new Error('بيانات الاختبار غير متوفرة.');
    }

    const questionsWithKeys = await tx`
      SELECT 
        q.id AS question_id,
        q.points,
        k.correct_option_id
      FROM public.academic_exam_questions q
      JOIN academic_private.exam_keys k ON k.question_id = q.id
      WHERE q.exam_id = ${examId}
      ORDER BY q.number ASC
    `;

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const perQuestion: Record<string, boolean> = {};

    for (const item of questionsWithKeys) {
      const chosen = effectiveAnswers[item.question_id];
      if (!chosen) {
        unansweredCount++;
        perQuestion[item.question_id] = false;
      } else if (chosen === item.correct_option_id) {
        totalScore += item.points;
        correctCount++;
        perQuestion[item.question_id] = true;
      } else {
        wrongCount++;
        perQuestion[item.question_id] = false;
      }
    }

    const totalMarks = exam.total_marks;
    const percentage = Math.round((totalScore / totalMarks) * 100);
    const passed = totalScore >= exam.passing_marks;

    // 5. Insert final submission record (strictly single attempt)
    await tx`
      INSERT INTO public.academic_exam_submissions (
        student_id,
        exam_id,
        score,
        total_marks,
        percentage,
        passed,
        correct_count,
        wrong_count,
        unanswered_count,
        auto_submitted
      ) VALUES (
        ${studentAccountId},
        ${examId},
        ${totalScore},
        ${totalMarks},
        ${percentage},
        ${passed},
        ${correctCount},
        ${wrongCount},
        ${unansweredCount},
        ${isAutoSubmitted}
      )
      ON CONFLICT (student_id, exam_id) DO NOTHING;
    `;

    // 6. Mark session submitted
    await tx`
      UPDATE public.academic_exam_sessions
         SET submitted = true,
             updated_at = now()
       WHERE id = ${session.id}
    `;

    // 7. Audit log
    await tx`
      INSERT INTO academic_private.audit_log (actor, action, details)
      VALUES (${studentAccountId}, 'EXAM_SUBMITTED', ${JSON.stringify({ exam_id: examId, score: totalScore, passed })}::jsonb)
    `;

    // 8. If exam official window hasn't ended yet, suppress perQuestion details to prevent leak
    const isExamWindowClosed = now.getTime() >= new Date(exam.end_date).getTime();

    return {
      score: totalScore,
      totalMarks,
      percentage,
      passed,
      correctCount,
      wrongCount,
      unansweredCount,
      perQuestion: isExamWindowClosed ? perQuestion : {},
    };
  });
}

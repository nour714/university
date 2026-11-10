import 'server-only';
import { graderSql } from '@/lib/db/grader.server';
import { GradeResult, QuestionResultDetail } from '@/types/exam';
import { AppError } from '@/lib/errors';

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
    // 1. Fetch exam questions metadata to sanitize any incoming answers
    const questionRows = await tx`
      SELECT id, number, points, options
      FROM public.academic_exam_questions
      WHERE exam_id = ${examId}
      ORDER BY number ASC
    `;

    if (!questionRows || questionRows.length === 0) {
      throw new AppError('exam_not_found', 'بيانات الاختبار غير متوفرة أو لم يتم العثور على الأسئلة.');
    }

    // Build lookup of valid questions and valid options
    const validQuestions = new Map<string, Set<string>>();
    for (const q of questionRows) {
      const opts = (Array.isArray(q.options) ? q.options : []) as { id: string }[];
      const optSet = new Set<string>(opts.map((o) => String(o.id)));
      validQuestions.set(q.id, optSet);
    }

    // Sanitize incoming answers: only allow valid question IDs and valid option IDs
    const sanitizedIncoming: Record<string, string> = {};
    if (incomingAnswers && typeof incomingAnswers === 'object') {
      for (const [qId, optId] of Object.entries(incomingAnswers)) {
        const allowedOpts = validQuestions.get(qId);
        if (allowedOpts && typeof optId === 'string' && allowedOpts.has(optId)) {
          sanitizedIncoming[qId] = optId;
        }
      }
    }

    // 2. Lock the session row FOR UPDATE and get authoritative DB now()
    const [session] = await tx`
      SELECT id, end_at, answers, submitted, now() AS db_now
      FROM public.academic_exam_sessions
      WHERE student_id = ${studentAccountId} AND exam_id = ${examId}
      FOR UPDATE
    `;

    if (!session) {
      throw new AppError('session_not_found', 'لم يتم العثور على جلسة اختبار نشطة لهذا الطالب.');
    }

    const [exam] = await tx`
      SELECT id, title, total_marks, passing_marks, end_date
      FROM public.academic_exams
      WHERE id = ${examId}
    `;

    if (!exam) {
      throw new AppError('exam_not_found', 'بيانات الاختبار غير متوفرة.');
    }

    // 3. If already submitted, return existing submission idempotently
    if (session.submitted) {
      const [existing] = await tx`
        SELECT 
          s.score, s.total_marks, s.percentage, s.passed,
          s.correct_count, s.wrong_count, s.unanswered_count,
          s.per_question,
          (now() >= ${exam.end_date}) AS is_revealed
        FROM public.academic_exam_submissions s
        WHERE s.student_id = ${studentAccountId} AND s.exam_id = ${examId}
      `;
      if (existing) {
        return {
          score: Number(existing.score),
          totalMarks: Number(existing.total_marks),
          percentage: Number(existing.percentage),
          passed: Boolean(existing.passed),
          correctCount: Number(existing.correct_count || 0),
          wrongCount: Number(existing.wrong_count || 0),
          unansweredCount: Number(existing.unanswered_count || 0),
          autoSubmitted: Boolean(existing.auto_submitted),
          perQuestion: existing.is_revealed
            ? (existing.per_question || {})
            : null,
        };
      }
    }

    const dbNow = new Date(session.db_now);
    const endAt = new Date(session.end_at);
    // Allow 10 seconds network grace period from DB clock
    const isWithinGracePeriod = dbNow.getTime() <= endAt.getTime() + 10000;

    let effectiveAnswers: Record<string, string> = session.answers || {};
    let autoSubmitFlag = isAutoSubmitted;

    if (isWithinGracePeriod) {
      effectiveAnswers = { ...effectiveAnswers, ...sanitizedIncoming };
      await tx`
        UPDATE public.academic_exam_sessions
           SET answers = ${tx.json(effectiveAnswers)},
               updated_at = now()
         WHERE id = ${session.id}
      `;
    } else {
      // Past deadline: ignore incoming payload and mark as auto-submitted
      autoSubmitFlag = true;
    }

    // 4. Fetch answer keys from private schema
    const questionsWithKeys = await tx`
      SELECT 
        q.id AS question_id,
        q.points,
        k.correct_option_id,
        k.explanation
      FROM public.academic_exam_questions q
      JOIN academic_private.exam_keys k ON k.question_id = q.id
      WHERE q.exam_id = ${examId}
      ORDER BY q.number ASC
    `;

    // Fail closed: if questions count doesn't match keys count, do not silently mis-grade
    if (questionRows.length !== questionsWithKeys.length) {
      throw new AppError(
        'exam_not_configured',
        'الامتحان غير مكتمل الإعداد أو لم يتم إدخال مفتاح الإجابة كاملاً. يرجى مراجعة إدارة الكنترول.'
      );
    }

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const perQuestion: Record<string, QuestionResultDetail> = {};

    for (const item of questionsWithKeys) {
      const chosen = effectiveAnswers[item.question_id] || null;
      const isCorrect = Boolean(chosen && chosen === item.correct_option_id);
      if (!chosen) {
        unansweredCount++;
      } else if (isCorrect) {
        totalScore += item.points;
        correctCount++;
      } else {
        wrongCount++;
      }
      perQuestion[item.question_id] = {
        selectedOptionId: chosen,
        correctOptionId: item.correct_option_id,
        isCorrect,
        points: isCorrect ? item.points : 0,
        explanation: item.explanation || '',
      };
    }

    const totalMarks = exam.total_marks;
    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    const passed = totalScore >= exam.passing_marks;

    // 5. Insert final submission record (including answers and per_question jsonb)
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
        auto_submitted,
        answers,
        per_question
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
        ${autoSubmitFlag},
        ${tx.json(effectiveAnswers)},
        ${tx.json(perQuestion)}
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

    // 7. Audit log (academic_grader has INSERT grant on audit_log from migration 002)
    try {
      await tx`
        INSERT INTO academic_private.audit_log (actor, action, details)
        VALUES (
          ${studentAccountId},
          'EXAM_SUBMITTED',
          ${tx.json({ exam_id: examId, score: totalScore, passed, auto_submitted: autoSubmitFlag })}
        )
      `;
    } catch (auditErr) {
      console.error('Audit log failed inside submitAndGradeExam:', auditErr);
    }

    // 8. Delayed reveal: reveal perQuestion only after the exam official end_date
    const isExamWindowClosed = dbNow.getTime() >= new Date(exam.end_date).getTime();

    return {
      score: totalScore,
      totalMarks,
      percentage,
      passed,
      correctCount,
      wrongCount,
      unansweredCount,
      autoSubmitted: autoSubmitFlag,
      perQuestion: isExamWindowClosed ? perQuestion : null,
    };
  });
}

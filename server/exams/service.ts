'use server';

import 'server-only';
import { cache } from 'react';
import { appSql } from '@/lib/db/app.server';
import { Exam, ListExam, GradeResult } from '@/types/exam';
import { finalizeSessionIfExpired } from '@/server/exams/finalize';

export async function listExams(studentAccountId?: string): Promise<ListExam[]> {
  if (!studentAccountId) return [];

  const rows = await appSql`
    SELECT 
      e.id,
      e.title,
      e.description,
      e.type,
      e.instructions,
      e.duration_minutes,
      e.total_marks,
      e.passing_marks,
      e.start_date,
      e.end_date,
      c.id AS course_id,
      c.code AS course_code,
      c.title AS course_title,
      c.doctor_name,
      c.doctor_title,
      COUNT(q.id) AS questions_count,
      s.score AS submission_score,
      s.total_marks AS submission_total,
      s.passed AS submission_passed,
      s.submitted_at AS submission_time
    FROM public.academic_exams e
    JOIN public.academic_courses c ON c.id = e.course_id
    JOIN public.academic_student_codes sc 
      ON sc.course_id = c.id 
     AND sc.student_id = ${studentAccountId} 
     AND sc.status = 'active'
    LEFT JOIN public.academic_exam_questions q ON q.exam_id = e.id
    LEFT JOIN public.academic_exam_submissions s 
      ON s.exam_id = e.id 
     AND s.student_id = ${studentAccountId}
    GROUP BY e.id, c.id, s.id
    ORDER BY e.start_date ASC
  `;

  return rows.map((r) => {
    let submission = undefined;
    if (r.submission_score !== null) {
      submission = {
        answers: {},
        score: Number(r.submission_score),
        totalMarks: Number(r.submission_total),
        percentage: Math.round((Number(r.submission_score) / Number(r.submission_total)) * 100),
        passed: Boolean(r.submission_passed),
        submittedAt: new Date(r.submission_time).toLocaleDateString('ar-EG'),
      };
    }

    return {
      id: r.id,
      courseCode: r.course_code,
      courseTitle: r.course_title,
      doctorName: r.doctor_name,
      doctorTitle: r.doctor_title || 'عضو هيئة التدريس',
      title: r.title,
      description: r.description || '',
      type: (r.type || 'midterm') as 'midterm' | 'quiz' | 'final' | 'practical',
      questionsCount: Number(r.questions_count) || 0,
      durationMinutes: r.duration_minutes,
      totalMarks: r.total_marks,
      passingMarks: r.passing_marks,
      startDate: new Date(r.start_date).toISOString(),
      endDate: new Date(r.end_date).toISOString(),
      instructions: Array.isArray(r.instructions) && r.instructions.length > 0
        ? r.instructions
        : [
            'الأسئلة والخيارات باللغة الإنجليزية.',
            'يتم حفظ الإجابات تلقائياً على خوادم الكلية.',
            'تسليم الامتحان آلي بمجرد انتهاء الوقت المخصص.',
          ],
      submission,
    };
  });
}

export interface PublicExamWithEnrollment extends Exam {
  isEnrolled: boolean;
}

/**
 * Strips question texts and options to prevent pre-reading before timer start.
 * Returns exam metadata only.
 */
export const getPublicExamById = cache(async (examId: string, studentAccountId?: string): Promise<PublicExamWithEnrollment | null> => {
  const [e] = await appSql`
    SELECT 
      e.id,
      e.course_id,
      e.title,
      e.description,
      e.type,
      e.instructions,
      e.duration_minutes,
      e.total_marks,
      e.passing_marks,
      e.start_date,
      e.end_date,
      c.code AS course_code,
      c.title AS course_title,
      c.doctor_name,
      c.doctor_title,
      s.score AS submission_score,
      s.total_marks AS submission_total,
      s.percentage AS submission_percentage,
      s.passed AS submission_passed,
      s.submitted_at AS submission_time,
      (SELECT count(*)::int FROM public.academic_exam_questions WHERE exam_id = e.id) AS questions_count,
      EXISTS (
        SELECT 1 FROM public.academic_student_codes sc
        WHERE sc.course_id = e.course_id 
          AND sc.student_id = ${studentAccountId || null} 
          AND sc.status = 'active'
      ) AS is_enrolled
    FROM public.academic_exams e
    JOIN public.academic_courses c ON c.id = e.course_id
    LEFT JOIN public.academic_exam_submissions s 
      ON s.exam_id = e.id 
     AND s.student_id = ${studentAccountId || null}
    WHERE e.id = ${examId}
  `;

  if (!e) return null;

  let submission = undefined;
  if (e.submission_score !== null) {
    submission = {
      answers: {},
      score: Number(e.submission_score),
      totalMarks: Number(e.submission_total),
      percentage: Number(e.submission_percentage),
      passed: Boolean(e.submission_passed),
      submittedAt: new Date(e.submission_time).toLocaleDateString('ar-EG'),
    };
  }

  return {
    id: e.id,
    courseCode: e.course_code,
    courseTitle: e.course_title,
    doctorName: e.doctor_name,
    doctorTitle: e.doctor_title || 'عضو هيئة التدريس',
    title: e.title,
    description: e.description || '',
    type: (e.type || 'midterm') as 'midterm' | 'quiz' | 'final' | 'practical',
    questionsCount: Number(e.questions_count) || 0,
    durationMinutes: e.duration_minutes,
    totalMarks: e.total_marks,
    passingMarks: e.passing_marks,
    startDate: new Date(e.start_date).toISOString(),
    endDate: new Date(e.end_date).toISOString(),
    instructions: Array.isArray(e.instructions) && e.instructions.length > 0
      ? e.instructions
      : [
          'Questions and options are rendered in English.',
          'Every selected answer is automatically saved to the college cloud servers.',
          'You can freely navigate between questions and mark any question for review.',
          'The exam will be automatically submitted once the countdown timer expires.',
        ],
    // Finding E1: question texts and options are strictly stripped from public exam metadata.
    // They are ONLY fetched when the session is officially started or resumed.
    questions: [],
    submission,
    isEnrolled: Boolean(e.is_enrolled),
  };
});

/**
 * Atomic Exam Session Startup / Resumption
 * The ONLY authorized endpoint to fetch exam question contents, strictly gated behind:
 * 1. Active course enrollment
 * 2. Exam start_date / end_date window
 * 3. Starting / resuming a database session record
 */
export async function startOrResumeExamSession(examId: string, studentAccountId: string) {
  // 1. Check if student already submitted this exam
  const [submission] = await appSql`
    SELECT id, score, total_marks, percentage, passed, correct_count, wrong_count, unanswered_count, submitted_at
    FROM public.academic_exam_submissions
    WHERE student_id = ${studentAccountId} AND exam_id = ${examId}
  `;

  if (submission) {
    return {
      status: 'submitted' as const,
      submission: {
        score: Number(submission.score),
        totalMarks: Number(submission.total_marks),
        percentage: Number(submission.percentage),
        passed: Boolean(submission.passed),
        correctCount: submission.correct_count,
        wrongCount: submission.wrong_count,
        unansweredCount: submission.unanswered_count,
      },
    };
  }

  // 2. Insert session with DO NOTHING on conflict
  await appSql`
    INSERT INTO public.academic_exam_sessions (student_id, exam_id, end_at)
    SELECT 
      ${studentAccountId},
      e.id,
      LEAST(now() + (e.duration_minutes * interval '1 minute'), e.end_date)
    FROM public.academic_exams e
    WHERE e.id = ${examId}
      AND now() BETWEEN e.start_date AND e.end_date
      AND EXISTS (
        SELECT 1 FROM public.academic_student_codes c
        WHERE c.student_id = ${studentAccountId} AND c.course_id = e.course_id AND c.status = 'active'
      )
    ON CONFLICT (student_id, exam_id) DO NOTHING;
  `;

  // 3. Query existing or newly created session
  const [session] = await appSql`
    SELECT 
      s.id,
      s.end_at,
      s.answers,
      s.submitted,
      EXTRACT(EPOCH FROM now()) * 1000 AS server_now
    FROM public.academic_exam_sessions s
    WHERE s.student_id = ${studentAccountId} AND s.exam_id = ${examId}
  `;

  if (!session) {
    const [exam] = await appSql`SELECT start_date, end_date FROM public.academic_exams WHERE id = ${examId}`;
    if (!exam) return { status: 'error' as const, reason: 'exam_not_found' };

    const now = Date.now();
    if (now < new Date(exam.start_date).getTime()) return { status: 'error' as const, reason: 'exam_not_started' };
    if (now > new Date(exam.end_date).getTime()) return { status: 'error' as const, reason: 'exam_ended' };

    return { status: 'error' as const, reason: 'not_enrolled' };
  }

  const endAtMillis = new Date(session.end_at).getTime();
  const serverNowMillis = Math.round(Number(session.server_now));

  if (session.submitted) {
    return { status: 'submitted' as const };
  }

  // 4. Fetch the real questions for active/expired sessions
  const questionRows = await appSql`
    SELECT 
      id,
      number,
      question_text,
      code_snippet,
      options,
      points
    FROM public.academic_exam_questions
    WHERE exam_id = ${examId}
    ORDER BY number ASC
  `;

  const questions = questionRows.map((q) => ({
    id: q.id,
    number: q.number,
    questionText: q.question_text,
    codeSnippet: q.code_snippet || undefined,
    options: (q.options || []) as { id: string; text: string }[],
    points: q.points,
  }));

  if (serverNowMillis >= endAtMillis) {
    return {
      status: 'expired' as const,
      sessionId: session.id,
      endAt: endAtMillis,
      answers: session.answers || {},
      serverNow: serverNowMillis,
      questions,
    };
  }

  return {
    status: 'active' as const,
    sessionId: session.id,
    endAt: endAtMillis,
    answers: session.answers || {},
    serverNow: serverNowMillis,
    questions,
  };
}

/**
 * Periodically saves current selected answers safely to the database.
 */
export async function saveExamAnswers(
  examId: string,
  studentAccountId: string,
  sanitizedAnswers: Record<string, string>
): Promise<boolean> {
  const [res] = await appSql`
    UPDATE public.academic_exam_sessions
       SET answers = ${appSql.json(sanitizedAnswers)},
           updated_at = now()
     WHERE student_id = ${studentAccountId}
       AND exam_id = ${examId}
       AND NOT submitted
       AND now() <= end_at
    RETURNING id;
  `;

  return Boolean(res?.id);
}

/**
 * Retrieves full exam result for a student with lazy finalization if session expired.
 */
export async function getExamResult(
  examId: string,
  studentAccountId: string
): Promise<GradeResult | null> {
  // Lazy finalization if needed
  await finalizeSessionIfExpired(studentAccountId, examId);

  const [row] = await appSql`
    SELECT 
      s.score,
      s.total_marks,
      s.percentage,
      s.passed,
      s.correct_count,
      s.wrong_count,
      s.unanswered_count,
      s.per_question,
      (now() >= e.end_date) AS is_revealed
    FROM public.academic_exam_submissions s
    JOIN public.academic_exams e ON e.id = s.exam_id
    WHERE s.student_id = ${studentAccountId} AND s.exam_id = ${examId}
  `;

  if (!row) return null;

  return {
    score: Number(row.score),
    totalMarks: Number(row.total_marks),
    percentage: Number(row.percentage),
    passed: Boolean(row.passed),
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    unansweredCount: row.unanswered_count,
    perQuestion: row.is_revealed
      ? ((typeof row.per_question === 'string' ? JSON.parse(row.per_question) : row.per_question) || {})
      : {},
  };
}

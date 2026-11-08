import 'server-only';
import { cache } from 'react';
import { appSql } from '@/lib/db/app.server';
import { Exam, ListExam } from '@/types/exam';

export async function listExams(studentAccountId?: string): Promise<ListExam[]> {
  const rows = await appSql`
    SELECT 
      e.id,
      e.title,
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
    LEFT JOIN public.academic_exam_questions q ON q.exam_id = e.id
    LEFT JOIN public.academic_exam_submissions s ON s.exam_id = e.id AND s.student_id = ${studentAccountId || null}
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
      description: '',
      type: 'midterm' as const,
      questionsCount: Number(r.questions_count) || 6,
      durationMinutes: r.duration_minutes,
      totalMarks: r.total_marks,
      passingMarks: r.passing_marks,
      startDate: new Date(r.start_date).toISOString(),
      endDate: new Date(r.end_date).toISOString(),
      instructions: [
        'الأسئلة والخيارات باللغة الإنجليزية.',
        'يتم حفظ الإجابات تلقائياً على خوادم الكلية.',
        'تسليم الامتحان آلي بمجرد انتهاء الوقت المخصص.',
      ],
      submission,
    };
  });
}

export const getPublicExamById = cache(async (examId: string, studentAccountId?: string): Promise<Exam | null> => {
  const [e] = await appSql`
    SELECT 
      e.id,
      e.title,
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
      s.submitted_at AS submission_time
    FROM public.academic_exams e
    JOIN public.academic_courses c ON c.id = e.course_id
    LEFT JOIN public.academic_exam_submissions s ON s.exam_id = e.id AND s.student_id = ${studentAccountId || null}
    WHERE e.id = ${examId}
  `;

  if (!e) return null;

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
    options: (Array.isArray(q.options) ? q.options : JSON.parse(q.options)) as { id: string; text: string }[],
    points: q.points,
  }));

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
    description: '',
    type: 'midterm',
    questionsCount: questions.length,
    durationMinutes: e.duration_minutes,
    totalMarks: e.total_marks,
    passingMarks: e.passing_marks,
    startDate: new Date(e.start_date).toISOString(),
    endDate: new Date(e.end_date).toISOString(),
    instructions: [
      'Questions and options are rendered in English.',
      'Every selected answer is automatically saved to the college cloud servers.',
      'You can freely navigate between questions and mark any question for review.',
      'The exam will be automatically submitted once the countdown timer expires.',
    ],
    questions,
    submission,
  };
});

/**
 * Atomic Exam Session Startup / Resumption (Recipe 4.2)
 * Uses INSERT ... ON CONFLICT DO NOTHING to strictly preserve started timer.
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
    // Check specific diagnostic reason
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

  if (serverNowMillis >= endAtMillis) {
    return {
      status: 'expired' as const,
      sessionId: session.id,
      endAt: endAtMillis,
      answers: session.answers || {},
      serverNow: serverNowMillis,
    };
  }

  return {
    status: 'active' as const,
    sessionId: session.id,
    endAt: endAtMillis,
    answers: session.answers || {},
    serverNow: serverNowMillis,
  };
}

/**
 * Periodically saves current selected answers safely to the database (Recipe 4.3).
 */
export async function saveExamAnswers(
  examId: string,
  studentAccountId: string,
  sanitizedAnswers: Record<string, string>
): Promise<boolean> {
  const [res] = await appSql`
    UPDATE public.academic_exam_sessions
       SET answers = ${JSON.stringify(sanitizedAnswers)}::jsonb,
           updated_at = now()
     WHERE student_id = ${studentAccountId}
       AND exam_id = ${examId}
       AND NOT submitted
       AND now() <= end_at
    RETURNING id;
  `;

  return Boolean(res?.id);
}

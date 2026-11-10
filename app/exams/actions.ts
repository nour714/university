'use server';

import 'server-only';
import { GradeResult } from '@/types/exam';
import { ExamSubmissionActionSchema, ExamAnswersSchema } from '@/lib/schemas';
import { requireAuth } from '@/server/auth/requireAuth';
import { submitAndGradeExam } from '@/server/exams/submit';
import { startOrResumeExamSession, saveExamAnswers, getExamResult } from '@/server/exams/service';
import { toSafeErrorMessage } from '@/lib/errors';

/**
 * Starts or resumes an exam session securely on the database.
 * Returns authoritative endAt, serverNow, answers, and sanitized questions.
 */
export async function startOrResumeExamSessionAction(examId: string) {
  const student = await requireAuth();
  return await startOrResumeExamSession(examId, student.accountId);
}

/**
 * Periodically saves selected answers to the database session.
 */
export async function saveExamAnswersAction(
  examId: string,
  answers: unknown
): Promise<{ success: boolean; saved?: number; dropped?: number }> {
  const student = await requireAuth();
  const parsed = ExamAnswersSchema.safeParse(answers);
  if (!parsed.success) {
    return { success: false };
  }
  const res = await saveExamAnswers(examId, student.accountId, parsed.data);
  return { success: res.success, saved: res.saved, dropped: res.dropped };
}

/**
 * Server Action for grading exam answers securely.
 * The answer key is kept entirely in academic_private schema and is never returned to the client.
 */
export async function gradeExam(
  examId: string,
  answers: unknown
): Promise<GradeResult | { error: string }> {
  const student = await requireAuth();

  const validation = ExamSubmissionActionSchema.safeParse({ examId, answers });
  if (!validation.success) {
    return { error: 'بيانات الإجابات المدخلة غير صالحة.' };
  }

  const { examId: validExamId, answers: validAnswers } = validation.data;

  try {
    const result = await submitAndGradeExam(validExamId, student.accountId, validAnswers);
    return result;
  } catch (err: unknown) {
    const message = toSafeErrorMessage(err, 'تعذر تسليم الاختبار، يرجى المحاولة مرة أخرى.');
    return { error: message };
  }
}

/**
 * Retrieves student exam results safely with lazy auto-grading of expired sessions.
 */
export async function getExamResultAction(examId: string): Promise<GradeResult | null> {
  const student = await requireAuth();
  return await getExamResult(examId, student.accountId);
}

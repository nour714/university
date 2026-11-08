'use server';

import 'server-only';
import { GradeResult } from '@/types/exam';
import { ExamSubmissionActionSchema, ExamAnswersSchema } from '@/lib/schemas';
import { requireAuth } from '@/server/auth/requireAuth';
import { submitAndGradeExam } from '@/server/exams/submit';
import { startOrResumeExamSession, saveExamAnswers } from '@/server/exams/service';

/**
 * Starts or resumes an exam session securely on the database.
 */
export async function startOrResumeExamSessionAction(examId: string) {
  const student = await requireAuth();
  return await startOrResumeExamSession(examId, student.accountId);
}

/**
 * Periodically saves selected answers to the database session.
 */
export async function saveExamAnswersAction(examId: string, answers: unknown): Promise<{ success: boolean }> {
  const student = await requireAuth();
  const parsed = ExamAnswersSchema.safeParse(answers);
  if (!parsed.success) {
    return { success: false };
  }
  const ok = await saveExamAnswers(examId, student.accountId, parsed.data);
  return { success: ok };
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
    const message = err instanceof Error ? err.message : 'تعذر تسليم الاختبار، يرجى المحاولة مرة أخرى.';
    return { error: message };
  }
}

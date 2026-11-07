'use server';

import { GradeResult } from '@/types/exam';
import { ExamSubmissionActionSchema } from '@/lib/schemas';
import { gradeAnswers } from '@/lib/exams/grading.server';

/**
 * Server Action for grading exam answers securely.
 * The answer key is kept entirely on the server and is never returned to the client.
 */
export async function gradeExam(
  examId: string,
  answers: unknown
): Promise<GradeResult | { error: string }> {
  const validation = ExamSubmissionActionSchema.safeParse({ examId, answers });
  if (!validation.success) {
    return { error: 'بيانات الإجابات المدخلة غير صالحة.' };
  }

  const { examId: validExamId, answers: validAnswers } = validation.data;
  const gradeResult = gradeAnswers(validExamId, validAnswers);

  if (!gradeResult) {
    return { error: 'الاختبار غير موجود أو تعذر احتساب الدرجة.' };
  }

  return gradeResult;
}

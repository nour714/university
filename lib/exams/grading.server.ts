import 'server-only';

import { GradeResult } from '@/types/exam';
import { RAW_EXAMS_DATA } from '@/data/exams';
import { EXAM_KEYS } from '@/data/exam-keys.server';

/**
 * Pure server-side grading function.
 * Matches submitted answers against server-only EXAM_KEYS without exposing keys to clients.
 */
export function gradeAnswers(
  examId: string,
  answers: Record<string, string>
): GradeResult | null {
  const exam = RAW_EXAMS_DATA.find((e) => e.id === examId);
  if (!exam) return null;

  const keys = EXAM_KEYS[examId];
  if (!keys) return null;

  let score = 0;
  const totalMarks = exam.totalMarks;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  const perQuestion: Record<string, boolean> = {};

  for (const q of exam.questions) {
    const key = keys[q.id];
    const userChoice = answers[q.id];

    if (!userChoice) {
      unansweredCount++;
      perQuestion[q.id] = false;
    } else if (key && userChoice === key.correctOptionId) {
      correctCount++;
      score += q.points;
      perQuestion[q.id] = true;
    } else {
      wrongCount++;
      perQuestion[q.id] = false;
    }
  }

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const passed = score >= exam.passingMarks;

  return {
    score,
    totalMarks,
    percentage,
    passed,
    correctCount,
    wrongCount,
    unansweredCount,
    perQuestion,
  };
}

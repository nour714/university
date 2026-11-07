import { ExamStatus } from '@/types/exam';

/**
 * Computes the real-time academic status of an exam based on start/end dates
 * and presence of a completed student submission.
 */
export function getExamStatus(
  exam: {
    startDate: string;
    endDate: string;
    submission?: unknown;
  },
  now: number = Date.now()
): ExamStatus {
  if (exam.submission) {
    return 'completed';
  }

  const start = new Date(exam.startDate).getTime();
  const end = new Date(exam.endDate).getTime();

  if (now < start) {
    return 'upcoming';
  }

  if (now > end) {
    return 'ended';
  }

  return 'live';
}

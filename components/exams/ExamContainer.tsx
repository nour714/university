'use client';

import { useState } from 'react';
import { Exam, GradeResult } from '@/types/exam';
import { ExamSession } from '@/components/exams/ExamSession';
import { ExamResultView } from '@/components/exams/ExamResultView';
import { gradeExam } from '@/app/exams/actions';
import { markSubmitted } from '@/lib/repos/examSessionRepo';

interface ExamContainerProps {
  exam: Exam;
  initialView?: 'session' | 'result';
  initialResult?: GradeResult;
}

export function ExamContainer({ exam, initialView, initialResult }: ExamContainerProps) {
  // If exam was completed previously or explicitly opened as result
  const defaultView = initialView || (exam.submission ? 'result' : 'session');
  const [view, setView] = useState<'session' | 'result'>(defaultView);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(initialResult ?? null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);
  const [submissionTime, setSubmissionTime] = useState<string>(() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  const submitWithRetry = async (
    answersToSubmit: Record<string, string>,
    isAuto: boolean,
    retriesLeft: number
  ): Promise<boolean> => {
    try {
      const res = await gradeExam(exam.id, answersToSubmit);
      if ('error' in res) {
        if (isAuto && retriesLeft > 1) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          return submitWithRetry(answersToSubmit, isAuto, retriesLeft - 1);
        }
        setSubmitError(res.error || 'تعذر تسليم الاختبار، يرجى المحاولة مرة أخرى.');
        return false;
      }

      setGradeResult(res);
      markSubmitted(exam.id);
      setIsAutoSubmitted(isAuto);
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      setSubmissionTime(`${h}:${m}`);
      setSubmitError(null);
      setView('result');
      return true;
    } catch {
      if (isAuto && retriesLeft > 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return submitWithRetry(answersToSubmit, isAuto, retriesLeft - 1);
      }
      setSubmitError('حدث خطأ في الاتصال بالخادم، يرجى إعادة المحاولة.');
      return false;
    }
  };

  const handleFinishExam = async (
    answersToSubmit: Record<string, string>,
    isAuto: boolean = false
  ) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitWithRetry(answersToSubmit, isAuto, isAuto ? 3 : 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'result' && gradeResult) {
    return (
      <div className="w-full min-h-[100dvh] bg-[#f8fafc] text-slate-900 flex flex-col justify-start sm:justify-center items-center p-3 sm:p-6 lg:p-8">
        <ExamResultView
          exam={exam}
          result={gradeResult}
          isAutoSubmitted={isAutoSubmitted}
          submissionTime={submissionTime}
        />
      </div>
    );
  }

  return (
    <ExamSession
      exam={exam}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onFinishExam={handleFinishExam}
    />
  );
}

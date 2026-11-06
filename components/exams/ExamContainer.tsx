'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exam } from '@/types/exam';
import { ExamSession } from '@/components/exams/ExamSession';
import { ExamResultView } from '@/components/exams/ExamResultView';

interface ExamContainerProps {
  exam: Exam;
  initialView?: 'session' | 'result';
}

export function ExamContainer({ exam, initialView }: ExamContainerProps) {
  const router = useRouter();

  // If exam was completed previously or explicitly opened as result
  const defaultView = initialView || (exam.status === 'completed' ? 'result' : 'session');
  const [view, setView] = useState<'session' | 'result'>(defaultView);

  // Student submitted answers
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string>>(
    exam.submission?.answers ?? {}
  );
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);
  const [submissionTime, setSubmissionTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  });

  const handleFinishExam = (
    answers: Record<string, string>,
    timeSpent: number,
    autoSubmitted: boolean = false
  ) => {
    setSubmittedAnswers(answers);
    setTimeSpentSeconds(timeSpent);
    setIsAutoSubmitted(autoSubmitted);
    setSubmissionTime(
      new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );
    setView('result');
  };

  const handleRetake = () => {
    setSubmittedAnswers({});
    setTimeSpentSeconds(0);
    setIsAutoSubmitted(false);
    setView('session');
  };

  if (view === 'result') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-3 sm:p-6 lg:p-8">
        <ExamResultView
          exam={exam}
          answers={submittedAnswers}
          timeSpentSeconds={timeSpentSeconds}
          isAutoSubmitted={isAutoSubmitted}
          submissionTime={submissionTime}
          onRetake={handleRetake}
        />
      </div>
    );
  }

  return (
    <ExamSession
      exam={exam}
      studentName="عبد الرحمن خالد"
      onFinishExam={handleFinishExam}
      onCancel={() => router.push('/exams')}
    />
  );
}


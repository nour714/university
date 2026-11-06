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
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  const handleFinishExam = (
    answers: Record<string, string>,
    timeSpent: number,
    autoSubmitted: boolean = false
  ) => {
    setSubmittedAnswers(answers);
    setTimeSpentSeconds(timeSpent);
    setIsAutoSubmitted(autoSubmitted);
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    setSubmissionTime(`${h}:${m}`);
    setView('result');
  };

  const handleRetake = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`exam_endtime_${exam.id}`);
        localStorage.removeItem(`exam_answers_${exam.id}`);
      } catch {}
    }
    setSubmittedAnswers({});
    setTimeSpentSeconds(0);
    setIsAutoSubmitted(false);
    setView('session');
  };

  if (view === 'result') {
    return (
      <div className="w-full min-h-[100dvh] bg-[#f8fafc] text-slate-900 flex flex-col justify-start sm:justify-center items-center p-3 sm:p-6 lg:p-8">
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


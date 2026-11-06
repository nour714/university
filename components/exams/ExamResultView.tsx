'use client';

import Link from 'next/link';
import { Exam } from '@/types/exam';
import { ArrowLeft, EyeOff, RotateCcw } from 'lucide-react';

interface ExamResultViewProps {
  exam: Exam;
  answers: Record<string, string>;
  timeSpentSeconds?: number;
  isAutoSubmitted?: boolean;
  submissionTime?: string;
  onRetake?: () => void;
}

export function ExamResultView({
  exam,
  answers,
  timeSpentSeconds = 0,
  isAutoSubmitted = false,
  submissionTime,
  onRetake,
}: ExamResultViewProps) {
  // Calculate score and statistics
  let totalScore = 0;
  let correctCount = 0;

  exam.questions.forEach((q) => {
    const studentChoice = answers[q.id];
    if (studentChoice === q.correctOptionId) {
      totalScore += q.points;
      correctCount++;
    }
  });

  // If this exam was pre-recorded in mock data as completed, fallback or override if answers provided
  const finalScore = Object.keys(answers).length > 0 
    ? totalScore 
    : (exam.submission?.score ?? totalScore);

  const percentage = Math.round((finalScore / exam.totalMarks) * 100);

  // Formatted submission time (standard digits e.g. 21:13 or 03:07)
  const formattedSubmissionTime = submissionTime || (() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  })();

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeIn py-2 sm:py-4">
      {/* ========================================================================= */}
      {/* Main Official Exam Submission Summary Card                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
        
        {/* 1. Header (Organized & Harmonious Toolbar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
          
          {/* Right Side in RTL: Exam Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {exam.title}
            </h1>
          </div>

          {/* Left Side in RTL: Organized Action Pills (Unified height & alignment) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            {/* Course Title Pill */}
            <span className="h-9 px-3.5 inline-flex items-center justify-center rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
              {exam.courseTitle}
            </span>

            {/* Model/Form Label Pill */}
            <span className="h-9 px-3 inline-flex items-center justify-center rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs">
              نموذج 1
            </span>

            {/* Back Button */}
            <Link
              href="/exams"
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
            >
              <span>رجوع</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* 2. Four KPI Metric Boxes Grid (Centered & Perfectly Organized) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6 sm:my-7">
          
          {/* Card 1 (Far Right in RTL): الدرجة */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[155px] shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 mb-2">
              الدرجة
            </span>
            <div className="text-4xl sm:text-5xl font-black text-blue-600 font-mono tracking-tight leading-none my-1">
              {finalScore}
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2">
              من {exam.totalMarks}
            </span>
          </div>

          {/* Card 2: النسبة */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[155px] shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 mb-2">
              النسبة
            </span>
            <div className="text-4xl sm:text-5xl font-black text-slate-800 font-mono tracking-tight leading-none my-1">
              {percentage}%
            </div>
            <span className="text-xs font-medium text-transparent select-none mt-2">
              -
            </span>
          </div>

          {/* Card 3: التسليم */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[155px] shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 mb-2">
              التسليم
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-800 font-mono tracking-tight leading-none my-1">
              {formattedSubmissionTime}
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2">
              {isAutoSubmitted ? 'تلقائي عند انتهاء الوقت' : 'بضغطة منك'}
            </span>
          </div>

          {/* Card 4 (Far Left in RTL): إجابات صحيحة */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[155px] shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 mb-2">
              إجابات صحيحة
            </span>
            <div className="text-4xl sm:text-5xl font-black text-slate-800 font-mono tracking-tight leading-none my-1">
              {correctCount}
            </div>
            <span className="text-xs font-medium text-transparent select-none mt-2">
              -
            </span>
          </div>

        </div>

        {/* 3. Bottom Notice Banner (Centered & Harmonious with Accent Border) */}
        <div className="rounded-2xl bg-[#eff5ff] border border-blue-200/70 border-r-4 border-r-blue-600 p-4 sm:p-4.5 flex items-center justify-center gap-2.5 text-blue-700 text-xs sm:text-sm font-bold text-center">
          <EyeOff className="w-4 h-4 text-blue-600 shrink-0" />
          <span>مراجعة الإجابات التفصيلية غير متاحة لهذا الاختبار.</span>
        </div>

      </div>

      {/* Subtle bottom retake option */}
      {onRetake && (
        <div className="flex justify-center mt-5">
          <button
            type="button"
            onClick={onRetake}
            className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/80"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة خوض الامتحان للتجربة الذاتية</span>
          </button>
        </div>
      )}
    </div>
  );
}

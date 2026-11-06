'use client';

import Link from 'next/link';
import { Exam } from '@/types/exam';
import { ArrowRight, EyeOff } from 'lucide-react';

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
        
        {/* 1. Header (#1A3073 Navy Theme Banner) */}
        <div className="bg-[#1A3073] text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Right Side in RTL: White Animated Back Button + Exam Title */}
          <div className="flex items-center gap-3 min-w-0 relative z-10 flex-wrap sm:flex-nowrap">
            {/* White Animated Back Button on the Right */}
            <Link
              href="/exams"
              className="group relative h-9 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-blue-700 text-xs font-extrabold transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:scale-[1.04] active:scale-95 cursor-pointer shrink-0 border border-slate-200/80 overflow-hidden"
              title="العودة إلى لوحة الاختبارات"
            >
              {/* Subtle hover light sweep effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none" />

              {/* Arrow on the Right with hover nudge animation */}
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              
              <span>رجوع</span>
            </Link>

            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight leading-snug">
              {exam.title}
            </h1>
          </div>

          {/* Left Side in RTL: Course Title & Model Pills */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap relative z-10">
            {/* Course Title Pill */}
            <span className="h-9 px-3.5 inline-flex items-center justify-center rounded-xl text-xs font-bold bg-white/15 text-white border border-white/20 shadow-xs backdrop-blur-xs">
              {exam.courseTitle}
            </span>

            {/* Model/Form Label Pill */}
            <span className="h-9 px-3 inline-flex items-center justify-center rounded-xl text-xs font-bold bg-white/10 text-blue-100 border border-white/15">
              نموذج 1
            </span>
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
    </div>
  );
}

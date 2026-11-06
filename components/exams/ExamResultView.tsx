'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Exam } from '@/types/exam';
import { 
  ArrowLeft, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  RotateCcw
} from 'lucide-react';

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
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  // Calculate score and statistics
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  exam.questions.forEach((q) => {
    const studentChoice = answers[q.id];
    if (!studentChoice) {
      unansweredCount++;
    } else if (studentChoice === q.correctOptionId) {
      totalScore += q.points;
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  // If this exam was pre-recorded in mock data as completed, fallback or override if answers provided
  const finalScore = Object.keys(answers).length > 0 
    ? totalScore 
    : (exam.submission?.score ?? totalScore);

  const percentage = Math.round((finalScore / exam.totalMarks) * 100);

  // Display time (formatted as HH:mm)
  const formattedSubmissionTime = submissionTime || new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-fadeIn pb-12 pt-1 sm:pt-4">
      {/* ========================================================================= */}
      {/* Main Official Exam Submission Summary Card                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-xs">
        
        {/* 1. Card Top Bar Header */}
        <div className="flex items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-slate-100 flex-wrap">
          
          {/* Exam Title (Right side in RTL) */}
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
            {exam.title}
          </h1>

          {/* Left side in RTL: Badges and Back Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Course Title Badge */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4ff] text-blue-600 border border-blue-100">
              {exam.courseTitle}
            </span>

            {/* Model/Form indicator */}
            <span className="text-xs font-medium text-slate-600 px-2 py-0.5">
              نموذج 1
            </span>

            {/* Back Button */}
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
            >
              <span>رجوع</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>

        {/* 2. Four KPI Metric Boxes Grid (Matching User Screenshot 100% in RTL) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-5 sm:my-6">
          
          {/* Box 1 (Far Right in RTL): الدرجة */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between items-center text-center shadow-2xs min-h-[115px] sm:min-h-[125px]">
            <span className="text-xs font-medium text-slate-400">
              الدرجة
            </span>
            <div className="my-auto py-1">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 font-mono tracking-tight">
                {finalScore}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              من {exam.totalMarks}
            </span>
          </div>

          {/* Box 2: النسبة */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between items-center text-center shadow-2xs min-h-[115px] sm:min-h-[125px]">
            <span className="text-xs font-medium text-slate-400">
              النسبة
            </span>
            <div className="my-auto py-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                {percentage}%
              </span>
            </div>
            <span className="text-xs font-semibold text-transparent select-none">
              -
            </span>
          </div>

          {/* Box 3: التسليم */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between items-center text-center shadow-2xs min-h-[115px] sm:min-h-[125px]">
            <span className="text-xs font-medium text-slate-400">
              التسليم
            </span>
            <div className="my-auto py-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {formattedSubmissionTime}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {isAutoSubmitted ? 'تلقائي عند انتهاء الوقت' : 'بضغطة منك'}
            </span>
          </div>

          {/* Box 4 (Far Left in RTL): إجابات صحيحة */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between items-center text-center shadow-2xs min-h-[115px] sm:min-h-[125px]">
            <span className="text-xs font-medium text-slate-400">
              إجابات صحيحة
            </span>
            <div className="my-auto py-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                {correctCount}
              </span>
            </div>
            <span className="text-xs font-semibold text-transparent select-none">
              -
            </span>
          </div>

        </div>

        {/* 3. Bottom Notice Banner (Matching User Screenshot with Blue Right Accent Line) */}
        <div className="rounded-xl bg-[#edf4ff] border border-blue-200/60 border-r-4 border-r-blue-600 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-blue-700 text-xs sm:text-sm font-bold">
            <EyeOff className="w-4 h-4 text-blue-600 shrink-0" />
            <span>مراجعة الإجابات التفصيلية غير متاحة لهذا الاختبار.</span>
          </div>

          {/* Sub-actions */}
          <div className="flex items-center gap-2">
            {onRetake && (
              <button
                type="button"
                onClick={onRetake}
                className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-100/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة التجربة</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDetailedReview(!showDetailedReview)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-100/70 transition-colors cursor-pointer"
            >
              <span>{showDetailedReview ? 'إخفاء المراجعة' : 'عرض نموذج الأسئلة'}</span>
              {showDetailedReview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* Detailed Questions Review (Collapsible Section)                            */}
      {/* ========================================================================= */}
      {showDetailedReview && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>مراجعة الأسئلة والإجابات النموذجية مع الشرح الأكاديمي</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {exam.questions.length} أسئلة
            </span>
          </div>

          <div className="space-y-4">
            {exam.questions.map((question, index) => {
              const studentSelected = answers[question.id];
              const isCorrect = studentSelected === question.correctOptionId;
              const isUnanswered = !studentSelected;

              return (
                <div
                  key={question.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border shadow-2xs transition-all ${
                    isCorrect
                      ? 'border-emerald-200'
                      : isUnanswered
                      ? 'border-amber-200'
                      : 'border-rose-200'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        isCorrect 
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUnanswered
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {index + 1}
                      </span>

                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isCorrect 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isUnanswered
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isCorrect ? 'إجابة صحيحة' : isUnanswered ? 'لم يتم الحل' : 'إجابة خاطئة'}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {question.points} درجات
                    </span>
                  </div>

                  {/* Question Body */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4">
                    {question.questionText}
                  </h3>

                  {/* Code snippet */}
                  {question.codeSnippet && (
                    <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs sm:text-sm font-mono dir-ltr text-left overflow-x-auto mb-4 border border-slate-800">
                      <pre><code>{question.codeSnippet}</code></pre>
                    </div>
                  )}

                  {/* Options List */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((opt) => {
                      const isOptionCorrect = opt.id === question.correctOptionId;
                      const isOptionSelected = opt.id === studentSelected;

                      let optionStyle = 'border-slate-200 bg-slate-50 text-slate-700';
                      let iconNode = null;

                      if (isOptionCorrect) {
                        optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                        iconNode = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
                      } else if (isOptionSelected && !isCorrect) {
                        optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-400';
                        iconNode = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm transition-colors ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isOptionCorrect
                                ? 'bg-emerald-600 text-white'
                                : isOptionSelected
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {opt.id.slice(-1).toUpperCase()}
                            </span>
                            <span className="leading-snug">{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isOptionSelected && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 shadow-2xs">
                                اختيارك
                              </span>
                            )}
                            {iconNode}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {question.explanation && (
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-blue-900 block mb-0.5">التفسير الأكاديمي:</strong>
                        <span>{question.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

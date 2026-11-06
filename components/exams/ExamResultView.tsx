'use client';

import Link from 'next/link';
import { Exam } from '@/types/exam';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Award, 
  HelpCircle, 
  Clock, 
  FileText, 
  RotateCcw,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

interface ExamResultViewProps {
  exam: Exam;
  answers: Record<string, string>;
  timeSpentSeconds?: number;
  onRetake?: () => void;
}

export function ExamResultView({
  exam,
  answers,
  timeSpentSeconds = 0,
  onRetake,
}: ExamResultViewProps) {
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
  const isPassed = finalScore >= exam.passingMarks;

  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const secondsSpent = timeSpentSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>العودة إلى قائمة الاختبارات</span>
        </Link>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          تقرير التقييم الأكاديمي المعتمد
        </span>
      </div>

      {/* 2. Primary Score Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border ${
        isPassed 
          ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 border-emerald-600/30' 
          : 'bg-gradient-to-br from-rose-700 via-red-800 to-slate-900 border-rose-600/30'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              <span>{isPassed ? 'تم اجتياز الاختبار بنجاح' : 'لم يتم تحقيق درجة الاجتياز'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {exam.title}
            </h1>

            <p className="text-sm text-slate-200 max-w-xl">
              {exam.courseTitle} ({exam.courseCode}) • {exam.doctorName}
            </p>
          </div>

          {/* Big Score Display */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                {finalScore}
                <span className="text-xl sm:text-2xl font-medium opacity-80">/{exam.totalMarks}</span>
              </div>
              <div className="text-xs font-bold text-slate-200 mt-1">
                النسبة المئوية: {percentage}%
              </div>
            </div>
            
            <div className="h-12 w-px bg-white/20" />

            <div className="text-xs space-y-1 text-slate-200 font-semibold">
              <div>درجة النجاح: {exam.passingMarks}</div>
              <div className="text-emerald-300 font-bold">
                {percentage >= 85 ? 'تقدير: امتياز ★' : percentage >= 75 ? 'تقدير: جيد جداً' : percentage >= 60 ? 'تقدير: جيد' : 'يحتاج مراجعة'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{exam.questions.length}</div>
            <div className="text-slate-200">إجمالي الأسئلة</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-emerald-300">+{correctCount}</div>
            <div className="text-slate-200">إجابات صحيحة</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-rose-300">-{incorrectCount}</div>
            <div className="text-slate-200">إجابات خاطئة</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-amber-300">
              {timeSpentSeconds > 0 ? `${minutesSpent}د ${secondsSpent}ث` : `${exam.durationMinutes} دقيقة`}
            </div>
            <div className="text-slate-200">الوقت المستغرق</div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Question Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>مراجعة الأسئلة والإجابات النموذجية مع الشرح</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            توضيح أستاذ المادة
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
                className={`bg-white rounded-2xl p-5 sm:p-6 border shadow-sm transition-all ${
                  isCorrect
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : isUnanswered
                    ? 'border-amber-200 hover:border-amber-300'
                    : 'border-rose-200 hover:border-rose-300'
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
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-4">
                  {question.questionText}
                </h3>

                {/* Optional Code Snippet */}
                {question.codeSnippet && (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs sm:text-sm font-mono dir-ltr text-left overflow-x-auto mb-4 border border-slate-800">
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
                      iconNode = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
                    } else if (isOptionSelected && !isCorrect) {
                      optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-400';
                      iconNode = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition-colors ${optionStyle}`}
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
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 shadow-xs">
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
                      <strong className="font-bold text-blue-900 block mb-0.5">التفسير الأكاديمي النموذجي:</strong>
                      <span>{question.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <Link
          href="/exams"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-colors"
        >
          <span>العودة إلى لوحة الاختبارات الرئيسية</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة التجربة للمراجعة الذاتية</span>
          </button>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Exam, GradeResult, ExamReviewData } from '@/types/exam';
import { getGradeLabel } from '@/lib/exams/grade';
import { getExamReviewAction } from '@/app/exams/actions';
import { isLatinText } from '@/lib/normalizeArabic';
import { 
  ArrowRight, 
  ClipboardCheck, 
  FileText, 
  ChevronDown, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Check, 
  X, 
  HelpCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ExamResultViewProps {
  exam: Exam;
  result: GradeResult;
  isAutoSubmitted?: boolean;
  submissionTime?: string;
  initialReview?: ExamReviewData;
}

export function ExamResultView({
  exam,
  result,
  isAutoSubmitted = false,
  submissionTime,
  initialReview,
}: ExamResultViewProps) {
  const finalScore = result.score;
  const percentage = result.percentage;
  const correctCount = result.correctCount;
  const gradeInfo = getGradeLabel(percentage);

  // Review state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<ExamReviewData | null>(initialReview ?? null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Filter tabs for post-deadline review: 'all' | 'correct' | 'wrong'
  const [filterTab, setFilterTab] = useState<'all' | 'correct' | 'wrong'>('all');

  // Formatted submission time (standard digits e.g. 21:13 or 03:07)
  const formattedSubmissionTime = submissionTime || (() => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  })();

  const handleToggleReview = async () => {
    if (!isReviewOpen) {
      if (!reviewData && !isLoadingReview) {
        setIsLoadingReview(true);
        setReviewError(null);
        try {
          const res = await getExamReviewAction(exam.id);
          if ('error' in res) {
            setReviewError(res.error || 'تعذر تحميل مراجعة الإجابات.');
          } else {
            setReviewData(res);
          }
        } catch {
          setReviewError('حدث خطأ في الاتصال أثناء تحميل مراجعة الإجابات.');
        } finally {
          setIsLoadingReview(false);
        }
      }
      setIsReviewOpen(true);
    } else {
      setIsReviewOpen(false);
    }
  };

  // Format end date for Arabic info banner
  const formatExamEndDate = (dateStr?: string) => {
    const raw = dateStr || exam.endDate;
    if (!raw) return '';
    try {
      const d = new Date(raw);
      return d.toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return raw;
    }
  };

  // Calculated counts for post-deadline filter tabs (where correct + wrong === total)
  const totalQuestions = reviewData?.questions.length ?? (exam.questionsCount || exam.questions.length);
  const correctQuestionsCount = reviewData?.questions.filter((q) => q.isCorrect).length ?? correctCount;
  const wrongQuestionsCount = totalQuestions - correctQuestionsCount;

  // Questions filtered by active tab
  const displayedQuestions = (reviewData?.questions || []).filter((q) => {
    if (filterTab === 'correct') return q.isCorrect;
    if (filterTab === 'wrong') return !q.isCorrect;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeIn py-2 sm:py-4">
      {/* ========================================================================= */}
      {/* Main Official Exam Submission Summary Card                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-xs">
        
        {/* 1. Header (#1A3073 Navy Theme Banner) */}
        <div className="bg-[#1A3073] text-white rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Right Side in RTL: White Animated Back Button + Exam Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 relative z-10 flex-wrap sm:flex-nowrap">
            <Link
              href="/exams"
              className="group relative h-9 px-3.5 sm:px-4 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-blue-700 text-xs font-extrabold transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:scale-[1.04] active:scale-95 cursor-pointer shrink-0 border border-slate-200/80 overflow-hidden"
              title="العودة إلى لوحة الاختبارات"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              <span>رجوع</span>
            </Link>

            <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-white tracking-tight leading-snug">
              {exam.title}
            </h1>
          </div>

          {/* Left Side in RTL: Course Title & Model Pills */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap relative z-10">
            <span className="h-8 sm:h-9 px-3 sm:px-3.5 inline-flex items-center justify-center rounded-xl text-[11px] sm:text-xs font-bold bg-white/15 text-white border border-white/20 shadow-xs backdrop-blur-xs">
              {exam.courseTitle}
            </span>

            <span className="h-8 sm:h-9 px-2.5 sm:px-3 inline-flex items-center justify-center rounded-xl text-[11px] sm:text-xs font-bold bg-white/10 text-blue-100 border border-white/15">
              نموذج 1
            </span>
          </div>
        </div>

        {/* 2. Four KPI Metric Boxes Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 my-5 sm:my-7">
          
          {/* Card 1: الدرجة */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 flex flex-col items-center justify-center text-center min-h-[125px] sm:min-h-[155px] shadow-2xs">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 mb-1.5 sm:mb-2">
              الدرجة المحققة
            </span>
            <div className="text-3xl sm:text-5xl font-black text-blue-600 font-mono tracking-tight leading-none my-1">
              {finalScore}
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 mt-1.5 sm:mt-2">
              من {exam.totalMarks} درجة
            </span>
          </div>

          {/* Card 2: النسبة المئوية والتقدير بدقة */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 flex flex-col items-center justify-center text-center min-h-[125px] sm:min-h-[155px] shadow-2xs">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 mb-1.5 sm:mb-2">
              النسبة المئوية
            </span>
            <div className="text-3xl sm:text-5xl font-black text-slate-800 font-mono tracking-tight leading-none my-1">
              {percentage}%
            </div>
            <span className={`text-[11px] sm:text-xs font-bold mt-1.5 sm:mt-2 ${gradeInfo.colorClass}`}>
              {gradeInfo.label}
            </span>
          </div>

          {/* Card 3: التسليم */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 flex flex-col items-center justify-center text-center min-h-[125px] sm:min-h-[155px] shadow-2xs">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 mb-1.5 sm:mb-2">
              وقت التسليم
            </span>
            <div className="text-2xl sm:text-4xl font-black text-slate-800 font-mono tracking-tight leading-none my-1">
              {formattedSubmissionTime}
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-600 mt-1.5 sm:mt-2 truncate max-w-full">
              {isAutoSubmitted ? 'تسليم تلقائي' : 'تسليم يدوي'}
            </span>
          </div>

          {/* Card 4: إجابات صحيحة */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 flex flex-col items-center justify-center text-center min-h-[125px] sm:min-h-[155px] shadow-2xs">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 mb-1.5 sm:mb-2">
              إجابات صحيحة
            </span>
            <div className="text-3xl sm:text-5xl font-black text-slate-800 font-mono tracking-tight leading-none my-1">
              {correctCount}
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 mt-1.5 sm:mt-2">
              من {exam.questionsCount || exam.questions.length} أسئلة
            </span>
          </div>

        </div>

        {/* 3. Action Buttons Section (Interactive Review Button & Return to Dashboard) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleToggleReview}
            aria-expanded={isReviewOpen}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isReviewOpen ? 'إخفاء مراجعة الإجابات' : 'مراجعة الإجابات'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isReviewOpen ? 'rotate-180' : ''}`} />
          </button>

          <Link
            href="/exams"
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>العودة إلى جدول الاختبارات</span>
          </Link>
        </div>

        {/* 4. Interactive Answer Review Panel */}
        {isReviewOpen && (
          <div className="mt-8 pt-6 border-t border-slate-200 animate-fadeIn">
            
            {/* Loading state */}
            {isLoadingReview && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                <span className="text-xs sm:text-sm font-semibold">جاري تحميل مراجعة الإجابات...</span>
              </div>
            )}

            {/* Error state */}
            {reviewError && !isLoadingReview && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center text-rose-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            {/* Review content */}
            {reviewData && !isLoadingReview && (
              <div>
                {/* 4A. Before Deadline (now < exam.endTime): Info Notice Banner */}
                {!reviewData.canRevealCorrectAnswers && (
                  <div className="rounded-2xl bg-blue-50 border border-blue-200/80 p-4 sm:p-5 flex items-start sm:items-center gap-3 text-blue-900 text-xs sm:text-sm mb-6">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="leading-relaxed">
                      يمكنك مراجعة إجاباتك المسجّلة أدناه؛ ستظهر الإجابات الصحيحة والتصحيح التفصيلي تلقائياً بعد انتهاء موعد الاختبار في{' '}
                      <span className="font-bold underline decoration-blue-400">
                        {formatExamEndDate(reviewData.endDate)}
                      </span>.
                    </p>
                  </div>
                )}

                {/* 4B. After Deadline (now >= exam.endTime): Filter Tabs (الكل / الإجابات الصحيحة / الأخطاء فقط) */}
                {reviewData.canRevealCorrectAnswers && (
                  <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`flex-1 min-w-[100px] py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        filterTab === 'all'
                          ? 'bg-[#1A3073] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>الكل</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        filterTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {totalQuestions}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterTab('correct')}
                      className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        filterTab === 'correct'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>الإجابات الصحيحة</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        filterTab === 'correct' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {correctQuestionsCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterTab('wrong')}
                      className={`flex-1 min-w-[120px] py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        filterTab === 'wrong'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>الأخطاء فقط</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        filterTab === 'wrong' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {wrongQuestionsCount}
                      </span>
                    </button>
                  </div>
                )}

                {/* 4C. Questions Review Cards List */}
                <div className="space-y-4 sm:space-y-5">
                  {displayedQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium">
                      لا توجد أسئلة تطابق هذا التصنيف.
                    </div>
                  ) : (
                    displayedQuestions.map((q) => {
                      const isUnanswered = !q.selectedOptionId;

                      return (
                        <div
                          key={q.id}
                          className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs transition-all hover:border-slate-300"
                        >
                          {/* Question Card Header */}
                          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 pb-3 border-b border-slate-100 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-[#1A3073] text-white flex items-center justify-center text-xs font-bold font-mono">
                                {q.number}
                              </span>
                              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                السؤال {q.number}
                              </span>
                              {isUnanswered && (
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  لم تتم الإجابة
                                </span>
                              )}
                            </div>

                            {/* Score pill or points label */}
                            {reviewData.canRevealCorrectAnswers ? (
                              <div className="flex items-center gap-1.5">
                                {q.isCorrect ? (
                                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>{q.earnedPoints ?? q.points} / {q.points} درجة</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                    <X className="w-3 h-3 stroke-[3]" />
                                    <span>0 / {q.points} درجة</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100">
                                {q.points} درجات
                              </span>
                            )}
                          </div>

                          {/* Question Text */}
                          <p
                            dir="auto"
                            className={`font-bold text-xs sm:text-base leading-relaxed mb-3 text-slate-900 ${
                              isLatinText(q.questionText) ? 'text-left' : 'text-right'
                            }`}
                          >
                            {q.questionText}
                          </p>

                          {/* Code Snippet if present */}
                          {q.codeSnippet && (
                            <pre
                              dir="ltr"
                              className="bg-slate-900 text-slate-100 p-3.5 sm:p-4 rounded-xl text-xs font-mono overflow-x-auto my-3 border border-slate-800"
                            >
                              <code>{q.codeSnippet}</code>
                            </pre>
                          )}

                          {/* Options Grid / List */}
                          <div className="space-y-2 sm:space-y-2.5 mt-3 sm:mt-4">
                            {q.options.map((option, optIdx) => {
                              const isSelected = q.selectedOptionId === option.id;
                              const optionLetter =
                                (option as { label?: string }).label &&
                                (option as { label?: string }).label!.length === 1
                                  ? (option as { label?: string }).label!.toUpperCase()
                                  : String.fromCharCode(65 + optIdx);

                              // Before deadline rendering (neutral selection, zero answers leaked)
                              if (!reviewData.canRevealCorrectAnswers) {
                                return (
                                  <div
                                    key={option.id}
                                    dir={isLatinText(option.text) ? 'ltr' : 'rtl'}
                                    className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs sm:text-sm ${
                                      isSelected
                                        ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-semibold shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <span
                                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {optionLetter}
                                      </span>
                                      <span
                                        dir="auto"
                                        className={`leading-snug flex-1 min-w-0 break-words ${
                                          isLatinText(option.text) ? 'text-left' : 'text-right'
                                        }`}
                                      >
                                        {option.text}
                                      </span>
                                    </div>

                                    {isSelected && (
                                      <span
                                        dir="rtl"
                                        className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700 shrink-0"
                                      >
                                        إجابتك المسجّلة
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              // After deadline rendering: distinguish student choice, correct answer, or neutral
                              const correctId = q.correctOption || q.correctAnswer;
                              const isCorrectOption = correctId === option.id;
                              const isStudentCorrectChoice = isSelected && isCorrectOption;
                              const isStudentWrongChoice = isSelected && !isCorrectOption;

                              let rowStyle = 'border-slate-200 bg-white text-slate-700';
                              let badgeElement = null;

                              if (isStudentCorrectChoice) {
                                rowStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold shadow-2xs ring-1 ring-emerald-500/20';
                                badgeElement = (
                                  <span
                                    dir="rtl"
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200"
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>إجابتك صحيحة</span>
                                  </span>
                                );
                              } else if (isStudentWrongChoice) {
                                rowStyle = 'border-rose-500 bg-rose-50/80 text-rose-950 font-semibold shadow-2xs ring-1 ring-rose-500/20';
                                badgeElement = (
                                  <span
                                    dir="rtl"
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 shrink-0 border border-rose-200"
                                  >
                                    <X className="w-3 h-3 stroke-[2.5]" />
                                    <span>إجابتك</span>
                                  </span>
                                );
                              } else if (isCorrectOption) {
                                rowStyle = 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold shadow-2xs';
                                badgeElement = (
                                  <span
                                    dir="rtl"
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200"
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>الإجابة الصحيحة</span>
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={option.id}
                                  dir={isLatinText(option.text) ? 'ltr' : 'rtl'}
                                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs sm:text-sm ${rowStyle}`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span
                                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                        isStudentCorrectChoice || isCorrectOption
                                          ? 'bg-emerald-600 text-white'
                                          : isStudentWrongChoice
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {optionLetter}
                                    </span>
                                    <span
                                      dir="auto"
                                      className={`leading-snug flex-1 min-w-0 break-words ${
                                        isLatinText(option.text) ? 'text-left' : 'text-right'
                                      }`}
                                    >
                                      {option.text}
                                    </span>
                                  </div>

                                  {badgeElement}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation Callout if available */}
                          {reviewData.canRevealCorrectAnswers && q.explanation && (
                            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed flex items-start gap-2.5">
                              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <span dir="rtl" className="font-bold text-slate-900 block mb-0.5">
                                  الشرح والتوضيح:
                                </span>
                                <p
                                  dir="auto"
                                  className={`leading-relaxed ${
                                    isLatinText(q.explanation) ? 'text-left' : 'text-right'
                                  }`}
                                >
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

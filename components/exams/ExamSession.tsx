'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Exam } from '@/types/exam';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flag, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  BookOpen, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface ExamSessionProps {
  exam: Exam;
  studentName?: string;
  onFinishExam: (answers: Record<string, string>, timeSpentSeconds: number, isAutoSubmitted?: boolean) => void;
  onCancel?: () => void;
}

export function ExamSession({
  exam,
  studentName = 'عبد الرحمن خالد',
  onFinishExam,
  onCancel,
}: ExamSessionProps) {
  // Total duration in seconds
  const totalSeconds = useMemo(() => exam.durationMinutes * 60, [exam.durationMinutes]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [lastSavedQuestionId, setLastSavedQuestionId] = useState<string | null>(null);

  const currentQuestion = exam.questions[currentIndex];

  // Auto-submit handler (called when countdown hits zero)
  const handleAutoSubmit = useCallback(() => {
    onFinishExam(answers, totalSeconds - timeRemaining, true);
  }, [answers, totalSeconds, timeRemaining, onFinishExam]);

  // Manual submit handler (called when student confirms modal)
  const handleManualSubmit = () => {
    setShowSubmitModal(false);
    onFinishExam(answers, totalSeconds - timeRemaining, false);
  };

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, handleAutoSubmit]);

  // Handle option select
  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
    setLastSavedQuestionId(currentQuestion.id);
  };

  // Toggle flag for current question
  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Format time display
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Warning thresholds
  const isDangerTime = timeRemaining <= 60; // under 1 minute
  const isWarningTime = timeRemaining <= 300 && !isDangerTime; // under 5 minutes

  // Calculated metrics
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = exam.questions.length - answeredCount;
  const flaggedCount = flagged.size;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* 1. Distraction-Free Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left/Start side: Exam Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {exam.courseCode}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {exam.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>الطالب: <strong className="text-slate-200">{studentName}</strong></span>
              <span>•</span>
              <span className="hidden sm:inline">{exam.doctorName}</span>
            </p>
          </div>
        </div>

        {/* Center/End: Real-time Countdown Timer + Submit Button */}
        <div className="flex items-center gap-3">
          {/* Real-time Timer Badge */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold tracking-wider border transition-colors ${
              isDangerTime
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse ring-2 ring-rose-500/50'
                : isWarningTime
                ? 'bg-amber-950/80 text-amber-300 border-amber-600 animate-pulse'
                : 'bg-slate-800/90 text-blue-300 border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 shrink-0 ${isDangerTime ? 'text-rose-400' : isWarningTime ? 'text-amber-400' : 'text-blue-400'}`} />
            <span>{formatTimer(timeRemaining)}</span>
          </div>

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-lg shadow-emerald-900/40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">تسليم الامتحان</span>
            <span className="sm:hidden">تسليم</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Main Column: Active Question Workspace (8 cols) */}
        <main className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Question Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Subtle Top Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Question Header & Controls */}
            <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/70">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center">
                  {currentQuestion.number}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  السؤال {currentIndex + 1} من {exam.questions.length}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 border border-slate-700">
                  {currentQuestion.points} درجات
                </span>
              </div>

              {/* Mark for review / Flag Button */}
              <button
                type="button"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  flagged.has(currentQuestion.id)
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${flagged.has(currentQuestion.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{flagged.has(currentQuestion.id) ? 'معلم للمراجعة' : 'تعليم للمراجعة'}</span>
              </button>
            </div>

            {/* Question Statement */}
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-relaxed mb-6">
              {currentQuestion.questionText}
            </h2>

            {/* Optional Code Snippet */}
            {currentQuestion.codeSnippet && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs sm:text-sm font-mono dir-ltr text-left overflow-x-auto mb-6 text-emerald-400">
                <pre><code>{currentQuestion.codeSnippet}</code></pre>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                const letter = ['أ', 'ب', 'ج', 'د', 'هـ'][optIdx] || (optIdx + 1);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full text-right p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                      isSelected
                        ? 'bg-blue-900/30 border-blue-500 text-white shadow-lg shadow-blue-950/50 ring-1 ring-blue-500'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-sm sm:text-base font-medium leading-relaxed">
                        {option.text}
                      </span>
                    </div>

                    <div className="shrink-0">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-blue-400 bg-blue-500 text-white'
                          : 'border-slate-700 bg-slate-800'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Auto-save & Status indicator */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {answers[currentQuestion.id]
                    ? 'تم حفظ الإجابة تلقائياً على خوادم الكلية'
                    : 'بانتظار تحديد إجابتك...'}
                </span>
              </div>
              <span className="text-slate-500">
                متبقي {unansweredCount} أسئلة دون إجابة
              </span>
            </div>
          </div>

          {/* Navigation Controls (Prev / Next) */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border border-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            {currentIndex === exam.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
              >
                <span>مراجعة وتسليم الاختبار</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
              >
                <span>السؤال التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* Right Column: Question Navigator Map & Instructions (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Question Grid Map */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>خريطة الأسئلة</span>
              <span className="text-xs text-slate-400 font-normal">
                {answeredCount}/{exam.questions.length} مُجاب
              </span>
            </h3>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-4">
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged.has(q.id);

                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700';

                if (isCurrent) {
                  btnStyle = 'bg-blue-600 text-white border-blue-400 font-black ring-2 ring-blue-400/50';
                } else if (isFlagged) {
                  btnStyle = 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300 font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs relative transition-all active:scale-95 ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                <span>السؤال الحالي</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>تمت الإجابة ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span>معلم للمراجعة ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700" />
                <span>دون إجابة ({unansweredCount})</span>
              </div>
            </div>
          </div>

          {/* Quick Academic Exam Rules */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-3xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>إرشادات الجلسة الامتحانية</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-slate-400">
              <li>لا تقم بإعادة تحميل الصفحة لتفادي فقدان توقيت الجلسة.</li>
              <li>الأسئلة المعلمة بعلامة المراجعة لن تسقط درجاتها إذا تمت إجابتها.</li>
              <li>عند انتهاء العداد التنازلي، سيتم اعتماد إجاباتك الحالية تلقائياً.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* 3. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">تأكيد تسليم الامتحان</h3>
                <p className="text-xs text-slate-400">مراجعة الحالة النهائية قبل الإرسال النهائي</p>
              </div>
            </div>

            {/* Answer Summary Pills */}
            <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الأسئلة المجاب عنها:</span>
                <strong className="text-emerald-400 font-mono text-sm">{answeredCount} من {exam.questions.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">أسئلة متبقية دون إجابة:</span>
                <strong className={`font-mono text-sm ${unansweredCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {unansweredCount}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">أسئلة معلمة للمراجعة:</span>
                <strong className="text-amber-400 font-mono text-sm">{flaggedCount}</strong>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">الوقت المتبقي:</span>
                <strong className="text-blue-300 font-mono text-sm">{formatTimer(timeRemaining)}</strong>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-600/50 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  تنبيه: يوجد لديك ({unansweredCount}) سؤال لم تقم باختيار إجابة له بعد. هل تريد الإرسال فعلاً؟
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-colors"
              >
                متابعة الحل
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-950"
              >
                تأكيد وتسليم الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


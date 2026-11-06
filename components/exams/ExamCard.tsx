'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Exam } from '@/types/exam';
import { 
  ClipboardCheck, 
  Clock, 
  HelpCircle, 
  Award, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  // Real-time countdown for upcoming exams
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isReady: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isReady: exam.status === 'live',
  });

  const [simulatedLive, setSimulatedLive] = useState(exam.status === 'live');

  useEffect(() => {
    if (exam.status !== 'upcoming') return;

    const targetDate = new Date(exam.startDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isReady: true });
        setSimulatedLive(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isReady: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [exam.startDate, exam.status]);

  const isLiveNow = simulatedLive || exam.status === 'live';
  const isCompleted = exam.status === 'completed';

  // Format dates for display
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getExamTypeBadge = (type: Exam['type']) => {
    switch (type) {
      case 'midterm':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">ميدتيرم فصلي</span>;
      case 'quiz':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">كويز دوري</span>;
      case 'final':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">امتحان نهائي</span>;
      case 'practical':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">اختبار عملي</span>;
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-3.5 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-md relative overflow-hidden flex flex-col justify-between gap-3.5 sm:gap-4 ${
      isLiveNow ? 'border-emerald-300 ring-1 ring-emerald-500/20' : 'border-slate-200/90 hover:border-blue-300'
    }`}>
      
      {/* Top Header: Code, Badges, and Course Name under the Code */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-2.5">
          {/* Course Code */}
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold tracking-wider shrink-0">
            {exam.courseCode}
          </span>

          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {getExamTypeBadge(exam.type)}

            {isLiveNow && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>متاح للدخول الآن</span>
              </span>
            )}

            {!isLiveNow && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
                <span>يبدأ قريباً</span>
              </span>
            )}

            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>تم التسليم</span>
              </span>
            )}
          </div>
        </div>

        {/* Course Name under the Code */}
        <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 mb-3 leading-snug">
          {exam.courseTitle}
        </h3>

        {/* Key Metrics Grid: Questions, Duration, Marks, Timing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 py-2.5 sm:py-3 px-3 sm:px-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
          {/* Metric 1: Questions count */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400">عدد الأسئلة</p>
              <p className="font-bold text-slate-800 truncate">{exam.questionsCount} سؤال</p>
            </div>
          </div>

          {/* Metric 2: Duration */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400">مدة الامتحان</p>
              <p className="font-bold text-slate-800 truncate">{exam.durationMinutes} دقيقة</p>
            </div>
          </div>

          {/* Metric 3: Total Marks */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400">درجة الامتحان</p>
              <p className="font-bold text-slate-800 truncate">{exam.totalMarks} درجة</p>
            </div>
          </div>

          {/* Metric 4: Timing Range */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400">فترة الاختبار</p>
              <p className="font-bold text-slate-800 truncate" title={`${formatDateTime(exam.startDate)} - ${formatDateTime(exam.endDate)}`}>
                {formatDateTime(exam.startDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action & Timing Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Timing Status Info */}
        <div className="text-xs w-full sm:w-auto">
          {isLiveNow && (
            <div className="flex items-start sm:items-center gap-2 text-emerald-700 font-bold leading-snug">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0 mt-1 sm:mt-0" />
              <span>الاختبار مفتوح الآن • ينتهي {formatDateTime(exam.endDate)}</span>
            </div>
          )}

          {!isLiveNow && !isCompleted && (
            <div className="flex items-center gap-2 text-slate-600 font-mono">
              <span className="text-xs font-sans text-slate-400">يبدأ خلال:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-bold text-xs tracking-wider">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          )}

          {isCompleted && exam.submission && (
            <div className="flex flex-wrap items-center gap-2 text-slate-700">
              <span className="text-slate-500 text-xs">درجتك المحققة:</span>
              <span className="font-extrabold text-blue-600 text-sm">
                {exam.submission.score} / {exam.submission.totalMarks}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {exam.submission.percentage}% ممتاز
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Primary Action Button */}
          {isLiveNow && (
            <Link
              href={`/exams/${exam.id}`}
              className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <span>بدء الاختبار الآن</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </Link>
          )}

          {!isLiveNow && !isCompleted && (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
            >
              <span>في انتظار موعد البدء</span>
            </button>
          )}

          {isCompleted && (
            <Link
              href={`/exams/${exam.id}?view=result`}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/90 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>مراجعة الإجابات والتقرير</span>
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}


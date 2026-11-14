'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Unlock, X, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Course } from '@/types/course';
import { StudentCode } from '@/types/code';
import { redeemCodeAction } from '@/app/codes/actions';
import { useNotifications } from '@/context/NotificationContext';

interface KeyActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCourse?: Course | null;
  onSuccess?: (code: StudentCode) => void;
}

export function KeyActivationModal({
  isOpen,
  onClose,
  targetCourse,
  onSuccess,
}: KeyActivationModalProps) {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activatedCode, setActivatedCode] = useState<StudentCode | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setInputCode('');
    setErrorMessage('');
    setActivatedCode(null);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  // Focus input when modal opens & lock scroll
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Format code input with uppercase and dashes (XXXX - XXXX - XXXX)
  const formatCodeInput = (raw: string) => {
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16);
    const parts: string[] = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join(' - ');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setInputCode(formatCodeInput(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setActivatedCode(null);

    const raw = inputCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!raw) {
      setErrorMessage('يرجى إدخال كود التفعيل المطبوع على إيصال الدفع.');
      return;
    }

    if (raw.length < 8) {
      setErrorMessage('كود التفعيل غير مكتمل، يرجى كتابة الرمز كاملاً.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await redeemCodeAction(inputCode);

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'كود التفعيل غير صحيح أو تم استخدامه مسبقاً.');
        return;
      }

      const newCode = res.data;
      setActivatedCode(newCode);
      setInputCode('');

      // Send live toast notification
      addNotification({
        type: 'material',
        title: `تم تفعيل المقرر بنجاح (${newCode.courseCode})`,
        message: `أصبح بإمكانك الآن تصفح محاضرات واختبارات ${newCode.courseName}.`,
        courseCode: newCode.courseCode,
        courseName: newCode.courseName,
        courseId: newCode.courseId,
        actionUrl: `/courses/${newCode.courseId}`,
        priority: 'urgent',
      });

      // Refresh server components to update courses and exam enrollment state
      router.refresh();

      if (onSuccess) {
        onSuccess(newCode);
      }
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم، يرجى التحقق من اتصالك والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="activation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-scaleUp"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 bg-gradient-to-l from-[#172554] to-blue-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/25 border border-blue-400/30 flex items-center justify-center text-blue-200 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="activation-modal-title" className="text-sm sm:text-base font-extrabold tracking-tight">
                تفعيل مفتاح مقرر أكاديمي
              </h2>
              <p className="text-[11px] text-blue-200/90 font-medium">
                إدخال كود الاشتراك لفتح المحتوى والاختبارات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق نافذة التفعيل"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Target Course Pill if preselected */}
          {targetCourse && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200/70 inline-block mb-1">
                  {targetCourse.code}
                </span>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {targetCourse.title}
                </p>
              </div>
              <span className="text-[10px] text-blue-600 font-semibold shrink-0">
                المقرر المطلوب
              </span>
            </div>
          )}

          {/* Success Banner */}
          {activatedCode && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-900">
                    تم تفعيل المقرر بنجاح! ({activatedCode.courseCode})
                  </h4>
                  <p className="text-[11px] text-emerald-700 leading-snug">
                    تم فتح كامل المحاضرات والاختبارات التابعة لمقرر {activatedCode.courseName}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/courses/${activatedCode.courseId}`}
                  onClick={handleClose}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>استعراض المقرر الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-10 px-4 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

          {/* Activation Form (shown if not yet activated) */}
          {!activatedCode && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="activationCodeInput"
                  className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
                >
                  اكتب كود الوصول كما هو في إيصال الدفع
                </label>

                <div className="relative">
                  <input
                    ref={inputRef}
                    id="activationCodeInput"
                    type="text"
                    value={inputCode}
                    onChange={handleInputChange}
                    placeholder="XXXX - XXXX - XXXX"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={isLoading}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-sm sm:text-base font-bold font-mono tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:font-mono bg-white hover:border-slate-300 transition-all outline-hidden text-center disabled:opacity-60"
                  />
                  {inputCode && !isLoading && (
                    <button
                      type="button"
                      onClick={() => setInputCode('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                      title="مسح"
                      aria-label="مسح الكود المدخل"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  الأحرف الصغيرة والكبيرة سواء، والشرطات اختيارية.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading || !inputCode.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحقق...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>تفعيل المفتاح الآن</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Quick link to /codes page */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              href="/codes"
              onClick={handleClose}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <span>الانتقال لصفحة سجل الأكواد والصلاحيات الكاملة</span>
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

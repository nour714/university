'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for client-side diagnosis
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          {/* Heading & Description */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
            تعذّر تحميل الصفحة
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-sm">
            حدث انقطاع مؤقت في الاتصال أو أثناء معالجة البيانات من الخادم. يُرجى إعادة المحاولة أو الرجوع للصفحة الرئيسية.
          </p>

          {/* Error Digest (if available) */}
          {error.digest && (
            <div className="mb-6 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500 select-all">
              رمز الخطأ: {error.digest}
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold text-sm transition-all"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/log';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Critical root layout error caught by global-error boundary:', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>خطأ في النظام - البوابة الأكاديمية</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen m-0 bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans antialiased selection:bg-blue-500 selection:text-white">
        <main
          role="alert"
          aria-live="assertive"
          className="w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div
            className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-5 shadow-xs">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            {/* Title & Description */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
              حدث خطأ غير متوقع في النظام
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 max-w-md">
              نعتذر عن هذا العطل المؤقت في البنية الأساسية للنظام. تم تسجيل تفاصيل الخطأ بأمان لمتابعتها من قِبل الدعم الفني.
            </p>

            {/* Error Digest (if provided by Next.js) */}
            {error?.digest && (
              <div className="mb-6 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-500 select-all max-w-xs truncate">
                معرف الخطأ: {error.digest}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span>إعادة المحاولة</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                <span>إعادة تحميل الصفحة</span>
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

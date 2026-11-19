import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - الصفحة غير موجودة | كلية الذكاء الاصطناعي',
  description: 'الصفحة المطلوبة غير موجودة في بوابة كلية الذكاء الاصطناعي بجامعة كفر الشيخ.',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide mb-4">
            <span>كلية الذكاء الاصطناعي</span>
            <span className="opacity-40">•</span>
            <span>خطأ 404</span>
          </div>

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5 shadow-sm">
            <FileQuestion className="w-8 h-8" />
          </div>

          {/* Heading & Description */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
            الصفحة غير موجودة
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-sm">
            عذراً، الصفحة أو المورد الأكاديمي الذي تبحث عنه غير متاح أو تم نقله. يُرجى التحقق من الرابط أو الرجوع للبوابة الرئيسية.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

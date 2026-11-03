'use client';

import { useNotifications } from '@/context/NotificationContext';
import { 
  Bell, 
  BookOpen, 
  ClipboardCheck, 
  Sparkles, 
  FileText, 
  X, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export function NotificationToast() {
  const { toast, dismissToast, markAsRead } = useNotifications();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'lecture':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'exam':
        return <ClipboardCheck className="w-5 h-5 text-rose-600" />;
      case 'material':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'announcement':
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const getBadgeStyle = () => {
    switch (toast.type) {
      case 'lecture':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'exam':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'material':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'announcement':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 sm:right-auto sm:left-6 sm:w-96 z-50 animate-slideIn">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-2xl shadow-blue-950/20 flex items-start gap-3 relative overflow-hidden">
        {/* Accent top stripe */}
        <div className={`absolute top-0 inset-x-0 h-1 ${
          toast.type === 'lecture' ? 'bg-blue-600' :
          toast.type === 'exam' ? 'bg-rose-600' :
          toast.type === 'material' ? 'bg-emerald-600' : 'bg-amber-500'
        }`} />

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle()}`}>
              {toast.type === 'lecture' && 'محاضرة جديدة'}
              {toast.type === 'exam' && 'تنبيه اختبار'}
              {toast.type === 'material' && 'محتوى أكاديمي'}
              {toast.type === 'announcement' && 'إشعار هام'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">الآن</span>
          </div>

          <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-1 mb-1">
            {toast.title}
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-2">
            {toast.message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            {toast.actionUrl ? (
              <Link
                href={toast.actionUrl}
                onClick={() => {
                  markAsRead(toast.id);
                  dismissToast();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>فتح المقرر الآن</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            ) : <span />}

            <button
              type="button"
              onClick={dismissToast}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-700 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Close X Button */}
        <button
          type="button"
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all shrink-0 -mt-1 -mr-1"
          aria-label="إغلاق الإشعار"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  X, 
  ChevronLeft, 
  User,
  Sparkles,
  Settings
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { clearSession } from '@/lib/repos/sessionRepo';
import { logoutAction } from '@/app/auth/actions';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';

interface MoreMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export function MoreMenuSheet({ isOpen, onClose }: MoreMenuSheetProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { student } = useStudentProfile();

  const { resetAll } = useNotifications();

  // Lock body scroll when opened/closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logoutAction();
    } finally {
      clearSession();
      resetAll();
      setLogoutLoading(false);
      onClose();
      router.push('/login');
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="lg:hidden" role="dialog" aria-modal="true" aria-label="قائمة المزيد">
      {/* 1. Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] animate-fadeIn transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Bottom Sheet Container */}
      <div 
        className="fixed inset-x-0 bottom-0 z-[1000] w-full max-h-[85vh] bg-white rounded-t-[28px] border-t border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-slideUp"
      >
        {/* Mobile Drag Indicator Handle on Dark Navy Header */}
        <div className="w-full pt-2.5 pb-1 flex justify-center bg-gradient-to-l from-slate-900 to-[#172554] shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-400/60" />
        </div>

        {/* Dynamic Sheet Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-l from-slate-900 to-[#172554] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">
                المزيد من الخيارات
              </h3>
              <p className="text-[11px] text-blue-200/90 font-medium">
                إدارة وتأمين حسابك الجامعي والدعم
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[70vh]">
          <div className="space-y-3">
            {/* Button 1: الإعدادات والدعم الفني */}
            <Link
              href="/settings"
              onClick={onClose}
              className="w-full text-right p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 hover:from-blue-100/80 hover:to-indigo-100/80 border border-blue-200/90 transition-all flex items-center justify-between group cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform shrink-0">
                  <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                    الإعدادات والدعم الفني
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    تغيير كلمة السر، التواصل مع الدعم، والأسئلة الشائعة
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Link>

            {/* Button 2: تسجيل الخروج */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full text-right p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50/60 hover:from-rose-100/70 hover:to-red-100/70 border border-rose-200/80 transition-all flex items-center justify-between group cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform shrink-0">
                  {logoutLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5 -scale-x-100" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                    تسجيل الخروج
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    إنهاء الجلسة الحالية وتسجيل الخروج من الحساب
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-rose-200/60 flex items-center justify-center text-rose-600 shadow-2xs group-hover:bg-rose-600 group-hover:text-white transition-all shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </div>
            </button>

            {/* Student status footer pill */}
            <div className="pt-2">
              <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{student?.fullName || 'طالب أكاديمي'}</p>
                    <p className="text-[10px] text-slate-500">
                      {student ? `${student.level} • ${student.department}` : 'طالب جامعي'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  حساب نشط
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  LogOut, 
  KeyRound, 
  X, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  Check,
  User,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface MoreMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreMenuSheet({ isOpen, onClose }: MoreMenuSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'menu' | 'changePassword'>('menu');
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { addNotification } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and reset view when opened/closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveView('menu');
      setPasswordError('');
      setPasswordSuccess(false);
      setLogoutLoading(false);
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

  const handleLogout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      setLogoutLoading(false);
      addNotification({
        title: 'تم تسجيل الخروج بنجاح',
        message: 'تم إنهاء الجلسة الأكاديمية بنجاح. يمكنك تسجيل الدخول مجدداً في أي وقت.',
        type: 'announcement',
      });
      onClose();
    }, 500);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('يرجى إدخال كلمة المرور الحالية');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف أو أرقام');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordSuccess(true);
      addNotification({
        title: 'تم تحديث كلمة المرور بنجاح',
        message: 'تم تأمين حسابك الجامعي بكلمة المرور الجديدة بنجاح.',
        type: 'announcement',
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 700);
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

        {/* Dynamic Sheet Header - Matching Notification Sheet */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-l from-slate-900 to-[#172554] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {activeView !== 'menu' && (
              <button
                type="button"
                onClick={() => {
                  setActiveView('menu');
                  setPasswordError('');
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer -ms-1"
                title="رجوع"
                aria-label="رجوع"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            )}

            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 shrink-0">
              {activeView === 'changePassword' ? (
                <KeyRound className="w-4 h-4 text-amber-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">
                {activeView === 'changePassword' 
                  ? 'تغيير كلمة السر' 
                  : 'المزيد من الخيارات'}
              </h3>
              <p className="text-[11px] text-blue-200/90 font-medium">
                {activeView === 'changePassword' 
                  ? 'تأمين وتحديث كلمة مرور الحساب' 
                  : 'إدارة وتأمين حسابك الجامعي'}
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
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {/* VIEW 1: Main Menu with LogOut and Change Password Buttons */}
          {activeView === 'menu' && (
            <div className="space-y-3.5">
              {/* Button 1: تسجيل الخروج */}
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

              {/* Button 2: تغيير كلمة السر */}
              <button
                type="button"
                onClick={() => setActiveView('changePassword')}
                className="w-full text-right p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 hover:from-amber-100/70 hover:to-orange-100/70 border border-amber-200/80 transition-all flex items-center justify-between group cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                      تغيير كلمة السر
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      تحديث كلمة المرور لحماية وتأمين حساب الطالب
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-2xs group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0">
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
                      <p className="text-xs font-bold text-slate-800">عبد الرحمن خالد</p>
                      <p className="text-[10px] text-slate-500">طالب • المستوى 3 • الذكاء الاصطناعي</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    حساب نشط
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: Change Password Form */}
          {activeView === 'changePassword' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fadeIn">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم تغيير كلمة السر بنجاح! جاري الحفظ...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  كلمة المرور الحالية
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="6 أحرف أو أرقام على الأقل"
                    className="w-full px-3.5 py-2.5 pr-10 pl-10 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showNewPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور الجديدة"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading || passwordSuccess}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-2"
              >
                {passwordLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>حفظ كلمة السر الجديدة</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

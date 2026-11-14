'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, CheckCircle2, LogOut } from 'lucide-react';
import { changePasswordAction, logoutAction } from '@/app/auth/actions';
import { StudentProfile } from '@/types/student';

interface ChangePasswordFormProps {
  student?: StudentProfile;
}

export function ChangePasswordForm({ student }: ChangePasswordFormProps) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password rules validation
  const hasMinLength = newPassword.length >= 10;
  const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword) {
      setErrorMessage('يرجى إدخال كلمة المرور الحالية أو المؤقتة.');
      return;
    }

    if (!hasMinLength || !hasLetters || !hasNumbers) {
      setErrorMessage('كلمة المرور الجديدة يجب أن تحتوي على 10 أحرف على الأقل وتجمع بين الحروف والأرقام.');
      return;
    }

    if (!isMatch) {
      setErrorMessage('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await changePasswordAction(currentPassword, newPassword);

      if (!res.success) {
        setErrorMessage(res.error || 'تعذر تغيير كلمة المرور. يرجى التأكد من صحة البيانات.');
        return;
      }

      setSuccessMessage('تم تحديث كلمة المرور بنجاح! جارٍ تحويلك إلى لوحة التحكم...');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('academic_tab_active', '1');
      }
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1200);
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالخادم. يرجى إعادة المحاولة.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('academic_tab_active');
      }
      await logoutAction();
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 animate-fadeIn">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            تحديث كلمة المرور
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {student?.fullName ? `مرحباً بك يا ${student.fullName}. ` : ''}
            يتطلب نظام الكلية تعيين كلمة مرور شخصية جديدة وآمنة قبل متابعة الدخول.
          </p>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <label htmlFor="changeCurrentPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور الحالية / المؤقتة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="changeCurrentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                required
                className="w-full h-11 px-3.5 ps-10 pe-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute end-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={showCurrent ? 'إخفاء' : 'إظهار'}
                aria-label={showCurrent ? 'إخفاء كلمة المرور الحالية' : 'إظهار كلمة المرور الحالية'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label htmlFor="changeNewPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور الجديدة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="changeNewPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="10 خانات على الأقل (حروف وأرقام)"
                required
                className="w-full h-11 px-3.5 ps-10 pe-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute end-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={showNew ? 'إخفاء' : 'إظهار'}
                aria-label={showNew ? 'إخفاء كلمة المرور الجديدة' : 'إظهار كلمة المرور الجديدة'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Checklist */}
            <div className="mt-2 space-y-1 text-[11px] text-slate-500 font-medium">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>10 خانات على الأقل</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLetters && hasNumbers ? 'text-emerald-600 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hasLetters && hasNumbers ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>تجمع بين الحروف والأرقام</span>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="changeConfirmPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
              تأكيد كلمة المرور الجديدة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="changeConfirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                required
                className="w-full h-11 px-3.5 ps-10 pe-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute end-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={showConfirm ? 'إخفاء' : 'إظهار'}
                aria-label={showConfirm ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !hasMinLength || !hasLetters || !hasNumbers || !isMatch}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جارٍ حفظ كلمة المرور...</span>
              </>
            ) : (
              <>
                <span>تأكيد وحفظ كلمة المرور</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Footer: Logout */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>ترغب في الخروج الآن؟</span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}

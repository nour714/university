'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  BookOpen,
  GraduationCap,
  MessageSquare,
  X
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { CURRENT_STUDENT } from '@/data/student';
import { AuthCinematicShowcase } from '@/components/auth/AuthCinematicShowcase';

export function LoginForm() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('يرجى إدخال الرقم الأكاديمي أو الرقم القومي');
      return;
    }

    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      addNotification({
        title: `مرحباً بك مجدداً، ${CURRENT_STUDENT.fullName.split(' ')[0]}!`,
        message: 'تم تسجيل الدخول إلى البوابة الأكاديمية بنجاح.',
        type: 'announcement',
        priority: 'normal',
      });
      router.push('/');
    }, 850);
  };

  const handleQuickDemoLogin = () => {
    setIdentifier(CURRENT_STUDENT.academicId);
    setPassword('student@2026');
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      addNotification({
        title: `مرحباً بك، ${CURRENT_STUDENT.fullName}!`,
        message: 'تم تسجيل الدخول السريع بالحساب التجريبي بنجاح.',
        type: 'announcement',
        priority: 'normal',
      });
      router.push('/');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-3 sm:p-5 relative overflow-hidden">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card (Compact Form 46% & Expanded Showcase 54% with Timeline Divider) */}
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Login Form (Reduced to 46%)     */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[46%] p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-white shrink-0">
          <div>
            {/* Mobile Header Logo (visible only on mobile) */}
            <div className="lg:hidden flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs p-1 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="شعار كلية الذكاء الاصطناعي"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain select-none"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-extrabold text-[#172554] tracking-tight">
                  كلية الذكاء الاصطناعي
                </h1>
                <p className="text-[10px] text-slate-500 font-medium">البوابة الأكاديمية للطلاب</p>
              </div>
            </div>

            {/* Form Title & Intro */}
            <div className="mb-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1.5 border border-blue-200/60">
                <GraduationCap className="w-3 h-3 text-blue-600" />
                <span>العام الأكاديمي 2026/2027</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                تسجيل الدخول إلى حسابك
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                أدخل الرقم الأكاديمي أو الرقم القومي للمتابعة.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Field 1: Academic ID / National ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الأكاديمي أو الرقم القومي <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="مثال: 20230814 أو الرقم القومي 14 رقم"
                    className="w-full h-10 sm:h-11 px-3.5 ps-9 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الخاصة بحسابك"
                    className="w-full h-10 sm:h-11 px-3.5 ps-9 pe-9 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    title={showPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    تذكر تسجيل دخولي على هذا الجهاز
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 mt-1.5"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ التحقق وتأكيد الدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول إلى المنصة</span>
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-slate-700 hover:text-blue-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>دخول تجريبي سريع بحساب الطالب عبد الرحمن خالد</span>
              </button>
            </div>
          </div>

          {/* Footer Assistance */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>تواجه صعوبة؟</span>
              <Link href="/settings" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                مركز المساعدة
              </Link>
            </div>

            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
              <span>نظام موثق ومحمي SSL</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VERTICAL DIVIDER TRACK WITH CENTRAL ACADEMIC BADGE NODE   */}
        {/* Placed in flex flow between columns to lock to the seam   */}
        {/* ========================================================= */}
        <div 
          className="hidden lg:block relative w-0 shrink-0 z-30 self-stretch pointer-events-none"
          aria-hidden="true"
        >
          {/* Continuous vertical line running full height along the seam */}
          <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-[#172554] via-blue-600 to-[#172554] shadow-sm" />
          
          {/* Central Circular Node Badge (Centered on the line at 50% height) */}
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 border-2 border-white shadow-xl shadow-blue-950/40 flex items-center justify-center text-white">
            <GraduationCap className="w-4.5 h-4.5 drop-shadow-xs" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* LEFT COLUMN: Cinematic Interactive Onboarding Carousel    */}
        {/* ========================================================= */}
        <AuthCinematicShowcase />
      </div>

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL                                     */}
      {/* ========================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 start-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              استعادة كلمة المرور
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              لحماية بيانات الطلاب ونتائجهم، يتم إعادة تعيين كلمة المرور عبر مراجعة الهوية مع وحدة الدعم الفني أو شؤون الطلاب.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 mb-5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>تواصل مباشرة عبر واتساب الدعم الفني الرسمي.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>أو تفضل بزيارة مكتب شؤون الطلاب بالدور الأرضي.</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>مراسلة واتساب الدعم</span>
              </a>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


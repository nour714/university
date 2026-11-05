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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-3 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Login Form (Desktop & Mobile)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile Header Logo (visible only on mobile) */}
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs p-1.5 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="شعار كلية الذكاء الاصطناعي"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain select-none"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-[#172554] tracking-tight">
                  كلية الذكاء الاصطناعي
                </h1>
                <p className="text-xs text-slate-500 font-medium">البوابة الأكاديمية للطلاب</p>
              </div>
            </div>

            {/* Form Title & Intro */}
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2.5 border border-blue-200/60">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>العام الأكاديمي 2026/2027</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                تسجيل الدخول إلى حسابك
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                أدخل الرقم الأكاديمي أو الرقم القومي المسجل لدى شؤون الطلاب للمتابعة.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Academic ID / National ID */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  الرقم الأكاديمي أو الرقم القومي <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="مثال: 20230814 أو الرقم القومي 14 رقم"
                    className="w-full h-12 px-4 ps-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <User className="w-5 h-5 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700">
                    كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
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
                    className="w-full h-12 px-4 ps-11 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    title={showPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">
                    تذكر تسجيل دخولي على هذا الجهاز
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ التحقق وتأكيد الدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول إلى المنصة</span>
                    <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>دخول تجريبي سريع بحساب الطالب عبد الرحمن خالد</span>
              </button>
            </div>
          </div>

          {/* Footer Assistance */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>تواجه صعوبة في الدخول؟</span>
              <Link href="/settings" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                مركز المساعدة
              </Link>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>نظام موثق ومحمي 256-bit SSL</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LEFT COLUMN: Academic Showcase & University Pride         */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-[#172554] to-blue-950 p-8 xl:p-10 text-white flex-col justify-between relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top: University Crest */}
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-xl shadow-blue-950/50 flex items-center justify-center p-2 mb-6">
              <Image
                src="/logo.png"
                alt="شعار كلية الذكاء الاصطناعي"
                width={56}
                height={56}
                className="w-full h-full object-contain select-none"
                priority
                unoptimized
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold mb-3 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>جامعة المستقبل للذكاء الاصطناعي</span>
            </div>

            <h3 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              بوابة كلية الذكاء الاصطناعي الأكاديمية
            </h3>
            <p className="text-xs xl:text-sm text-blue-200/90 leading-relaxed">
              منظومة التعليم الرقمي المتكاملة لتصفح المقررات، حضور المحاضرات، إدارة أكواد الوصول، ومتابعة الدرجات والتقييمات.
            </p>
          </div>

          {/* Middle: Feature Highlights */}
          <div className="my-8 space-y-3.5 relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">مكتبة المقررات المعتمدة</h4>
                <p className="text-[11px] text-blue-200/80 mt-0.5">سلايدات وملفات الشرح لجميع المستويات</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">نتائج واختبارات فورية</h4>
                <p className="text-[11px] text-blue-200/80 mt-0.5">تقييم مستمر ومتابعة دقيقة للأداء الأكاديمي</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">حسابات مشفرة ومؤمنة</h4>
                <p className="text-[11px] text-blue-200/80 mt-0.5">حماية كاملة للبيانات الأكاديمية للطالب</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-4 border-t border-white/10 text-[11px] text-blue-300/80 flex items-center justify-between relative z-10">
            <span>جميع الحقوق محفوظة © 2026</span>
            <span>كلية الذكاء الاصطناعي</span>
          </div>
        </div>
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

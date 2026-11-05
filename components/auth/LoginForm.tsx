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
  X,
  Award,
  ChevronLeft,
  KeyRound,
  ExternalLink,
  Check
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { CURRENT_STUDENT } from '@/data/student';

type UserRole = 'student' | 'faculty';

export function LoginForm() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [role, setRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Switch role handler: resets errors and gives role-appropriate feedback
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage('');
    if (newRole === 'faculty') {
      if (identifier === CURRENT_STUDENT.academicId) {
        setIdentifier('');
        setPassword('');
      }
    } else {
      if (identifier.includes('@')) {
        setIdentifier('');
        setPassword('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage(
        role === 'student'
          ? 'يرجى إدخال الرقم الأكاديمي أو الرقم القومي للطالب'
          : 'يرجى إدخال البريد الإلكتروني الجامعي أو كود عضو هيئة التدريس'
      );
      return;
    }

    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور لحسابك الأكاديمي');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const displayName = role === 'student' ? CURRENT_STUDENT.fullName.split(' ')[0] : 'د. محمد العوضي';
      addNotification({
        title: `مرحباً بك مجدداً، ${displayName}!`,
        message: 'تم تسجيل الدخول إلى البوابة الأكاديمية بنجاح.',
        type: 'announcement',
        priority: 'normal',
      });
      router.push('/');
    }, 750);
  };

  // Quick Demo fill functions
  const fillStudentDemo = () => {
    setRole('student');
    setIdentifier(CURRENT_STUDENT.academicId);
    setPassword('student@2026');
    setErrorMessage('');
  };

  const fillFacultyDemo = () => {
    setRole('faculty');
    setIdentifier('dr.awady@ai.edu.eg');
    setPassword('faculty@2026');
    setErrorMessage('');
  };

  const handleInstantDemoLogin = (type: 'student' | 'faculty') => {
    if (type === 'student') {
      fillStudentDemo();
    } else {
      fillFacultyDemo();
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const name = type === 'student' ? CURRENT_STUDENT.fullName : 'أ.د. محمد العوضي';
      addNotification({
        title: `مرحباً بك، ${name}!`,
        message: 'تم الدخول السريع بالحساب التجريبي بنجاح.',
        type: 'announcement',
        priority: 'normal',
      });
      router.push('/');
    }, 650);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#070b14] p-3 sm:p-6 lg:p-8 relative overflow-hidden text-slate-900">
      
      {/* Dynamic Background Mesh Lights */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-900/25 via-indigo-950/20 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Floating Bar: Back to Platform & Academic Badge */}
      <div className="w-full max-w-5xl mb-4 sm:mb-6 flex items-center justify-between z-20 px-2 sm:px-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold backdrop-blur-md transition-all shadow-sm group"
        >
          <ChevronLeft className="w-4 h-4 rotate-180 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>العودة للمنصة الرئيسية</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>النظام الأكاديمي الموحد • 2026</span>
        </div>
      </div>

      {/* Main Container Split Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl sm:rounded-[32px] shadow-2xl shadow-black/40 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Login Form                      */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile Header Logo & Crest */}
            <div className="lg:hidden flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 flex items-center justify-center shrink-0">
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
                  <p className="text-xs text-slate-500 font-medium">البوابة الأكاديمية الرسمية</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                2026/2027
              </span>
            </div>

            {/* Form Title & Context */}
            <div className="mb-5 sm:mb-6">
              <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2.5 border border-blue-200/60">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>بوابة الخدمات التعليمية والأكاديمية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                تسجيل الدخول إلى حسابك
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                سجل الدخول لمتابعة مقرراتك الأكاديمية، تنزيل المحاضرات، وإدارة اختباراتك.
              </p>
            </div>

            {/* Role Switcher Tabs (طالب / عضو هيئة تدريس) */}
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 grid grid-cols-2 gap-1 mb-5 sm:mb-6">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-white text-blue-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>حساب طالب</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('faculty')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'faculty'
                    ? 'bg-white text-blue-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className={`w-4 h-4 ${role === 'faculty' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>عضو هيئة التدريس</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Identifier */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  {role === 'student' ? 'الرقم الأكاديمي أو الرقم القومي' : 'البريد الجامعي الرسمي أو كود التدريس'}
                  <span className="text-rose-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={role === 'student' ? 'text' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      role === 'student'
                        ? 'مثال: 20230814 أو الرقم القومي'
                        : 'مثال: dr.awady@ai.edu.eg'
                    }
                    className="w-full h-12 px-4 ps-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm sm:text-base text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 absolute start-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <User className="w-4.5 h-4.5 text-slate-500" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {role === 'student'
                    ? 'الرقم المدون على بطاقتك الجامعية (الكارنيه).'
                    : 'البريد الأكاديمي المعتمد من مركز المعلومات بالكلية.'}
                </p>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700">
                    كلمة المرور
                    <span className="text-rose-500 ms-1">*</span>
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
                    className="w-full h-12 px-4 ps-11 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm sm:text-base text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 absolute start-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Lock className="w-4.5 h-4.5 text-slate-500" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center transition-colors"
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
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 mt-2"
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

            {/* Quick Demo Access Hub */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>دخول سريع بحساب تجريبي (Demo):</span>
                </span>
                <span className="text-[10px] text-slate-400">نقرة واحدة للمعاينة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Student Demo Pill */}
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('student')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-right flex items-center justify-between gap-2 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                        طالب: عبد الرحمن خالد
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">20230814</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </button>

                {/* Faculty Demo Pill */}
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('faculty')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 text-right flex items-center justify-between gap-2 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 truncate">
                        دكتور: أ.د. محمد العوضي
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">dr.awady@ai.edu.eg</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Assistance */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>تواجه مشكلة في تسجيل الدخول؟</span>
              <Link href="/settings" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                الدعم الفني
              </Link>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>اتصال مشفر 256-bit SSL آمن</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LEFT COLUMN: Academic Pride & Showcase (Desktop Only)     */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-[#172554] to-blue-950 p-8 xl:p-10 text-white flex-col justify-between relative overflow-hidden">
          
          {/* Ambient Inner Lights */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top: University Crest & Identity */}
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-xl shadow-blue-950/60 flex items-center justify-center p-2 mb-6 animate-white-pulse">
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

            <h3 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white mb-2.5 leading-snug">
              بوابة كلية الذكاء الاصطناعي الأكاديمية
            </h3>
            <p className="text-xs xl:text-sm text-blue-200/90 leading-relaxed">
              منظومة متكاملة لخدمة طلاب وأعضاء هيئة التدريس، تتيح استعراض المقررات والمحاضرات والاختبارات بأعلى معايير الأمان الأكاديمي.
            </p>
          </div>

          {/* Middle: Feature Highlights */}
          <div className="my-6 space-y-3 relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">مكتبة المقررات الذكية</h4>
                <p className="text-[11px] text-blue-200/80 mt-0.5">سلايدات، شروحات فيديو، وملفات دراسية معتمدة</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">إدارة الأكواد وتفعيل المقررات</h4>
                <p className="text-[11px] text-blue-200/80 mt-0.5">تأكيد مباشر لصلاحيات الوصول لكل مقرر</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">تقييم مستمر واختبارات دورية</h4>
                <p className="text-[11px] text-blue-200/80 mt-0.5">نتائج فورية ومتابعة دقيقة للأداء التراكمي</p>
              </div>
            </div>
          </div>

          {/* Bottom Academic Quote & Copyright */}
          <div className="pt-4 border-t border-white/10 relative z-10 space-y-2">
            <p className="text-[11px] text-blue-200/70 italic leading-relaxed">
              &ldquo;تمكين جيل المستقبل من مهندسي وباحثي الذكاء الاصطناعي بأحدث التقنيات والمعارف التطبيقية.&rdquo;
            </p>
            <div className="flex items-center justify-between text-[10px] text-blue-300/60 pt-1">
              <span>جميع الحقوق محفوظة © 2026</span>
              <span>كلية الذكاء الاصطناعي</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL                                     */}
      {/* ========================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn text-slate-900">
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
              لحماية خصوصية الطلاب وسجلات درجاتهم، يتم استعادة أو تعيين كلمة المرور بالتنسيق المباشر مع وحدة الدعم الفني وشؤون الطلاب.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 mb-5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>تواصل عبر واتساب الدعم الفني الرسمي لطلب رابط إعادة التعيين.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>أو مراجعة مكتب شؤون الطلاب مصطحباً بطاقة الهوية الجامعية.</span>
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
                <span>واتساب الدعم الفني</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
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

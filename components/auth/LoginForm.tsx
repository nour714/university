'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Send,
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
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpIdentifier, setHelpIdentifier] = useState('');
  const [helpIssueType, setHelpIssueType] = useState('login_issue');
  const [helpMessage, setHelpMessage] = useState('');
  const [isHelpSubmitted, setIsHelpSubmitted] = useState(false);
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim()) return;

    setIsSubmittingHelp(true);
    setTimeout(() => {
      setIsSubmittingHelp(false);
      setIsHelpSubmitted(true);
      addNotification({
        title: 'تم استلام طلب المساعدة',
        message: 'تم تسجيل بلاغك وسيقوم الدعم الفني بمتابعته وحله في أسرع وقت.',
        type: 'announcement',
        priority: 'normal',
      });
    }, 600);
  };

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-[#091533] to-[#04091a] p-3 sm:p-5 py-6 sm:py-8 lg:py-4 relative overflow-x-hidden select-none">
      
      {/* 1. Subtle High-Tech Architectural Grid Matrix with smooth motion */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none animate-grid-drift" 
        aria-hidden="true"
      />

      {/* 2. Floating Luminous AI Ambient Plasma Orbs (GPU accelerated smooth movement) */}
      <div 
        className="absolute -top-20 -right-20 w-[450px] h-[450px] bg-blue-600/35 rounded-full blur-[100px] pointer-events-none animate-float-orb-1"
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-20 -left-20 w-[480px] h-[480px] bg-indigo-600/35 rounded-full blur-[110px] pointer-events-none animate-float-orb-2" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-1/2 left-1/2 w-[550px] h-[550px] bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none animate-float-orb-3" 
        aria-hidden="true"
      />

      {/* 3. Floating Neural Sparks / Data Nodes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[20%] right-[22%] w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-particle-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[35%] left-[16%] w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-particle-float" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-[25%] right-[24%] w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8] animate-particle-float" style={{ animationDelay: '2.5s' }} />
        <div className="absolute bottom-[35%] left-[20%] w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#93c5fd] animate-particle-float" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-[50%] right-[10%] w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_#38bdf8] animate-particle-float" style={{ animationDelay: '3.2s' }} />
        <div className="absolute top-[65%] left-[12%] w-2 h-2 rounded-full bg-amber-400/90 shadow-[0_0_10px_#fbbf24] animate-particle-float" style={{ animationDelay: '2.1s' }} />
      </div>

      {/* 4. Ambient Institutional Watermark Logo in Background with Organic Breathing */}
      <div 
        className="absolute top-1/2 left-1/2 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] pointer-events-none select-none z-0 flex items-center justify-center animate-logo-breathe"
        aria-hidden="true"
      >
        <div className="relative w-full h-full filter drop-shadow-[0_0_90px_rgba(59,130,246,0.55)] brightness-125 contrast-110">
          <Image
            src="/logo.png"
            alt="شعار الكلية بالخلفية"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* 5. Top Institutional Brand Header (Desktop) */}
      <div className="hidden lg:flex absolute top-6 right-8 z-20 items-center gap-3 select-none pointer-events-none">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <Image
            src="/logo.png"
            alt="شعار كلية الذكاء الاصطناعي"
            width={48}
            height={48}
            className="w-full h-full object-contain select-none drop-shadow-[0_2px_14px_rgba(59,130,246,0.65)]"
            priority
            unoptimized
          />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-base font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            كلية الذكاء الاصطناعي
          </span>
          <span className="text-xs font-bold text-blue-400 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            جامعة المستقبل • البوابة الأكاديمية
          </span>
        </div>
      </div>

      {/* 6. Top Institutional Brand Header (Mobile & Tablet) */}
      <div className="lg:hidden flex flex-col items-center justify-center text-center mb-4 sm:mb-5 z-20 select-none">
        <div className="w-13 h-13 rounded-2xl bg-white shadow-xl shadow-blue-950/40 border border-white/90 p-2 flex items-center justify-center mb-2.5 shrink-0">
          <Image
            src="/logo.png"
            alt="شعار كلية الذكاء الاصطناعي"
            width={42}
            height={42}
            className="w-full h-full object-contain"
            priority
            unoptimized
          />
        </div>
        <h1 className="text-base sm:text-lg font-black text-white tracking-tight drop-shadow-xs">
          كلية الذكاء الاصطناعي
        </h1>
        <p className="text-xs font-bold text-blue-300 drop-shadow-xs">
          جامعة المستقبل • البوابة الأكاديمية الذكية
        </p>
      </div>

      {/* Main Container Card (Compact Form 46% & Expanded Showcase 54% with Timeline Divider) */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Login Form (Reduced to 46%)     */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[46%] p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-white shrink-0">
          <div>
            {/* Form Title */}
            <div className="mb-3.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1.5 border border-blue-200/60">
                <GraduationCap className="w-3 h-3 text-blue-600" />
                <span>العام الأكاديمي 2026/2027</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                تسجيل الدخول إلى حسابك
              </h2>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: National ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم القومي <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="مثال: الرقم القومي 14 رقم"
                    className="w-full h-11 px-3.5 ps-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-0.5"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الخاصة بحسابك"
                    className="w-full h-11 px-3.5 ps-10 pe-10 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5"
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
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>تواجه صعوبة في الدخول؟</span>
              <button
                type="button"
                onClick={() => {
                  setIsHelpSubmitted(false);
                  setIsHelpModalOpen(true);
                }}
                className="font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                مركز المساعدة
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VERTICAL DIVIDER TRACK WITH CENTRAL ACADEMIC BADGE NODE   */}
        {/* High-visibility architectural timeline divider on the seam */}
        {/* ========================================================= */}
        <div 
          className="hidden lg:block relative w-0 shrink-0 z-30 self-stretch pointer-events-none"
          aria-hidden="true"
        >
          {/* Continuous Bold Vertical Track with Luminous Blue Accent */}
          <div className="absolute inset-y-0 -left-[2px] w-[4px] bg-gradient-to-b from-[#0f172a] via-blue-600 to-[#0f172a] shadow-[0_0_12px_rgba(37,99,235,0.4)] ring-1 ring-white/60" />
          
          {/* Central Prominent Academic Circular Badge */}
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 border-[3.5px] border-white shadow-2xl shadow-blue-950/60 ring-2 ring-blue-500/25 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5 drop-shadow-xs" />
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
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
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

      {/* ========================================================= */}
      {/* HELP CENTER & ISSUE REPORT MODAL                          */}
      {/* ========================================================= */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {!isHelpSubmitted ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5">
                  <HelpCircle className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  مركز المساعدة والدعم الأكاديمي
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  تواجه صعوبة في الدخول أو في بيانات حسابك؟ اكتب تفاصيل المشكلة وسيقوم فريق الدعم بمتابعتها معك فوراً دون الحاجة لتسجيل الدخول.
                </p>

                <form onSubmit={handleHelpSubmit} className="space-y-3">
                  {/* Field: Identifier / Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الرقم القومي أو رقم الهاتف للتواصل
                    </label>
                    <input
                      type="text"
                      value={helpIdentifier}
                      onChange={(e) => setHelpIdentifier(e.target.value)}
                      placeholder="مثال: الرقم القومي 14 رقم أو 010xxxxxxxx"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium"
                    />
                  </div>

                  {/* Field: Issue Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نوع المشكلة
                    </label>
                    <select
                      value={helpIssueType}
                      onChange={(e) => setHelpIssueType(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium cursor-pointer"
                    >
                      <option value="login_issue">صعوبة في تسجيل الدخول بالرقم القومي</option>
                      <option value="password_issue">نسيان أو فقدان كلمة المرور</option>
                      <option value="account_inactive">الحساب غير مفعل لدى شؤون الطلاب</option>
                      <option value="technical_bug">عطل تقني أو خطأ في المنصة</option>
                      <option value="other">استفسار أو مشكلة أخرى</option>
                    </select>
                  </div>

                  {/* Field: Problem Details */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تفاصيل المشكلة <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={helpMessage}
                      onChange={(e) => setHelpMessage(e.target.value)}
                      placeholder="اشرح المشكلة بالتفصيل لمساعدتك في أسرع وقت..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium resize-none"
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-1 space-y-2">
                    <button
                      type="submit"
                      disabled={isSubmittingHelp || !helpMessage.trim()}
                      className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingHelp ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جارٍ إرسال البلاغ...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال البلاغ لوحدة الدعم</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://wa.me/201000000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>تواصل مباشر عبر واتساب الدعم الفني</span>
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  تم استلام طلب المساعدة بنجاح
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-xs mx-auto">
                  تم تسجيل بلاغك وسيقوم مشرفو الدعم الفني بمراجعة البيانات والتواصل معك لحل المشكلة فوراً.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono mb-4">
                  رقم البلاغ: #TKT-8492
                </div>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(false)}
                  className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  حسناً، إغلاق
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


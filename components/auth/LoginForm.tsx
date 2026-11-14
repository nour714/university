'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  GraduationCap,
  MessageSquare,
  Send,
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { loginAction } from '@/app/auth/actions';
import { AuthCinematicShowcase } from '@/components/auth/AuthCinematicShowcase';

const ISSUE_TYPES = [
  { id: 'login_issue', label: 'صعوبة في تسجيل الدخول بالرقم القومي', icon: User },
  { id: 'password_issue', label: 'نسيان أو فقدان كلمة المرور', icon: Lock },
  { id: 'account_inactive', label: 'الحساب غير مفعل لدى شؤون الطلاب', icon: GraduationCap },
  { id: 'technical_bug', label: 'عطل تقني أو خطأ في المنصة', icon: AlertCircle },
  { id: 'other', label: 'استفسار أو مشكلة أخرى', icon: HelpCircle },
];

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
  const [isIssueTypeDropdownOpen, setIsIssueTypeDropdownOpen] = useState(false);
  const selectedIssue = ISSUE_TYPES.find(item => item.id === helpIssueType) || ISSUE_TYPES[0];
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const res = await loginAction({ identifier, password });
      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }

      if (res.mustChangePassword) {
        router.push('/account/change-password');
      } else {
        router.push('/');
      }
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالخادم. يرجى إعادة المحاولة.');
    } finally {
      setIsLoading(false);
    }
  };

  // Support seamless pull-to-refresh on mobile browsers & webviews
  useEffect(() => {
    let startY = 0;
    let isTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, select, button, [role="dialog"]')) {
        isTop = false;
        return;
      }
      if (window.scrollY <= 10) {
        startY = e.touches[0].clientY;
        isTop = true;
      } else {
        isTop = false;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTop) return;
      const endY = e.changedTouches[0].clientY;
      const diffY = endY - startY;
      if (diffY > 95) {
        window.location.reload();
      }
      isTop = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Handle Escape key for accessible modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isForgotModalOpen) setIsForgotModalOpen(false);
        if (isHelpModalOpen) setIsHelpModalOpen(false);
      }
    };
    if (isForgotModalOpen || isHelpModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isForgotModalOpen, isHelpModalOpen]);

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-[#091533] to-[#04091a] p-3 sm:p-5 relative select-none">
      
      {/* Background Decorative Layer (Bounded strictly to prevent layout jitter or mobile overflow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
        {/* 1. Subtle High-Tech Architectural Grid Matrix */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)] animate-grid-pulse" 
        />

        {/* 2. Floating Luminous AI Ambient Plasma Orbs */}
        <div 
          className="absolute -top-10 -right-10 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-blue-600/40 rounded-full blur-[70px] sm:blur-[100px] animate-aurora-1" 
        />
        <div 
          className="absolute -bottom-10 -left-10 w-96 sm:w-[580px] h-96 sm:h-[580px] bg-indigo-600/40 rounded-full blur-[70px] sm:blur-[100px] animate-aurora-2" 
        />
        <div 
          className="absolute top-1/3 left-1/4 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-cyan-400/20 rounded-full blur-[80px] sm:blur-[110px] animate-float-orb-3" 
        />

        {/* 3. Floating Neural Sparks / Data Nodes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[18%] right-[20%] w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa] animate-neural-drift" style={{ animationDelay: '0s' }} />
          <div className="absolute top-[32%] left-[15%] w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9] animate-neural-drift" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-[22%] right-[22%] w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_12px_#818cf8] animate-neural-drift" style={{ animationDelay: '2.5s' }} />
          <div className="absolute bottom-[30%] left-[18%] w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_10px_#93c5fd] animate-neural-drift" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-[48%] right-[8%] w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8] animate-neural-drift" style={{ animationDelay: '3.2s' }} />
          <div className="absolute top-[65%] left-[10%] w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-neural-drift" style={{ animationDelay: '0.7s' }} />
          <div className="absolute top-[12%] left-[30%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-neural-drift" style={{ animationDelay: '2.1s' }} />
          <div className="absolute bottom-[15%] left-[40%] w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_#a5b4fc] animate-neural-drift" style={{ animationDelay: '3.8s' }} />
        </div>

        {/* 4. Ambient Institutional Watermark Logo & Dynamic Energy Halo */}
        <div 
          className="absolute top-1 sm:-top-4 lg:-top-24 left-1/2 -translate-x-1/2 w-56 h-56 sm:w-72 sm:h-72 lg:w-[680px] lg:h-[680px] flex items-center justify-center pointer-events-none"
        >
          {/* Animated Energy Halo Ring behind Logo */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-600/30 via-cyan-400/25 to-indigo-600/30 blur-2xl animate-aura-spin opacity-70" />

          <div className="relative w-full h-full animate-logo-breathe brightness-125 contrast-110">
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
      </div>

      {/* 5. Top Institutional Brand Header (Desktop Only) */}
      <div className="hidden lg:flex absolute top-6 right-8 z-20 items-center gap-3.5 select-none pointer-events-none">
        <div className="w-16 h-16 flex items-center justify-center shrink-0">
          <Image
            src="/logo.png"
            alt="شعار كلية الذكاء الاصطناعي - جامعة كفر الشيخ"
            width={64}
            height={64}
            className="w-full h-full object-contain select-none drop-shadow-[0_2px_16px_rgba(59,130,246,0.85)]"
            priority
            unoptimized
          />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-lg font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            كلية الذكاء الاصطناعي
          </span>
          <span className="text-xs sm:text-sm font-bold text-blue-400 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            جامعة كفر الشيخ • البوابة الأكاديمية
          </span>
        </div>
      </div>

      {/* Mobile Floating Brand Badge (Cleanly positioned directly under the logo, above the card) */}
      <div className="lg:hidden flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 shadow-xl shadow-blue-950/60 mb-2.5 z-20 select-none">
        <span className="text-xs sm:text-sm font-black text-white tracking-wide drop-shadow-xs">
          كلية الذكاء الاصطناعي • جامعة كفر الشيخ
        </span>
      </div>

      {/* Main Container Card (Compact Form 46% & Expanded Showcase 54% with Timeline Divider) */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Login Form (Reduced to 46%)     */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[46%] p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between bg-white shrink-0">
          <div>
            {/* Form Title (Centered) */}
            <div className="mb-2 sm:mb-3 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-bold mb-1 border border-blue-200/60">
                <GraduationCap className="w-3 h-3 text-blue-600" />
                <span>العام الأكاديمي 2026/2027</span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight text-center">
                تسجيل الدخول إلى حسابك
              </h2>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3.5">
              {/* Field 1: National ID */}
              <div>
                <label htmlFor="loginIdentifier" className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم القومي <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="loginIdentifier"
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="مثال: الرقم القومي 14 رقم"
                    className="w-full h-10 sm:h-11 px-3.5 ps-9 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="loginPassword" className="text-xs font-bold text-slate-700">
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
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label htmlFor="loginRememberMe" className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="loginRememberMe"
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
                className="w-full h-10 sm:h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 mt-1"
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
          </div>

          {/* Footer Assistance */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500 font-medium">
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgotPasswordTitle"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
              aria-label="إغلاق نافذة استعادة كلمة المرور"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 id="forgotPasswordTitle" className="text-lg font-bold text-slate-900 mb-1.5">
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="helpCenterTitle"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
              aria-label="إغلاق نافذة مركز المساعدة"
            >
              <X className="w-4 h-4" />
            </button>

            {!isHelpSubmitted ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5">
                  <HelpCircle className="w-6 h-6" />
                </div>

                <h3 id="helpCenterTitle" className="text-lg font-bold text-slate-900 mb-1">
                  مركز المساعدة والدعم الأكاديمي
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  تواجه صعوبة في الدخول أو في بيانات حسابك؟ اكتب تفاصيل المشكلة وسيقوم فريق الدعم بمتابعتها معك فوراً دون الحاجة لتسجيل الدخول.
                </p>

                <form onSubmit={handleHelpSubmit} className="space-y-3">
                  {/* Field: Identifier / Phone */}
                  <div>
                    <label htmlFor="helpIdentifier" className="block text-xs font-bold text-slate-700 mb-1">
                      الرقم القومي أو رقم الهاتف للتواصل
                    </label>
                    <input
                      id="helpIdentifier"
                      type="text"
                      value={helpIdentifier}
                      onChange={(e) => setHelpIdentifier(e.target.value)}
                      placeholder="مثال: الرقم القومي 14 رقم أو 010xxxxxxxx"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium"
                    />
                  </div>

                  {/* Field: Issue Type (Custom Modern Dropdown) */}
                  <div className="relative">
                    <label id="issueTypeLabel" className="block text-xs font-bold text-slate-700 mb-1">
                      نوع المشكلة
                    </label>

                    <button
                      type="button"
                      aria-labelledby="issueTypeLabel"
                      aria-haspopup="listbox"
                      aria-expanded={isIssueTypeDropdownOpen}
                      onClick={() => setIsIssueTypeDropdownOpen(!isIssueTypeDropdownOpen)}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all outline-hidden font-medium flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <selectedIssue.icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{selectedIssue.label}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isIssueTypeDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>

                    {/* Custom Dropdown Menu */}
                    {isIssueTypeDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setIsIssueTypeDropdownOpen(false)} 
                        />
                        <div 
                          role="listbox" 
                          aria-labelledby="issueTypeLabel" 
                          className="absolute top-[calc(100%+4px)] right-0 left-0 z-40 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1 overflow-hidden animate-fadeIn"
                        >
                          {ISSUE_TYPES.map((type) => {
                            const isSelected = type.id === helpIssueType;
                            const TypeIcon = type.icon;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setHelpIssueType(type.id);
                                  setIsIssueTypeDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-xs text-right flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected 
                                    ? 'bg-blue-50 text-blue-700 font-bold' 
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    <TypeIcon className="w-3 h-3" />
                                  </div>
                                  <span className="truncate">{type.label}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mr-1.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Field: Problem Details */}
                  <div>
                    <label htmlFor="helpMessage" className="block text-xs font-bold text-slate-700 mb-1">
                      تفاصيل المشكلة <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="helpMessage"
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


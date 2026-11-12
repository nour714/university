'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  KeyRound, 
  Headphones, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Check, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  Copy,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Building2,
  CheckCircle2,
  Send,
  User,
  ChevronLeft
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { submitSupportTicketAction } from '@/app/settings/actions';
import { changePasswordAction } from '@/app/auth/actions';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { StudentProfile } from '@/types/student';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';

export function SettingsView({ student: initialStudent }: { student?: StudentProfile } = {}) {
  const [activeTab, setActiveTab] = useState<'password' | 'support'>('password');
  const { student: clientStudent } = useStudentProfile();
  const student = initialStudent || clientStudent;
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showSecurityTips, setShowSecurityTips] = useState(false);

  // Support form state
  const [supportCategory, setSupportCategory] = useState('technical');
  const [supportPriority, setSupportPriority] = useState('normal');
  const [ticketId, setTicketId] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { addNotification } = useNotifications();

  // Password validation checks (minimum 10 characters)
  const hasMinLength = newPassword.length >= 10;
  const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Password Strength Calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { percent: 0, label: '', barColor: 'bg-slate-200', textColor: 'text-slate-400' };
    let score = 0;
    if (hasMinLength) score++;
    if (hasLetters) score++;
    if (hasNumbers) score++;
    if (passwordsMatch) score++;

    if (score <= 1) return { percent: 25, label: 'ضعيفة', barColor: 'bg-rose-500', textColor: 'text-rose-600' };
    if (score <= 3) return { percent: 65, label: 'جيدة ومقبولة', barColor: 'bg-amber-500', textColor: 'text-amber-600' };
    return { percent: 100, label: 'قوية وممتازة', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' };
  };

  const strength = getPasswordStrength();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('يرجى كتابة كلمة المرور الحالية');
      return;
    }

    if (!hasMinLength || !hasLetters || !hasNumbers) {
      setPasswordError('كلمة المرور الجديدة يجب أن تحتوي على 10 خانات على الأقل وتجمع بين الحروف والأرقام');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة غير متطابقة مع التأكيد');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await changePasswordAction(currentPassword, newPassword);
      if (!res.success) {
        setPasswordError(res.error || 'تعذر تغيير كلمة المرور.');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      addNotification({
        title: 'تم تحديث كلمة المرور بنجاح',
        message: 'تم تغيير كلمة المرور لحسابك الأكاديمي بنجاح، يمكنك استخدام كلمة السر الجديدة في تسجيل الدخول القادم.',
        type: 'announcement',
        priority: 'urgent',
      });
    } catch {
      setPasswordError('حدث خطأ غير متوقع أثناء تغيير كلمة المرور. يرجى المحاولة لاحقاً.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportLoading(true);

    try {
      const selectedCategoryObj = categoryOptions.find((o) => o.value === supportCategory);
      const subject = `طلب دعم: ${selectedCategoryObj ? selectedCategoryObj.label : supportCategory}`;
      const res = await submitSupportTicketAction(supportCategory, subject, supportMessage);
      if (res.success && res.ticketNo) {
        setTicketId(res.ticketNo);
        setSupportSuccess(true);
        setSupportMessage('');

        addNotification({
          title: 'تم استلام طلب الدعم الفني',
          message: `تم إرسال تذكرتك برقم ${res.ticketNo} إلى وحدة الدعم الأكاديمي والتقني.`,
          type: 'announcement',
          priority: 'normal',
        });
      } else if (res.error) {
        alert(res.error);
      }
    } catch {
      // Fallback
    } finally {
      setSupportLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('support@ai-faculty.edu.eg');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

  const faqs = [
    {
      q: 'كيف يمكنني تفعيل أكواد المحاضرات والامتحانات؟',
      a: 'انتقل إلى صفحة "أكوادي" من شريط التنقل السفلي، ثم اكتب كود الاشتراك الرسمي واضغط تفعيل الكود ليتم فتح كافة السلايدات والاختبارات فوراً.'
    },
    {
      q: 'ماذا أفعل إذا نسيت كلمة المرور الخاصة بي؟',
      a: 'تواصل مباشرة مع الدعم الفني عبر زر الواتساب بالأسفل، أو أرسل تذكرة دعم موضحاً اسمك ورقمك القومي والأكاديمي لإعادة تعيينها.'
    },
    {
      q: 'هل يتطلب تنزيل سلايدات المحاضرات اتصالاً دائماً بالإنترنت؟',
      a: 'الملفات بصيغة PDF والسلايدات يتم حفظها في متصفحك بمجرد فتحها أول مرة، ويمكنك مراجعتها لاحقاً بدون الحاجة لتحميلها مجدداً.'
    },
    {
      q: 'كيف أقدم استفساراً بخصوص درجات الاختبارات؟',
      a: 'من تبويب الدعم الفني هنا، اختر التصنيف "استفسار عن اختبار أو مقرر" واكتب تفاصيل المادة والسؤال وسيتم تحويلها لمشرف الكنترول.'
    }
  ];

  const categoryOptions: SelectOption[] = [
    { value: 'technical', label: 'عطل تقني في المنصة', icon: <AlertCircle className="w-4 h-4 text-rose-500" /> },
    { value: 'code', label: 'مشكلة في كود تفعيل المقرر', icon: <KeyRound className="w-4 h-4 text-amber-500" /> },
    { value: 'exam', label: 'استفسار بخصوص اختبار أو نتيجة', icon: <HelpCircle className="w-4 h-4 text-blue-500" /> },
    { value: 'account', label: 'مشكلة في الحساب الأكاديمي', icon: <User className="w-4 h-4 text-indigo-500" /> },
    { value: 'other', label: 'استفسار عام', icon: <MessageSquare className="w-4 h-4 text-slate-400" /> },
  ];

  const priorityOptions: SelectOption[] = [
    { value: 'normal', label: 'عادية (خلال 24 ساعة)', badge: 'عادي' },
    { value: 'urgent', label: 'عاجلة (خلال ساعتين)', badge: 'عاجل' },
  ];

  return (
    <div className="space-y-3 sm:space-y-6 pb-28 sm:pb-24 lg:pb-12 max-w-6xl mx-auto">
      {/* ============================================================== */}
      {/* 1. HEADER SECTION                                              */}
      {/* Mobile-Optimized Compact Header vs Desktop Banner             */}
      {/* ============================================================== */}

      {/* MOBILE COMPACT HEADER (Only on mobile < sm) */}
      <div className="sm:hidden bg-gradient-to-l from-slate-900 via-[#172554] to-blue-900 rounded-2xl p-3.5 text-white shadow-md">
        {/* Top line: Breadcrumb link */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10 text-[11px]">
          <Link href="/" className="text-blue-200 hover:text-white flex items-center gap-1 font-semibold">
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
            <span>العودة للرئيسية</span>
          </Link>
          <span className="text-blue-300 font-bold">الإعدادات والدعم</span>
        </div>

        {/* Student Mini Profile Info */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0 border border-white/20">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-white truncate leading-tight">
                {student?.fullName || 'طالب أكاديمي'}
              </h1>
              <p className="text-[11px] text-blue-200/90 font-medium truncate mt-0.5">
                طالب • المستوى 3 • الذكاء الاصطناعي
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            حساب نشط
          </span>
        </div>
      </div>

      {/* DESKTOP HEADER BANNER (Hidden on mobile, shown on sm+) */}
      <div className="hidden sm:block space-y-4">
        <div className="bg-gradient-to-l from-[#172554] via-blue-900 to-indigo-900 rounded-3xl p-6 sm:px-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-2 text-xs text-blue-200/90 font-semibold">
              <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
              <span>/</span>
              <span className="text-white font-bold">الإعدادات والدعم الفني</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold mb-2 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>إدارة الحساب والمساعدة الأكاديمية</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              الإعدادات والدعم الفني
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed max-w-2xl">
              خصص إعدادات أمان حسابك الأكاديمي، وحدّث كلمة المرور، أو تواصل مباشرة مع فريق الدعم التقني لمساعدتك.
            </p>
          </div>
          <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
        </div>

        {/* Desktop Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 font-medium">حالة الحساب</p>
              <p className="text-sm font-extrabold text-slate-800 truncate">{student?.fullName || 'طالب أكاديمي'}</p>
              <span className="text-[10px] font-bold text-emerald-600">نشط وموثق</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">أمان كلمة السر</p>
              <p className="text-sm font-extrabold text-slate-800">مشفرة وآمنة</p>
              <p className="text-[10px] text-slate-400">آخر تغيير: الفصل الحالي</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">الدعم الفني</p>
              <p className="text-sm font-extrabold text-emerald-700">متاح الآن</p>
              <p className="text-[10px] text-slate-400">رد فوري عبر واتساب</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SEGMENTED TABS SWITCHER (Thumb-friendly & Compact)          */}
      {/* ============================================================== */}
      <div role="tablist" aria-label="خيارات الإعدادات" className="bg-slate-200/80 p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 shadow-2xs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'password'}
          onClick={() => setActiveTab('password')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'password'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>تغيير كلمة السر</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'support'}
          onClick={() => setActiveTab('support')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'support'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>الدعم والمساعدة</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. TAB 1: PASSWORD CHANGE & SECURITY                           */}
      {/* ============================================================== */}
      {activeTab === 'password' && (
        <div className="space-y-3 sm:space-y-6">
          {/* Main Password Form Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  تحديث كلمة المرور
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  أدخل كلمة السر الحالية ثم اختر كلمة سر جديدة وقوية
                </p>
              </div>
            </div>

            {/* Success Banner */}
            {passwordSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">تم حفظ كلمة المرور الجديدة بنجاح!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    يمكنك استخدام كلمة السر الجديدة في تسجيل الدخول القادم.
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {passwordError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">خطأ في البيانات</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">{passwordError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              {/* Field 1: Current Password */}
              <div>
                <label htmlFor="settingsCurrentPassword" className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الحالية <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="settingsCurrentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    className="w-full h-11 px-3.5 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm text-slate-900 transition-all outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 end-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showCurrentPassword ? 'إخفاء' : 'إظهار'}
                    aria-label={showCurrentPassword ? 'إخفاء كلمة المرور الحالية' : 'إظهار كلمة المرور الحالية'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 2: New Password */}
              <div>
                <label htmlFor="settingsNewPassword" className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الجديدة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="settingsNewPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="10 خانات على الأقل (حروف وأرقام)"
                    className="w-full h-11 px-3.5 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm text-slate-900 transition-all outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 end-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showNewPassword ? 'إخفاء' : 'إظهار'}
                    aria-label={showNewPassword ? 'إخفاء كلمة المرور الجديدة' : 'إظهار كلمة المرور الجديدة'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 3: Confirm Password */}
              <div>
                <label htmlFor="settingsConfirmPassword" className="block text-xs font-bold text-slate-700 mb-1">
                  تأكيد كلمة المرور الجديدة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="settingsConfirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور الجديدة"
                    className="w-full h-11 px-3.5 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm text-slate-900 transition-all outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 end-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? 'إخفاء' : 'إظهار'}
                    aria-label={showConfirmPassword ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Strength Progress Bar */}
              {newPassword.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">قوة كلمة المرور:</span>
                    <span className={`font-extrabold ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.barColor}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>8 خانات على الأقل</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasLetters ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>تحتوي على حروف</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasNumbers ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>تحتوي على أرقام</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>تطابق الكلمتين</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 mt-1"
              >
                {passwordLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ حفظ التغييرات...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>حفظ وتحديث كلمة المرور</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Compact Security Tips Card */}
          <div className="bg-blue-50/70 rounded-2xl p-3.5 sm:p-4 border border-blue-200/70">
            <button
              type="button"
              onClick={() => setShowSecurityTips(!showSecurityTips)}
              className="w-full flex items-center justify-between text-right text-xs sm:text-sm font-bold text-blue-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>إرشادات أمان الحساب الأكاديمي</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-blue-500 transition-transform duration-200 ${showSecurityTips ? 'rotate-180' : ''}`} />
            </button>

            {showSecurityTips && (
              <ul className="mt-2.5 pt-2.5 border-t border-blue-200/60 space-y-1.5 text-xs text-blue-800 animate-fadeIn">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>لا تشارك كلمة المرور أو أكواد المقررات مع أي شخص.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>تأكد من تسجيل الخروج عند استخدام حواسيب المعامل الجامعية.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>يُفضل تغيير كلمة المرور دورياً مع بداية كل فصل دراسي.</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 2: TECHNICAL SUPPORT & HELP                             */}
      {/* ============================================================== */}
      {activeTab === 'support' && (
        <div className="space-y-3 sm:space-y-5">
          {/* Quick Action Dock: WhatsApp + Email + Working Hours */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
            <p className="text-xs font-bold text-slate-800">قنوات التواصل المباشر:</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* WhatsApp direct chat button */}
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>واتساب الدعم</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {/* Email copy button */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الإيميل</span>
                  </>
                )}
              </button>
            </div>

            {/* Working Hours compact badge */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>الأحد - الخميس (8:30 ص - 3:30 م)</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                متاح الآن
              </span>
            </div>
          </div>

          {/* Ticket Submission Form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-3 mb-3.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  إرسال تذكرة / استفسار
                </h3>
                <p className="text-[11px] text-slate-500">
                  سيتم تحويل رسالتك إلى مسؤول الدعم الأكاديمي والرد داخل المنصة
                </p>
              </div>
            </div>

            {supportSuccess && (
              <div className="mb-3.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">تم إرسال تذكرتك بنجاح!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    رقم التذكرة: #{ticketId}. سيصلك إشعار بالرد قريباً.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSupportSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Custom Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نوع المشكلة
                  </label>
                  <CustomSelect
                    value={supportCategory}
                    onChange={setSupportCategory}
                    options={categoryOptions}
                    placeholder="اختر نوع المشكلة..."
                  />
                </div>

                {/* Priority Custom Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    درجة الأهمية
                  </label>
                  <CustomSelect
                    value={supportPriority}
                    onChange={setSupportPriority}
                    options={priorityOptions}
                    placeholder="اختر درجة الأهمية..."
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تفاصيل المشكلة أو الاستفسار <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="اكتب رسالتك أو رقم المادة..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm text-slate-900 transition-all outline-hidden resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={supportLoading || !supportMessage.trim()}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
              >
                {supportLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ إرسال التذكرة...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال طلب الدعم الآن</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                الأسئلة الشائعة والإجابات الفورية
              </h3>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/80 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3 text-right flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-100/70 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800">
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Physical Unit Footer Note */}
          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>وحدة تكنولوجيا المعلومات • الدور الأرضي بمبنى كلية الذكاء الاصطناعي</span>
          </div>
        </div>
      )}
    </div>
  );
}

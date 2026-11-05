'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  KeyRound, 
  Headphones, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Check, 
  MessageSquare, 
  Mail, 
  Clock, 
  ExternalLink,
  Copy,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Building2,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { CURRENT_STUDENT } from '@/data/student';

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<'password' | 'support'>('password');
  
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

  // Support form state
  const [supportCategory, setSupportCategory] = useState('technical');
  const [supportPriority, setSupportPriority] = useState('normal');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { addNotification } = useNotifications();

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('يرجى كتابة كلمة المرور الحالية');
      return;
    }

    if (!hasMinLength || !hasLetters || !hasNumbers) {
      setPasswordError('كلمة المرور الجديدة يجب أن تحتوي على 8 خانات على الأقل وتجمع بين الحروف والأرقام');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة غير متطابقة مع التأكيد');
      return;
    }

    setPasswordLoading(true);

    setTimeout(() => {
      setPasswordLoading(false);
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
    }, 900);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportLoading(true);

    setTimeout(() => {
      setSupportLoading(false);
      setSupportSuccess(true);
      setSupportMessage('');
      setSupportSubject('');

      addNotification({
        title: 'تم استلام طلب الدعم الفني',
        message: 'تم إرسال تذكرتك إلى وحدة الدعم الأكاديمي والتقني، وسيقوم مسؤول الدعم بمراجعتها والتواصل معك عبر المنصة.',
        type: 'announcement',
        priority: 'normal',
      });
    }, 800);
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
      a: 'يمكنك الانتقال إلى صفحة "أكوادي" من القائمة الجانبية أو شريط التنقل السفلي، ثم كتابة كود الاشتراك الرسمي المطبوع على الإيصال والضغط على "تفعيل الكود الأكاديمي" لتفتح لك كل الملفات فوراً.'
    },
    {
      q: 'ماذا أفعل إذا نسيت كلمة المرور الخاصة بي؟',
      a: 'يمكنك التواصل مباشرة مع الدعم الفني عبر الواتساب أو إرسال تذكرة دعم فني هنا مع توضيح اسمك الكامل ورقمك القومي والأكاديمي لإعادة تعيين كلمة السر.'
    },
    {
      q: 'هل يتطلب تنزيل سلايدات المحاضرات اتصالاً دائماً بالإنترنت؟',
      a: 'الملفات بصيغة PDF والسلايدات يتم حفظها في متصفحك أو جهازك بمجرد فتحها، ويمكنك الرجوع إليها دون الحاجة لتحميلها مجدداً.'
    },
    {
      q: 'كيف أقدم التماساً أو استفساراً بخصوص نتائج الاختبارات؟',
      a: 'من خلال قسم الدعم الفني، اختر التصنيف "استفسار عن اختبار أو مقرر" واكتب تفاصيل المقرر ورقم السؤال، وسيتم تحويلها لمشرف الكنترول الأكاديمي.'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-l from-[#172554] via-blue-900 to-indigo-900 rounded-2xl sm:rounded-3xl p-4 sm:py-6 sm:px-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          {/* Breadcrumb link back */}
          <div className="flex items-center gap-2 mb-2 text-xs text-blue-200/90">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1 font-semibold">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-white font-bold">الإعدادات والدعم الفني</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[11px] sm:text-xs font-bold mb-2 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>لوحة التحكم في الحساب والمساعدة</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            الإعدادات والدعم الفني
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl">
            خصص إعدادات أمان حسابك الأكاديمي، وقم بتحديث كلمة المرور، أو تواصل مباشرة مع فريق الدعم التقني لمساعدتك في أي وقت.
          </p>
        </div>

        {/* Ambient Decorative Blur */}
        <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Top Summary Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Student info */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium">حالة الحساب الأكاديمي</p>
            <p className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
              {CURRENT_STUDENT.fullName}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              حساب نشط وموثق
            </span>
          </div>
        </div>

        {/* Password Security Status */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">مستوى أمان كلمة السر</p>
            <p className="text-sm sm:text-base font-extrabold text-slate-800">
              كلمة مرور مشفرة
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">آخر تغيير: الفصل الحالي</p>
          </div>
        </div>

        {/* Technical Support Availability */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">حالة الدعم الفني</p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-700">
              متاح الآن للمساعدة
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">رد فوري عبر واتساب</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'password'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>تغيير كلمة السر والأمان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'support'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>الدعم الفني والمساعدة</span>
        </button>
      </div>

      {/* 4. Tab 1: Password Change Section */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  تحديث كلمة المرور
                </h2>
                <p className="text-xs text-slate-500">
                  قم بتعيين كلمة مرور قوية لحماية سجلاتك الأكاديمية ودرجاتك
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">تم حفظ كلمة المرور الجديدة بنجاح!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    تم تحديث بيانات الدخول. يُرجى تذكر كلمة السر الجديدة لاستخدامها في المرات القادمة.
                  </p>
                </div>
              </div>
            )}

            {passwordError && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">خطأ في البيانات</p>
                  <p className="text-xs text-rose-700 mt-0.5">{passwordError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  كلمة المرور الحالية <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    className="w-full h-11 px-3.5 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 end-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showCurrentPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  كلمة المرور الجديدة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة (8 خانات على الأقل)"
                    className="w-full h-11 px-3.5 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 end-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showNewPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  تأكيد كلمة المرور الجديدة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور الجديدة"
                    className="w-full h-11 px-3.5 pe-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 end-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Strength Checklist */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <p className="text-[11px] font-bold text-slate-600">شروط كلمة المرور الآمنة:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                    <span>8 خانات أو أكثر</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetters ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasLetters ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                    <span>تحتوي على حروف</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumbers ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNumbers ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                    <span>تحتوي على أرقام</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                    <span>تطابق الكلمتين</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
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

          {/* Security Best Practices Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-[#172554] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                إرشادات أمان الحساب
              </h3>
              <p className="text-xs text-blue-200/90 leading-relaxed mb-4">
                الحساب الأكاديمي يحتوي على بيانات تسجيلك ودرجاتك وأكوادك الخاصة. احرص على حمايته دائماً باتباع النصائح التالية:
              </p>

              <ul className="space-y-2.5 text-xs text-blue-100/90">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>لا تشارك كلمة المرور الخاصة بك أو أكوادك الأكاديمية مع أي شخص آخر.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>تأكد من تسجيل الخروج عند استخدام أجهزة المعامل أو الأجهزة المشتركة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>يُفضل تغيير كلمة المرور دورياً مع بداية كل فصل دراسي.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>هل واجهت مشكلة في الدخول؟</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                إذا تعذر عليك تذكر كلمة السر الحالية، يمكنك التوجه إلى قسم الدعم الفني لطلب إعادة تعيينها فوراً.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('support')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <span>الانتقال إلى الدعم الفني</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Technical Support Section */}
      {activeTab === 'support' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {/* WhatsApp */}
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white hover:bg-emerald-50/40 rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  محادثة واتساب المباشرة
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  تواصل مع مسؤول الدعم الفني والتقني فوراً لحل المشكلات العاجلة وأكواد المواد.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>فتح المحادثة الآن</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            {/* Email Support */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  البريد الإلكتروني للدعم
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  أرسل استفسارك الأكاديمي أو طلبات التسجيل الرسمية وسيتم الرد خلال ساعات.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-600 truncate max-w-[170px]">
                  support@ai-faculty.edu.eg
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
                  title="نسخ البريد الإلكتروني"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Working Hours & College Unit */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  مواعيد العمل والمقر
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  وحدة تكنولوجيا المعلومات والتعلم الإلكتروني - مبنى كلية الذكاء الاصطناعي.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium space-y-1">
                <div className="flex items-center justify-between">
                  <span>الأيام:</span>
                  <span className="font-bold text-slate-800">الأحد - الخميس</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الساعات:</span>
                  <span className="font-bold text-slate-800">8:30 ص - 3:30 م</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Form + FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Ticket Submission Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    إرسال تذكرة مساعدة / استفسار
                  </h2>
                  <p className="text-xs text-slate-500">
                    أرسل تفاصيل المشكلة وسيقوم مهندس الدعم بالرد عليك ومتابعة طلبك
                  </p>
                </div>
              </div>

              {supportSuccess && (
                <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">تم إرسال تذكرتك بنجاح!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      رقم التذكرة: #{Math.floor(100000 + Math.random() * 900000)}. سيصلك إشعار بالرد داخل المنصة.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      نوع المشكلة أو الاستفسار
                    </label>
                    <select
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden cursor-pointer"
                    >
                      <option value="technical">عطل تقني في المنصة</option>
                      <option value="code">مشكلة في كود تفعيل المقرر</option>
                      <option value="exam">استفسار بخصوص اختبار أو نتيجة</option>
                      <option value="account">مشكلة في الحساب الأكاديمي</option>
                      <option value="other">استفسار عام</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      درجة الأهمية
                    </label>
                    <select
                      value={supportPriority}
                      onChange={(e) => setSupportPriority(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden cursor-pointer"
                    >
                      <option value="normal">عادية (خلال 24 ساعة)</option>
                      <option value="urgent">عاجلة (خلال ساعتين)</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                    عنوان الموضوع
                  </label>
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="مثال: لم أتمكن من تحميل سلايدات مقرر الذكاء الاصطناعي"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                    تفاصيل الرسالة أو المشكلة <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="اشرح المشكلة بالتفصيل، ورقم المقرر أو رسالة الخطأ إن وجدت..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 transition-all outline-hidden resize-none"
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={supportLoading || !supportMessage.trim()}
                  className="w-full h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
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
            <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  الأسئلة الشائعة والإجابات الفورية
                </h3>
              </div>

              <div className="space-y-2.5 flex-1">
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
                        className="w-full p-3.5 text-right flex items-center justify-between gap-2 bg-slate-50/60 hover:bg-slate-100/60 transition-colors cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-800 flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  للمعاملات الإدارية الرسمية، يرجى زيارة مكتب شؤون الطلاب بالدور الأرضي.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings, 
  KeyRound, 
  Headphones, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Check, 
  X, 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Clock, 
  ExternalLink,
  Copy,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'password' | 'support'>('password');
  
  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Support form state
  const [supportCategory, setSupportCategory] = useState('tech');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { addNotification } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside on desktop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopPanelRef.current && 
        !desktopPanelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Lock body scroll on mobile and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPasswordError('');
      setPasswordSuccess(false);
      setSupportSuccess(false);
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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
        message: 'تم تأمين وتحديث كلمة مرور حسابك الأكاديمي بنجاح.',
        type: 'announcement',
      });
      setTimeout(() => {
        setIsOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess(false);
      }, 1200);
    }, 700);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportLoading(true);
    setTimeout(() => {
      setSupportLoading(false);
      setSupportSuccess(true);
      const ticketId = Math.floor(1000 + Math.random() * 9000);
      addNotification({
        title: `تم استلام تذكرة الدعم #${ticketId}`,
        message: 'تم إرسال استفسارك إلى فريق الدعم الأكاديمي والتقني، سيتم الرد عليك في أقرب وقت.',
        type: 'announcement',
      });
      setTimeout(() => {
        setSupportMessage('');
        setSupportSuccess(false);
      }, 2500);
    }, 600);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('support@ai.edu.eg');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const renderPanelBody = () => (
    <>
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-l from-slate-900 to-[#172554] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 shrink-0">
            <Settings className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              الإعدادات والدعم الأكاديمي
            </h3>
            <p className="text-[11px] text-blue-200/90 font-medium">
              تغيير كلمة السر وخدمات المساعدة الفنية
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          title="إغلاق"
          aria-label="إغلاق الإعدادات"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'password'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>تغيير كلمة السر</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'support'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>الدعم الفني والمساعدة</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] sm:max-h-[460px]">
        {/* TAB 1: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fadeIn">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم تحديث كلمة المرور بنجاح! جاري الحفظ...</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                كلمة المرور الحالية
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                  className="w-full px-3.5 py-2.5 pr-10 pl-10 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showCurrentPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  className="w-full px-3.5 py-2.5 pr-10 pl-10 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
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
                  className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading || passwordSuccess}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-3"
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

        {/* TAB 2: Technical Support */}
        {activeTab === 'support' && (
          <div className="space-y-4 text-right">
            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp direct chat */}
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">واتساب الدعم الأكاديمي</h4>
                    <p className="text-[10px] text-emerald-700 font-medium">محادثة فورية مع المشرف</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Email direct copy */}
              <button
                type="button"
                onClick={copyEmail}
                className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 transition-all flex items-center justify-between group shadow-2xs cursor-pointer text-right"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">بريد الكلية الفني</h4>
                    <p className="text-[10px] text-blue-700 font-medium">
                      {copiedEmail ? 'تم نسخ البريد بنجاح!' : 'support@ai.edu.eg'}
                    </p>
                  </div>
                </div>
                <Copy className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>

            {/* Support Hours Pill */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-medium">
                ساعات العمل الفني: يومياً من 8:00 صباحاً حتى 8:00 مساءً
              </span>
            </div>

            {/* Quick Ticket Form */}
            <form onSubmit={handleSupportSubmit} className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800">
                  إرسال تذكرة / استفسار فني سريع
                </h4>
                <span className="text-[10px] text-slate-500">فريق الدعم الفني</span>
              </div>

              {supportSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم إرسال طلبك بنجاح! سيتم التواصل معك عبر الإشعارات.</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  نوع المشكلة أو الاستفسار
                </label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                >
                  <option value="tech">مشكلة تقنية في الموقع</option>
                  <option value="content">صعوبة في تحميل أو فتح المحاضرات</option>
                  <option value="codes">مشكلة في تفعيل أكواد المقررات</option>
                  <option value="account">استفسار بخصوص الحساب الأكاديمي</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  تفاصيل الاستفسار
                </label>
                <textarea
                  required
                  rows={3}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="اكتب استفسارك أو المشكلة التي تواجهك بالتفصيل..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={supportLoading || !supportMessage.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-l from-slate-900 to-[#172554] hover:from-slate-800 hover:to-blue-900 text-white font-bold text-xs shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {supportLoading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 -scale-x-100" />
                    <span>إرسال التذكرة لفريق الدعم</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="relative">
      {/* Settings Trigger Button in Header */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 flex items-center justify-center border border-slate-200/90 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer group"
        aria-label="الإعدادات والدعم الفني"
        title="الإعدادات والدعم الفني"
        aria-expanded={isOpen}
      >
        <Settings className="w-4.5 h-4.5 sm:w-5 sm:h-5 group-hover:rotate-45 transition-transform duration-300" />
      </button>

      {/* 1. Desktop Popover Dropdown (sm and up) */}
      {isOpen && (
        <div
          ref={desktopPanelRef}
          className="hidden sm:flex absolute left-0 top-12 z-50 w-[420px] max-h-[580px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex-col overflow-hidden animate-fadeIn"
        >
          {renderPanelBody()}
        </div>
      )}

      {/* 2. Mobile Native Bottom Sheet via React Portal directly into document.body */}
      {mounted && isOpen && createPortal(
        <div className="sm:hidden">
          {/* Backdrop Overlay covering whole viewport */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet anchored to bottom of device screen */}
          <div
            className="fixed inset-x-0 bottom-0 z-[1000] w-full max-h-[85vh] bg-white rounded-t-[28px] border-t border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-slideUp"
          >
            {/* Mobile Drag Indicator Handle on Dark Navy Header */}
            <div className="w-full pt-2.5 pb-1 flex justify-center bg-gradient-to-l from-slate-900 to-[#172554] shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-400/60" />
            </div>

            {renderPanelBody()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

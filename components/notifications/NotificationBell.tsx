'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  BookOpen, 
  ClipboardCheck, 
  Sparkles, 
  FileText, 
  X, 
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { AcademicNotification, NotificationType } from '@/types/notification';

export function NotificationBell() {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    simulateLectureNotification,
    simulateExamNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | NotificationType>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside on desktop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
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

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter notifications by tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'exam':
        return <ClipboardCheck className="w-4 h-4 text-rose-600" />;
      case 'material':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'announcement':
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'lecture':
        return 'محاضرة';
      case 'exam':
        return 'اختبار';
      case 'material':
        return 'محتوى';
      case 'announcement':
        return 'إعلان';
    }
  };

  const handleNotificationClick = (notif: AcademicNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 flex items-center justify-center border border-slate-200/90 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer group"
        aria-label="الإشعارات الأكاديمية"
        title="الإشعارات الأكاديمية"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:rotate-12 transition-transform duration-200" />
        
        {/* Unread Badge with Pulse Ring */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Panel (Bottom Sheet on Mobile, Popover Dropdown on Desktop) */}
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel Container */}
          <div
            ref={panelRef}
            className="fixed inset-x-0 bottom-0 sm:bottom-auto sm:inset-x-auto sm:absolute sm:left-0 sm:top-12 z-50 w-full sm:w-[420px] max-h-[88vh] sm:max-h-[580px] bg-white rounded-t-[28px] sm:rounded-3xl border-t sm:border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-slideUp sm:animate-fadeIn"
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-gradient-to-l from-slate-900 to-[#172554]">
              <div className="w-12 h-1.5 rounded-full bg-slate-400/60" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-l from-slate-900 to-[#172554] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    الإشعارات الأكاديمية
                  </h3>
                  <p className="text-[11px] text-blue-200/90 font-medium">
                    {unreadCount > 0 ? `${unreadCount} إشعار جديد غير مقروء` : 'جميع الإشعارات مقروءة'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-blue-100 hover:text-white bg-blue-500/25 hover:bg-blue-500/35 active:scale-95 rounded-xl border border-blue-400/30 transition-all cursor-pointer"
                    title="تحديد الكل كمقروء"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>قراءة الكل</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-colors cursor-pointer"
                  aria-label="إغلاق الإشعارات"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter Tabs (Swipeable on Mobile) */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/70 shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                الكل ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lecture')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  activeTab === 'lecture'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                المحاضرات ({notifications.filter((n) => n.type === 'lecture').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('exam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  activeTab === 'exam'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                الاختبارات ({notifications.filter((n) => n.type === 'exam').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('announcement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  activeTab === 'announcement'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                إعلانات ({notifications.filter((n) => n.type === 'announcement').length})
              </button>
            </div>

            {/* Notifications Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-2.5 space-y-1.5">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer relative group flex items-start gap-3 active:scale-[0.99] ${
                      !notif.isRead
                        ? 'bg-blue-50/80 border border-blue-200/80 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {getTypeLabel(notif.type)}
                          </span>
                          {notif.courseCode && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                              {notif.courseCode}
                            </span>
                          )}
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {notif.timeAgo}
                        </span>
                      </div>

                      <h4 className={`text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-1 ${!notif.isRead ? 'font-extrabold' : ''}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-2">
                        {notif.message}
                      </p>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-800">
                          <span>عرض المقرر الآن</span>
                          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notif.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                          title="حذف الإشعار"
                          aria-label="حذف الإشعار"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Empty state for the tab */
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    لا توجد إشعارات في هذا القسم
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                    أي تحديث جديد للمحاضرات أو الاختبارات سيظهر لك هنا فوراً.
                  </p>
                </div>
              )}
            </div>

            {/* Footer with Instant Testing Buttons & Course Link */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              {/* Quick Testing buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
                <button
                  type="button"
                  onClick={simulateLectureNotification}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-800 active:scale-95 transition-all cursor-pointer text-center"
                  title="محاكاة نزول محاضرة جديدة"
                >
                  + تجربة محاضرة
                </button>
                <button
                  type="button"
                  onClick={simulateExamNotification}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 active:scale-95 transition-all cursor-pointer text-center"
                  title="محاكاة إشعار اختبار"
                >
                  + تجربة اختبار
                </button>
              </div>

              <Link
                href="/courses"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1"
              >
                تصفح كافة المقررات الدراسية ←
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

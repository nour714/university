'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  BookOpen, 
  ClipboardCheck, 
  Sparkles, 
  FileText, 
  X, 
  ExternalLink,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { AcademicNotification, NotificationType } from '@/types/notification';

export function NotificationBell() {
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
        return 'ملف';
      case 'announcement':
        return 'إعلان';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 flex items-center justify-center border border-slate-200/90 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer group"
        aria-label="الإشعارات الأكاديمية"
        title="الإشعارات الأكاديمية"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:rotate-12 transition-transform duration-200" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Panel / Drawer */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel Container */}
          <div
            ref={panelRef}
            className="fixed inset-x-2 bottom-2 sm:bottom-auto sm:inset-x-auto sm:absolute sm:left-0 sm:top-12 z-50 w-auto sm:w-[410px] max-h-[85vh] sm:max-h-[580px] bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-l from-slate-900 to-[#172554] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    الإشعارات الأكاديمية
                  </h3>
                  <p className="text-[10px] text-blue-200/80 font-medium">
                    {unreadCount > 0 ? `${unreadCount} إشعار جديد غير مقروء` : 'جميع الإشعارات مقروءة'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-200 hover:text-white bg-blue-500/20 hover:bg-blue-500/30 px-2 py-1 rounded-lg border border-blue-400/20 transition-all cursor-pointer"
                    title="تحديد الكل كمقروء"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قراءة الكل</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Testing Simulator Bar */}
            <div className="bg-slate-50/90 border-b border-slate-200/80 p-2 sm:px-3 sm:py-2 flex items-center justify-between gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                تجربة فورية:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={simulateLectureNotification}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-800 transition-all active:scale-95 cursor-pointer"
                  title="محاكاة نزول محاضرة جديدة"
                >
                  + محاضرة جديدة
                </button>
                <button
                  type="button"
                  onClick={simulateExamNotification}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 transition-all active:scale-95 cursor-pointer"
                  title="محاكاة إشعار اختبار"
                >
                  + إشعار اختبار
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-white shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                الكل ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lecture')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'lecture'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                المحاضرات ({notifications.filter((n) => n.type === 'lecture').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('exam')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'exam'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                الاختبارات ({notifications.filter((n) => n.type === 'exam').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('announcement')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'announcement'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                إعلانات ({notifications.filter((n) => n.type === 'announcement').length})
              </button>
            </div>

            {/* Notifications Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1 sm:p-2 space-y-1">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 sm:p-3 rounded-xl transition-all relative group flex items-start gap-2.5 ${
                      !notif.isRead
                        ? 'bg-blue-50/70 border border-blue-200/60 shadow-2xs'
                        : 'bg-white hover:bg-slate-50/80 border border-transparent'
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {getTypeLabel(notif.type)}
                          </span>
                          {notif.courseCode && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-blue-100/80 text-blue-700 border border-blue-200 shrink-0">
                              {notif.courseCode}
                            </span>
                          )}
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {notif.timeAgo}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug mb-0.5">
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-2 line-clamp-2">
                        {notif.message}
                      </p>

                      {/* Action Link & Dismiss */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                        {notif.actionUrl ? (
                          <Link
                            href={notif.actionUrl}
                            onClick={() => {
                              markAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span>عرض التفاصيل</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : <span />}

                        <div className="flex items-center gap-1">
                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notif.id)}
                              className="text-[10px] text-blue-600 hover:underline px-1.5 py-0.5 font-medium cursor-pointer"
                            >
                              تعليم كمقروء
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeNotification(notif.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف الإشعار"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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
                    لا توجد إشعارات حالياً
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    أي تحديث جديد للمحاضرات أو الاختبارات سيظهر لك هنا فوراً.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 text-center shrink-0">
              <Link
                href="/courses"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
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


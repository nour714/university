'use client';

import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
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
import { safeInternalPath } from '@/lib/safeUrl';

const emptySubscribe = () => () => {};

export function NotificationBell() {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [activeTab, setActiveTab] = useState<'all' | NotificationType>('all');
  
  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      router.push(safeInternalPath(notif.actionUrl));
    }
  };

  // Shared inner content for both desktop dropdown and mobile bottom sheet
  const renderPanelBody = () => (
    <>
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
            aria-label="إغلاق الإشعارات"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div role="tablist" aria-label="أقسام الإشعارات" className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/70 shrink-0 overflow-x-auto no-scrollbar">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
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
          role="tab"
          aria-selected={activeTab === 'lecture'}
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
          role="tab"
          aria-selected={activeTab === 'exam'}
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
          role="tab"
          aria-selected={activeTab === 'announcement'}
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
    </>
  );

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 flex items-center justify-center border border-slate-200/90 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer group"
        aria-label="الإشعارات الأكاديمية"
        title="الإشعارات الأكاديمية"
      >
        <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-200" />
        
        {/* Unread Badge with Pulse Ring */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {/* 1. Desktop Popover Dropdown (sm and up) */}
      {isOpen && (
        <div
          ref={desktopPanelRef}
          role="dialog"
          aria-label="الإشعارات الأكاديمية"
          className="hidden sm:flex absolute left-0 top-12 z-50 w-[420px] max-h-[580px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex-col overflow-hidden animate-fadeIn"
        >
          {renderPanelBody()}
        </div>
      )}

      {/* 2. Mobile Native Bottom Sheet via React Portal directly into document.body */}
      {mounted && isOpen && createPortal(
        <div className="sm:hidden" role="dialog" aria-modal="true" aria-label="الإشعارات الأكاديمية">
          {/* Backdrop Overlay covering whole viewport */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet anchored to bottom of device screen */}
          <div
            className="fixed inset-x-0 bottom-0 z-[1000] w-full max-h-[85vh] bg-white rounded-t-[28px] border-t border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-slideUp"
          >
            {/* Mobile Drag Indicator Handle */}
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

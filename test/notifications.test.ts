import { describe, it, expect } from 'vitest';
import { 
  matchesNotificationTab, 
  calculateNotificationTabCounts 
} from '@/lib/notifications/tabs';
import { AcademicNotification, NotificationType } from '@/types/notification';

describe('Notification Tab Filter & Math Integrity (Phase 7)', () => {
  const allNotificationTypes: NotificationType[] = [
    'lecture',
    'course',
    'exam',
    'material',
    'announcement',
    'system',
    'security'
  ];

  it('ensures every single NotificationType maps to exactly ONE sub-tab', () => {
    for (const type of allNotificationTypes) {
      const inLecture = matchesNotificationTab(type, 'lecture');
      const inExam = matchesNotificationTab(type, 'exam');
      const inAnnouncement = matchesNotificationTab(type, 'announcement');

      const matchCount = Number(inLecture) + Number(inExam) + Number(inAnnouncement);
      expect(matchCount).toBe(1);
    }
  });

  it('guarantees that sub-tab counts strictly sum to total notifications (sum === الكل)', () => {
    const mockNotifications: AcademicNotification[] = [
      {
        id: 'n1',
        type: 'course',
        title: 'محاضرة جديدة',
        message: 'تم رفع المحاضرة 03',
        timeAgo: 'منذ ساعتين',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: 'n2',
        type: 'lecture',
        title: 'تسجيل المعمل',
        message: 'تسجيل المعمل متوفر الآن',
        timeAgo: 'منذ يوم',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
      {
        id: 'n3',
        type: 'exam',
        title: 'موعد الاختبار النصفي',
        message: 'الاختبار الأسبوع القادم',
        timeAgo: 'منذ 3 ساعات',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: 'n4',
        type: 'security',
        title: 'تنبيه أمني',
        message: 'تم تسجيل الدخول من جهاز جديد',
        timeAgo: 'منذ 4 ساعات',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: 'n5',
        type: 'system',
        title: 'صيانة النظام',
        message: 'صيانة مجدولة للمنصة',
        timeAgo: 'منذ يومين',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
      {
        id: 'n6',
        type: 'announcement',
        title: 'إعلان الكلية',
        message: 'انطلاق الهاكاثون السنوي',
        timeAgo: 'منذ 3 أيام',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
      {
        id: 'n7',
        type: 'material',
        title: 'شيت التمارين',
        message: 'شيت رقم 1 في التعلم العميق',
        timeAgo: 'منذ 5 ساعات',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ];

    const counts = calculateNotificationTabCounts(mockNotifications);

    expect(counts.all).toBe(7);
    expect(counts.lecture).toBe(3); // course + lecture + material
    expect(counts.exam).toBe(1); // exam
    expect(counts.announcement).toBe(3); // security + system + announcement

    const subTabSum = counts.lecture + counts.exam + counts.announcement;
    expect(subTabSum).toBe(counts.all);
  });

  it('returns zeroes for an empty notifications list and preserves sum === الكل', () => {
    const counts = calculateNotificationTabCounts([]);
    expect(counts.all).toBe(0);
    expect(counts.lecture).toBe(0);
    expect(counts.exam).toBe(0);
    expect(counts.announcement).toBe(0);
    expect(counts.lecture + counts.exam + counts.announcement).toBe(counts.all);
  });
});

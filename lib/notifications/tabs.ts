import { AcademicNotification, NotificationType } from '@/types/notification';

export type NotificationTabKey = 'all' | 'lecture' | 'exam' | 'announcement';

export function matchesNotificationTab(type: NotificationType, tab: NotificationTabKey): boolean {
  if (tab === 'all') return true;
  if (tab === 'lecture') return type === 'lecture' || type === 'course' || type === 'material';
  if (tab === 'exam') return type === 'exam';
  if (tab === 'announcement') return type === 'announcement' || type === 'system' || type === 'security';
  return false;
}

export function calculateNotificationTabCounts(notifications: AcademicNotification[]): {
  all: number;
  lecture: number;
  exam: number;
  announcement: number;
} {
  const lecture = notifications.filter((n) => matchesNotificationTab(n.type, 'lecture')).length;
  const exam = notifications.filter((n) => matchesNotificationTab(n.type, 'exam')).length;
  const announcement = notifications.filter((n) => matchesNotificationTab(n.type, 'announcement')).length;
  return {
    all: notifications.length,
    lecture,
    exam,
    announcement,
  };
}

import { AcademicNotification } from '@/types/notification';
import { listNotificationsAction, markAllNotificationsReadAction } from '@/app/notifications/actions';

export async function listNotifications(): Promise<AcademicNotification[]> {
  try {
    return await listNotificationsAction();
  } catch {
    return [];
  }
}

export async function saveNotifications(list: AcademicNotification[]): Promise<void> {
  const hasUnread = list.some((n) => !n.isRead);
  if (!hasUnread) {
    try {
      await markAllNotificationsReadAction();
    } catch {
      // Ignore background error
    }
  }
}

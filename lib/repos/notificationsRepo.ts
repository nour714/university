import { AcademicNotification } from '@/types/notification';
import { listNotificationsAction } from '@/app/notifications/actions';

export async function listNotifications(): Promise<AcademicNotification[]> {
  try {
    return await listNotificationsAction();
  } catch {
    return [];
  }
}

export async function saveNotifications(_list: AcademicNotification[]): Promise<void> {
  void _list;
  // State is managed reactively in memory and explicit mutations trigger Server Actions.
}

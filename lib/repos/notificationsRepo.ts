import { AcademicNotification } from '@/types/notification';
import { INITIAL_NOTIFICATIONS } from '@/data/notifications';
import { AcademicNotificationListSchema } from '@/lib/schemas';

const STORAGE_KEY = 'academic_notifications_v1';

export async function listNotifications(): Promise<AcademicNotification[]> {
  if (typeof window === 'undefined') {
    return INITIAL_NOTIFICATIONS;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = AcademicNotificationListSchema.safeParse(JSON.parse(saved));
    if (parsed.success) {
      return parsed.data;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    return INITIAL_NOTIFICATIONS;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    return INITIAL_NOTIFICATIONS;
  }
}

export async function saveNotifications(list: AcademicNotification[]): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

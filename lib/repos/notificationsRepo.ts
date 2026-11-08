import { AcademicNotification } from '@/types/notification';

export async function listNotifications(): Promise<AcademicNotification[]> {
  try {
    const res = await fetch('/api/notifications', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.notifications) ? data.notifications : [];
  } catch {
    return [];
  }
}

export async function saveNotifications(_list: AcademicNotification[]): Promise<void> {
  void _list;
  // State is managed reactively in memory and explicit mutations trigger Server Actions.
}

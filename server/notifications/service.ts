'use server';

import 'server-only';
import { appSql } from '@/lib/db/app.server';
import { AcademicNotification, NotificationType } from '@/types/notification';

export async function listNotificationsForStudent(studentAccountId: string): Promise<AcademicNotification[]> {
  const rows = await appSql`
    SELECT 
      id,
      title,
      message,
      type,
      priority,
      is_read,
      action_url,
      action_label,
      created_at
    FROM public.academic_notifications
    WHERE student_id = ${studentAccountId}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return rows.map((r) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(r.created_at).getTime()) / (60 * 1000));
    let timeAgo = 'الآن';
    if (elapsedMinutes >= 60 * 24) {
      timeAgo = `منذ ${Math.floor(elapsedMinutes / (60 * 24))} يوم`;
    } else if (elapsedMinutes >= 60) {
      timeAgo = `منذ ${Math.floor(elapsedMinutes / 60)} ساعة`;
    } else if (elapsedMinutes > 0) {
      timeAgo = `منذ ${elapsedMinutes} دقيقة`;
    }

    return {
      id: r.id,
      title: r.title,
      message: r.message,
      type: (r.type || 'system') as NotificationType,
      isRead: Boolean(r.is_read),
      actionUrl: r.action_url || undefined,
      createdAt: new Date(r.created_at).toISOString(),
      timeAgo,
      priority: (r.priority === 'urgent' ? 'urgent' : 'normal') as 'normal' | 'urgent',
    };
  });
}

export async function markNotificationReadForStudent(studentAccountId: string, id: string): Promise<void> {
  await appSql`
    UPDATE public.academic_notifications
       SET is_read = true
     WHERE id = ${id} AND student_id = ${studentAccountId}
  `;
}

export async function markAllNotificationsReadForStudent(studentAccountId: string): Promise<void> {
  await appSql`
    UPDATE public.academic_notifications
       SET is_read = true
     WHERE student_id = ${studentAccountId}
  `;
}

export async function deleteNotificationForStudent(studentAccountId: string, id: string): Promise<void> {
  await appSql`
    DELETE FROM public.academic_notifications
     WHERE id = ${id} AND student_id = ${studentAccountId}
  `;
}

'use server';

import 'server-only';
import { appSql } from '@/lib/db/app.server';
import { requireAuth } from '@/server/auth/requireAuth';
import { AcademicNotification } from '@/types/notification';

export async function listNotificationsAction(): Promise<AcademicNotification[]> {
  const student = await requireAuth();

  const rows = await appSql`
    SELECT 
      id,
      title,
      message,
      type,
      is_read,
      action_url,
      action_label,
      created_at
    FROM public.academic_notifications
    WHERE student_id = ${student.accountId}
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
      type: (r.type === 'course' ? 'lecture' : r.type === 'exam' ? 'exam' : 'lecture') as 'lecture' | 'exam',
      isRead: r.is_read,
      actionUrl: r.action_url || undefined,
      createdAt: new Date(r.created_at).toISOString(),
      timeAgo,
      priority: 'normal' as const,
    };
  });
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const student = await requireAuth();
  await appSql`
    UPDATE public.academic_notifications
       SET is_read = true
     WHERE id = ${id} AND student_id = ${student.accountId}
  `;
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const student = await requireAuth();
  await appSql`
    UPDATE public.academic_notifications
       SET is_read = true
     WHERE student_id = ${student.accountId}
  `;
}

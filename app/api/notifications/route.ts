import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionCookie } from '@/server/auth/cookies';
import { validateSession } from '@/server/auth/session';
import { appSql } from '@/lib/db/app.server';
import { NotificationType } from '@/types/notification';

export async function GET() {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ notifications: [] });
  }

  const student = await validateSession(token);
  if (!student) {
    return NextResponse.json({ notifications: [] });
  }

  try {
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
      WHERE student_id = ${student.accountId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const notifications = rows.map((r) => {
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

    return NextResponse.json(
      { notifications },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    return NextResponse.json({ notifications: [] });
  }
}

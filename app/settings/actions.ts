'use server';

import 'server-only';
import { z } from 'zod';
import { appSql } from '@/lib/db/app.server';
import { requireAuth } from '@/server/auth/requireAuth';
import { checkRateLimit } from '@/server/security/rateLimit';

const SupportTicketSchema = z.object({
  category: z.enum(['technical', 'academic', 'codes', 'inquiry', 'complaint']),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10, 'تفاصيل التذكرة يجب أن لا تقل عن 10 أحرف').max(2000),
});

export async function submitSupportTicketAction(
  category: string,
  subject: string,
  message: string
): Promise<{ success: boolean; ticketNo?: string; error?: string }> {
  const student = await requireAuth();

  const parsed = SupportTicketSchema.safeParse({ category, subject, message });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'البيانات المدخلة غير صالحة' };
  }

  // Rate limit: 5 tickets per hour
  const rateLimit = await checkRateLimit(student.accountId, 'ticket', 5, 3600);
  if (!rateLimit.allowed) {
    return { success: false, error: 'تم تجاوز الحد الأقصى لإرسال تذاكر الدعم (5 تذاكر في الساعة). يرجى المحاولة لاحقاً.' };
  }

  try {
    const [ticket] = await appSql`
      INSERT INTO public.academic_support_tickets (
        student_id, category, subject, message, status, priority
      ) VALUES (
        ${student.accountId}, ${parsed.data.category}, ${parsed.data.subject},
        ${parsed.data.message}, 'open', 'medium'
      ) RETURNING ticket_no;
    `;

    await appSql`
      INSERT INTO public.academic_notifications (
        student_id, title, message, type, action_url, action_label
      ) VALUES (
        ${student.accountId},
        'تم استلام تذكرة الدعم بنجاح',
        ${'تم تسجيل تذكرتك رقم ' + ticket.ticket_no + ' وسيقوم فريق الدعم بمراجعتها والتواصل معك.'},
        'system',
        '/settings',
        'عرض التذكرة'
      )
    `;

    return { success: true, ticketNo: ticket.ticket_no };
  } catch (err) {
    console.error('Failed to submit support ticket:', err);
    return { success: false, error: 'حدث خطأ أثناء حفظ التذكرة. يرجى المحاولة لاحقاً.' };
  }
}

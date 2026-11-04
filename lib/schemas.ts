import { z } from 'zod';
import { safeInternalPath } from '@/lib/safeUrl';

export const StudentCodeSchema = z.object({
  id: z.string().max(500),
  code: z.string().max(500),
  courseCode: z.string().max(500),
  courseName: z.string().max(500),
  courseId: z.string().max(500),
  doctorName: z.string().max(500),
  receiptNumber: z.string().max(500),
  activatedAt: z.string().max(500),
  semester: z.string().max(500),
  status: z.enum(['active', 'expired']),
});

export const StudentCodeListSchema = z.array(StudentCodeSchema).max(200);

export const AcademicNotificationSchema = z.object({
  id: z.string().max(500),
  type: z.enum(['lecture', 'exam', 'material', 'announcement']),
  title: z.string().max(500),
  message: z.string().max(500),
  courseCode: z.string().max(500).optional(),
  courseName: z.string().max(500).optional(),
  courseId: z.string().max(500).optional(),
  timeAgo: z.string().max(500),
  createdAt: z.string().max(500),
  isRead: z.boolean(),
  priority: z.enum(['normal', 'urgent']).optional(),
  actionUrl: z
    .string()
    .max(500)
    .optional()
    .transform((val) => (val !== undefined ? safeInternalPath(val) : undefined)),
});

export const AcademicNotificationListSchema = z.array(AcademicNotificationSchema).max(200);
export const NotificationListSchema = AcademicNotificationListSchema;

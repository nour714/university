export type NotificationType =
  | 'lecture'
  | 'course'
  | 'exam'
  | 'material'
  | 'announcement'
  | 'system'
  | 'security';

export interface AcademicNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  courseCode?: string;
  courseName?: string;
  courseId?: string;
  timeAgo: string;
  createdAt: string;
  isRead: boolean;
  priority?: 'normal' | 'urgent';
  actionUrl?: string;
}

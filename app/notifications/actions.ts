'use server';

import 'server-only';
import { requireAuth } from '@/server/auth/requireAuth';
import {
  listNotificationsForStudent,
  markNotificationReadForStudent,
  markAllNotificationsReadForStudent,
  deleteNotificationForStudent,
} from '@/server/notifications/service';
import { AcademicNotification } from '@/types/notification';

export async function listNotificationsAction(): Promise<AcademicNotification[]> {
  const student = await requireAuth();
  return listNotificationsForStudent(student.accountId);
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const student = await requireAuth();
  await markNotificationReadForStudent(student.accountId, id);
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const student = await requireAuth();
  await markAllNotificationsReadForStudent(student.accountId);
}

export async function deleteNotificationAction(id: string): Promise<void> {
  const student = await requireAuth();
  await deleteNotificationForStudent(student.accountId, id);
}

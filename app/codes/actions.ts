'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/server/auth/requireAuth';
import { checkRateLimit } from '@/server/security/rateLimit';
import {
  listStudentCodes,
  redeemCodeForStudent,
  checkEnrollmentKey,
  CodeInputSchema,
  CheckEnrollmentKeyResult,
} from '@/server/codes/service';
import { StudentCode } from '@/types/code';

export async function listStudentCodesAction(): Promise<StudentCode[]> {
  const student = await requireAuth();
  return listStudentCodes(student.accountId);
}

export async function checkEnrollmentKeyAction(rawCode: string): Promise<CheckEnrollmentKeyResult> {
  const student = await requireAuth();

  const parsed = CodeInputSchema.safeParse(rawCode);
  if (!parsed.success) {
    return { valid: false, error: 'تنسيق الكود غير صحيح، يرجى التأكد من كتابة الكود بشكل سليم.' };
  }

  return checkEnrollmentKey(rawCode, student.accountId);
}

export async function redeemCodeAction(
  rawCode: string
): Promise<{ success: boolean; data?: StudentCode; error?: string }> {
  const student = await requireAuth();

  const parsed = CodeInputSchema.safeParse(rawCode);
  if (!parsed.success) {
    return { success: false, error: 'تنسيق الكود غير صحيح، يرجى التأكد من كتابة الكود بشكل سليم.' };
  }

  // Rate limit check: maximum 5 attempts per 15 minutes per student
  const rateLimit = await checkRateLimit(student.accountId, 'redeem', 5, 900);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'تم تجاوز عدد محاولات إدخال الأكواد المسموح بها. يرجى الانتظار 15 دقيقة ثم المحاولة مجدداً.',
    };
  }

  const result = await redeemCodeForStudent(student.accountId, rawCode);
  if (result.success) {
    revalidatePath('/courses');
    revalidatePath('/courses/[id]', 'page');
    revalidatePath('/exams');
    revalidatePath('/codes');
    revalidatePath('/', 'layout');
  }

  return result;
}

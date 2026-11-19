'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { requireAuth } from '@/server/auth/requireAuth';
import { checkRateLimit } from '@/server/security/rateLimit';
import { extractClientIp } from '@/server/security/clientIp';
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

  const h = await headers();
  const clientIp = extractClientIp(h);

  // Rate limit key inspection: 15 per 15 minutes per student & 30 per IP to prevent code enumeration
  const studentRate = await checkRateLimit(student.accountId, 'redeem', 15, 900);
  if (!studentRate.allowed) {
    return { valid: false, error: 'تم تجاوز عدد محاولات فحص الأكواد المسموح بها. يرجى الانتظار 15 دقيقة.' };
  }
  const ipRate = await checkRateLimit(clientIp, 'redeem', 30, 900);
  if (!ipRate.allowed) {
    return { valid: false, error: 'تم تجاوز عدد محاولات فحص الأكواد من هذا الجهاز. يرجى الانتظار 15 دقيقة.' };
  }

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

  const h = await headers();
  const clientIp = extractClientIp(h);

  // Multi-tier Rate Limiting:
  // 1. Per-IP rate limit: maximum 20 redemption attempts per 15 minutes per IP
  const ipRateLimit = await checkRateLimit(clientIp, 'redeem', 20, 900);
  if (!ipRateLimit.allowed) {
    return {
      success: false,
      error: 'تم تجاوز عدد محاولات إدخال الأكواد من هذا الجهاز. يرجى الانتظار 15 دقيقة ثم المحاولة مجدداً.',
    };
  }

  // 2. Per-student rate limit: maximum 5 attempts per 15 minutes per student
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

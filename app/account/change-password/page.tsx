import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/server/auth/requireAuth';
import { clearMustChangePasswordCookie } from '@/server/auth/cookies';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'تغيير كلمة المرور الإجباري | كلية الذكاء الاصطناعي - جامعة كفر الشيخ',
  description: 'تحديث كلمة المرور لحسابك الأكاديمي لمتابعة استخدام المنصة بأمان.',
};

export default async function ChangePasswordPage() {
  const student = await requireAuth({ allowMustChangePassword: true });
  if (!student.mustChangePassword) {
    await clearMustChangePasswordCookie();
    redirect('/');
  }
  return <ChangePasswordForm student={student.studentProfile} />;
}

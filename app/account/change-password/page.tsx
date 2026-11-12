import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/server/auth/requireAuth';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'تغيير كلمة المرور الإجباري | كلية الذكاء الاصطناعي',
  description: 'تحديث كلمة المرور لحسابك الأكاديمي لمتابعة استخدام المنصة بأمان.',
};

export default async function ChangePasswordPage() {
  const student = await requireAuth({ allowMustChangePassword: true });
  if (!student.mustChangePassword) {
    redirect('/');
  }
  return <ChangePasswordForm student={student.studentProfile} />;
}

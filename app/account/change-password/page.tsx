import { Metadata } from 'next';
import { requireAuth } from '@/server/auth/requireAuth';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'تغيير كلمة المرور الإجباري | كلية الذكاء الاصطناعي',
  description: 'تحديث كلمة المرور لحسابك الأكاديمي لمتابعة استخدام المنصة بأمان.',
};

export default async function ChangePasswordPage() {
  const student = await requireAuth({ allowMustChangePassword: true });
  return <ChangePasswordForm student={student.studentProfile} />;
}

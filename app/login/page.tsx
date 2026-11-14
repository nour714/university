import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOptionalAuth } from '@/server/auth/requireAuth';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | كلية الذكاء الاصطناعي - جامعة كفر الشيخ',
  description: 'تسجيل الدخول إلى البوابة الأكاديمية الرسمية لكلية الذكاء الاصطناعي بجامعة كفر الشيخ - إدارة المقررات، المحاضرات، والاختبارات.',
};

export default async function LoginPage() {
  const session = await getOptionalAuth();

  if (session) {
    if (session.mustChangePassword) {
      redirect('/account/change-password');
    }
    redirect('/');
  }

  return <LoginForm />;
}

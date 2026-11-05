import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | كلية الذكاء الاصطناعي الأكاديمية',
  description: 'تسجيل الدخول إلى البوابة الأكاديمية الرسمية لكلية الذكاء الاصطناعي - إدارة المقررات، المحاضرات، والاختبارات.',
};

export default function LoginPage() {
  return <LoginForm />;
}


import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | كلية الذكاء الاصطناعي - جامعة كفر الشيخ',
  description: 'تسجيل الدخول إلى البوابة الأكاديمية الرسمية لكلية الذكاء الاصطناعي بجامعة كفر الشيخ - إدارة المقررات، المحاضرات، والاختبارات.',
};

export default function LoginPage() {
  return <LoginForm />;
}

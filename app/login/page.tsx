import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | كلية الذكاء الاصطناعي - جامعة كفر الشيخ',
  description: 'تسجيل الدخول إلى البوابة الأكاديمية الرسمية لكلية الذكاء الاصطناعي بجامعة كفر الشيخ - إدارة المقررات، المحاضرات، والاختبارات.',
};

interface LoginPageProps {
  searchParams?: Promise<{ reason?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  return (
    <Suspense fallback={null}>
      <LoginForm reason={params?.reason} />
    </Suspense>
  );
}

import { Metadata } from 'next';
import { requireAuth } from '@/server/auth/requireAuth';
import { CodesManager } from '@/components/codes/CodesManager';

export const metadata: Metadata = {
  title: 'أكوادي الأكاديمية والصلاحيات | كلية الذكاء الاصطناعي',
  description: 'إدارة وتفعيل أكواد الوصول للمحاضرات المعتمدة، سلايدات الشرح، والاختبارات لجميع الفصول الدراسية.',
};

export default async function CodesPage() {
  await requireAuth();
  return <CodesManager />;
}

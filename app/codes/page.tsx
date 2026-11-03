import { Metadata } from 'next';
import { CodesManager } from '@/components/codes/CodesManager';

export const metadata: Metadata = {
  title: 'أكوادي الأكاديمية والصلاحيات | كلية الذكاء الاصطناعي',
  description: 'إدارة وتفعيل أكواد الوصول للمحاضرات المعتمدة، سلايدات الشرح، والاختبارات لجميع الفصول الدراسية.',
};

export default function CodesPage() {
  return <CodesManager />;
}

import { Metadata } from 'next';
import { requireAuth } from '@/server/auth/requireAuth';
import { listStudentCodes } from '@/server/codes/service';
import { CodesManager } from '@/components/codes/CodesManager';

export const maxDuration = 100;

export const metadata: Metadata = {
  title: 'أكوادي الأكاديمية والصلاحيات | كلية الذكاء الاصطناعي - جامعة كفر الشيخ',
  description: 'إدارة وتفعيل أكواد الوصول للمحاضرات المعتمدة، سلايدات الشرح، والاختبارات لجميع الفصول الدراسية.',
};

export default async function CodesPage() {
  const student = await requireAuth();
  const codes = await listStudentCodes(student.accountId);
  return <CodesManager initialCodes={codes} />;
}

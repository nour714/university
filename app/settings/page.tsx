import { Metadata } from 'next';
import { requireAuth } from '@/server/auth/requireAuth';
import { SettingsView } from '@/components/settings/SettingsView';

export const metadata: Metadata = {
  title: 'الإعدادات والدعم الفني | كلية الذكاء الاصطناعي - جامعة كفر الشيخ',
  description: 'إدارة أمان الحساب الأكاديمي، تغيير وتحديث كلمة المرور، وخدمات الدعم الفني والمساعدة المباشرة.',
};

export default async function SettingsPage() {
  const authStudent = await requireAuth();
  return <SettingsView student={authStudent.studentProfile} />;
}

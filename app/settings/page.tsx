import { Metadata } from 'next';
import { SettingsView } from '@/components/settings/SettingsView';

export const metadata: Metadata = {
  title: 'الإعدادات والدعم الفني | كلية الذكاء الاصطناعي',
  description: 'إدارة أمان الحساب الأكاديمي، تغيير وتحديث كلمة المرور، وخدمات الدعم الفني والمساعدة المباشرة.',
};

export default function SettingsPage() {
  return <SettingsView />;
}


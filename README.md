<div align="center">

# 🎓 البوابة الأكاديمية — كلية الذكاء الاصطناعي (جامعة كفر الشيخ)
### Faculty of Artificial Intelligence — Academic Course Portal

[![CI](https://github.com/nour714/university/actions/workflows/ci.yml/badge.svg)](https://github.com/nour714/university/actions/workflows/ci.yml)
[![Live Portal](https://img.shields.io/badge/Live%20Portal-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://university-gules-zeta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

منصة أكاديمية جامعية حديثة لإدارة المقررات الدراسية، والمحاضرات، والاختبارات الإلكترونية، وأكواد التفعيل — مصممة بواجهة عربية كاملة (**RTL**) ومتجاوبة مع جميع الأجهزة (**Mobile-First**).

[🌐 زيارة المنصة المباشرة](https://university-gules-zeta.vercel.app/)

</div>

---

## المميزات الرئيسية (Key Features)

- **لوحة تحكم الطالب:** عرض البيانات الأكاديمية، والمعدل التراكمي (GPA)، والساعات المسجلة، والوصول السريع للمقررات.
- **المقررات والمحتوى العلمي:** تصفح المقررات المفعّلة مع البحث والفلترة حسب نوع المحتوى (محاضرات PDF، فيديوهات مسجلة، مخططات، وروابط علمية) مع تنزيل آمن للملفات.
- **الاختبارات الإلكترونية:** أداء اختبارات الميدتيرم والكويزات بوقت محدد، وحفظ تلقائي للإجابات، وتسليم آمن، ومتابعة النتائج.
- **إدارة الأكواد والصلاحيات:** تفعيل أكواد المقررات الدراسية بسهولة مع سجل للأكواد المفعّلة ونسخ فوري للكود.
- **الإشعارات والدعم الفني:** مركز إشعارات أكاديمية فوري، وإعدادات للحساب وكلمة المرور، ونظام تذاكر دعم فني مع تواصل مباشر مع وحدة الدعم.
- **تصميم عصري ومتجاوب:** دعم كامل للغة العربية (RTL)، والوضع الليلي والنهاري، ومعايير إمكانية الوصول (WCAG 2.1 AA).

---

## التقنيات المستخدمة (Tech Stack)

| الطبقة | التقنية |
| :--- | :--- |
| **إطار العمل** | Next.js (App Router + Turbopack) |
| **واجهة المستخدم** | React 19 • Tailwind CSS v4 • Lucide Icons |
| **اللغة والتحقق** | TypeScript • Zod |
| **قاعدة البيانات والتخزين** | PostgreSQL • Cloudflare R2 |
| **الاختبارات والجودة** | Vitest • ESLint • GitHub Actions CI |

---

## التشغيل المحلي (Quick Start)

> **المتطلبات:** `Node.js 22+` و `npm` و `Docker`.

```bash
# 1. استنساخ المشروع وتثبيت الحزم
git clone https://github.com/nour714/university.git
cd university
npm install

# 2. إعداد ملف البيئة المحلي بناءً على القالب المرفق
cp .env.example .env.local

# 3. تشغيل قاعدة البيانات المحلية ثم الترحيلات
docker compose up -d
npm run migrate

# 4. تشغيل خادم التطوير
npm run dev
```

*(تُضبط جميع متغيرات البيئة محلياً داخل `.env.local` أو عبر إعدادات الاستضافة، ولا تُرفع أي مفاتيح أو بيانات اتصال إلى المستودع).*

---

## الأوامر الأساسية (Scripts)

| الأمر | الوظيفة |
| :--- | :--- |
| `npm run dev` | تشغيل خادم التطوير المحلي |
| `npm run build` | بناء نسخة الإنتاج |
| `npm run start` | تشغيل نسخة الإنتاج محلياً |
| `npm run lint` | فحص جودة الكود (ESLint) |
| `npx tsc --noEmit` | التحقق من أنواع TypeScript |
| `npm test` | تشغيل الاختبارات الآلية (Vitest) |

---

## الترخيص (License)

جميع الحقوق محفوظة © 2026 — البوابة الأكاديمية لكلية الذكاء الاصطناعي، جامعة كفر الشيخ.

# 🎓 بوابة المقررات الأكاديمية | كلية الذكاء الاصطناعي
> **Faculty of Artificial Intelligence — Academic Course Portal (v2.1 Architecture)**  
> منصة أكاديمية تفاعلية حديثة، فائقة السرعة والأمان، مبنية على بنية Next.js 16 + PostgreSQL 16 المتطورة مع عزل الصلاحيات الدقيق (Least-Privilege)، وإدارة الامتحانات الآمنة، وحماية المحتويات الأكاديمية.

---

## 🌟 نظرة عامة (Overview)

بوابة إلكترونية متطورة مخصصة لطلاب وأعضاء هيئة التدريس بكلية الذكاء الاصطناعي:
- ⚡ **أداء فائق**: Next.js 16.4.4 App Router مع Partial Prerendering وTurbopack.
- 📱 **تصميم متجاوب بالكامل (Mobile-First)**: تجربة تصفح مثالية وسلسة على مختلف مقاسات الهواتف والأجهزة اللوحية.
- 🔒 **بنية أمنية متقدمة**: عزل تام للصلاحيات عبر دورين منفصلين بقاعدة البيانات (`academic_app` و `academic_grader`) وسياسات Row-Level Security (RLS) صارمة.
- 📝 **نظام تصحيح امتحانات منيع**: عزل مفاتيح الإجابة في مخطط خاص `academic_private.exam_keys` متاح حصرياً لدور المصحح، مع التحقق الصارم ضد ساعة الخادم ومنع القراءة المسبقة لأسئلة الامتحان.
- 🛡️ **حماية المحتويات والأكواد**: حجب روابط التخزين السحابي `storage_key` والمواد التعليمية عن غير المسجلين، مع دعم الروابط الموقعة مؤقتاً (Cloudflare R2 Presigned URLs) وقفل المنافسة الذري (FOR UPDATE) للأكواد.
- ♿ **دعم كامل للغة العربية (RTL)**: استخدام خط **Cairo** واعتماد الخصائص المنطقية للـ CSS ومطابقة معايير **WCAG 2.1 AA**.

---

## 🛠️ البنية التقنية (Tech Stack)

| التقنية | الاستخدام |
| :--- | :--- |
| **Next.js 16.4.4 (App Router)** | إطار العمل الأساسي، Partial Prerendering، Server Actions، `proxy.ts` |
| **React 19** | مكتبة واجهة المستخدم وأحدث الـ Hooks التفاعلية |
| **PostgreSQL 16 / 17** | قاعدة البيانات الأساسية مع أدوار منفصلة وسياسات RLS |
| **Postgres.js** | عميل اتصال بقاعدة البيانات فائق السرعة ومعاملات ذرية |
| **@node-rs/argon2** | تشفير كلمات المرور بحماية ضد Timing Attacks |
| **Zod** | التحقق الصارم من المدخلات وبيئة التشغيل (Fail-Closed) |
| **Cloudflare R2 (AWS SDK)** | تخزين سحابي للملفات الأكاديمية بروابط موقعة قصيرة الأجل |
| **Tailwind CSS v4** | تنسيق وتصميم الواجهات العصرية |
| **Vitest & Embedded-Postgres** | بيئة اختبارات مؤتمتة متكاملة على Postgres 16 حقيقي |

---

## 💻 التشغيل والتثبيت المحلي (Getting Started)

### 1. المتطلبات الأساسية
- بيئة **Node.js 22** أو أحدث.
- مدير الحزم `npm`.
- اختياري: **Docker** لتشغيل قاعدة بيانات Postgres 16 محلياً (أو الاعتماد على `embedded-postgres` المدمج تلقائياً في الاختبارات).

### 2. إعداد متغيرات البيئة
انسخ ملف الإعداد النموذجي:
```bash
cp .env.example .env.local
```

قيم المتغيرات الأساسية المطلوبة:
```env
DATABASE_URL_OWNER=postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable
DATABASE_URL_APP=postgres://academic_app:app_password@localhost:5432/postgres?sslmode=disable
DATABASE_URL_GRADER=postgres://academic_grader:grader_password@localhost:5432/postgres?sslmode=disable
CODE_PEPPER=at_least_32_characters_secret_code_pepper_string_here
APP_SECRET=at_least_32_characters_secret_app_hmac_secret_here
CRON_SECRET=at_least_16_characters_cron_secret_here
DB_SSL=disable
DB_POOL_MAX=10
```

> [!WARNING]
> لا يتم تشغيل النظام بأي قيم افتراضية غير صالحة؛ يتحقق ملف `lib/env.ts` عند بدء التشغيل فوراً ويرفض الإقلاع (Fail-Closed) في حال نقص أو عدم صلاحية أي متغير.

### 3. تشغيل قاعدة البيانات المحلية (Docker Compose)
لتشغيل Postgres 16 المحلي للتطوير:
```bash
docker compose up -d
```
لقاعدة بيانات الاختبارات المنفصلة (المنفذ 5433):
```bash
docker compose -f docker-compose.test.yml up -d
```

### 4. تطبيق الترحيلات (Migrations)
يتم تطبيق ترحيلات قاعدة البيانات بالترتيب الزمني `000 -> 001 -> 002 -> 003` عبر:
```bash
npm run migrate
```

### 5. إدخال البيانات الأولية (Seeding)
لتغذية البيانات الأكاديمية التجريبية (مقررات، محتويات، حساب تجريبي):
```bash
SEED_DEMO_PASSWORD=MyLocalTestPassword123! npm run seed
```

### 6. تشغيل خادم التطوير
```bash
npm run dev
```
يعمل التطبيق على المنفذ المخصص: [http://localhost:5500](http://localhost:5500)

---

## 🧪 الاختبارات وضمان الجودة (Testing & Verification)

تم تزويد المشروع بجناح اختبارات شامل مؤتمت يعمل على قاعدة بيانات PostgreSQL 16 حقيقية (`embedded-postgres`) دون أي محاكاة وهمية (Zero Mocks):

### 1. تشغيل جناح الاختبارات الكامل
```bash
npm test
```
يشمل 40 اختباراً شاملاً يغطي:
- `test/hygiene.test.ts`: الفحص الأمني لخلو المستودع من أي مفاتيح مسربة أو نصوص غير مشفرة.
- `test/parameterizedSql.test.ts`: التأكد من خلو كافة الاستعلامات من الثغرات (SQL Injection) واعتماد استعلامات مجهزة فقط.
- `test/databasePermissions.test.ts`: مصفوفة صلاحيات أدوار `academic_app` و `academic_grader`.
- `test/auth.test.ts`: مقاومة استنتاج الحسابات، قفل الحساب الذري، وتدوير الجلسات عند تغيير كلمة المرور.
- `test/exams.test.ts`: حجب الأسئلة قبل بدء التوقيت، تصحيح الامتحانات، وتخزين الإجابات والدرجات بدقة.
- `test/cron.test.ts`: التحقق المستمر ومقارنة التوكنات الآمنة زمنياً (`crypto.timingSafeEqual`) والمعالجة التلقائية للجلسات منتهية الصلاحية.
- `test/courses.test.ts`: حظر الوصول للمحتويات والملفات لغير المسجلين، وعدم تسريب أي `storage_key`.
- `test/codes.test.ts`: اختبار سباق التزامن (Concurrency Race) على الأكواد وضمان عدم حرق الكود عند التكرار.
- `test/responseLeak.test.ts`: ماسح الاستجابات لمنع تسريب بيانات الاعتماد ومفاتيح التخزين.

### 2. اختبار مصفوفة الصلاحيات بالـ SQL
```bash
npm run test:permissions
```

### 3. اختبار الطفرات والتكسير المتعمد (14 Mutation Checks)
```bash
npm run test:mutations
```
يقوم بتطبيق 14 تكسيراً أمنياً وبرمجياً متعمداً في الشيفرة والتأكد من نجاح جناح الاختبارات في رصدها وإسقاطها بنسبة 100% (14/14 KILLED).

### 4. الفحص البرمجي والأنماط
```bash
npm run lint
npx tsc --noEmit
```

### 5. بناء نسخة الإنتاج
```bash
npm run build
```

---

## 🔒 دليل تدوير المفاتيح وإجراءات الأمان (Security Rotation)

> [!IMPORTANT]
> في حال الاشتباه بأي تسريب لمفاتيح سابقة على المستودعات العامة، راجع دليل العمليات اليدوي في [`docs/SECURITY-ROTATION.md`](docs/SECURITY-ROTATION.md) الموجه لمدير النظام لتغيير كلمات مرور الأدوار، وتوليد `CODE_PEPPER` جديد، وتعطيل الحسابات التجريبية على بيئة الإنتاج.

---

## 🏛️ الترخيص والحقوق (License)
مشروع تم تطويره لصالح **كلية الذكاء الاصطناعي** © 2026. جميع الحقوق محفوظة.

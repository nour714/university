/**
 * Preview generators for academic course materials.
 * Serves real previewable vector SVG diagrams and valid PDF documents
 * when external storage (R2/S3) is not connected in demo/dev environments.
 */

export function generateDemoPdf(content: {
  id: string;
  title: string;
  courseId?: string;
  format?: string;
}): Buffer {
  const safeTitle = content.title.replace(/[^\x20-\x7E]/g, '_').substring(0, 60);
  const streamLines = [
    // Header Banner
    '0.09 0.15 0.33 rg',
    '30 750 535 60 re f',
    // Header Text
    'BT /F1 14 Tf 1 1 1 rg',
    '45 785 Td (Kafrelsheikh University - Faculty of Artificial Intelligence) Tj',
    '0 -18 Td /F1 10 Tf 0.7 0.85 1 rg (Official Academic Portal - Course Materials & Lecture Sheet) Tj',
    'ET',
    // Title Section
    'BT /F1 16 Tf 0.08 0.12 0.25 rg',
    '45 700 Td (Document: ' + safeTitle + ') Tj',
    'ET',
    // Metadata Badge
    '0.93 0.95 0.98 rg 45 660 505 25 re f',
    '0.75 0.82 0.95 RG 1 w 45 660 505 25 re S',
    'BT /F1 9 Tf 0.15 0.3 0.6 rg',
    '55 668 Td (Course: ' + (content.courseId || 'Academic Course') + ' | Format: ' + (content.format || 'PDF') + ' | Status: Verified Academic Content) Tj',
    'ET',
    // Academic Content Body Box
    '0.98 0.98 0.99 rg 45 300 505 340 re f',
    '0.88 0.90 0.94 RG 1 w 45 300 505 340 re S',
    'BT /F1 11 Tf 0.15 0.2 0.3 rg',
    '60 610 Td (Academic Guidelines & Problem Set Details:) Tj',
    '0 -24 Td /F1 10 Tf 0.25 0.3 0.4 rg',
    '(1. Thoroughly review theoretical foundations before practical implementation.) Tj',
    '0 -18 Td (2. Ensure algorithmic correctness and measure computational complexity.) Tj',
    '0 -18 Td (3. Compare empirical outcomes with theoretical upper bounds.) Tj',
    '0 -18 Td (4. Follow standard academic citation guidelines for references.) Tj',
    '0 -30 Td /F1 10 Tf 0.1 0.35 0.65 rg (Section A: Problem Formulation & Architecture Setup) Tj',
    '0 -18 Td /F1 9 Tf 0.3 0.35 0.45 rg (- Model specification and hyperparameter initialization) Tj',
    '0 -16 Td (- Forward and backward propagation step verification) Tj',
    '0 -16 Td (- Loss convergence monitoring and gradient clipping thresholds) Tj',
    '0 -30 Td /F1 10 Tf 0.1 0.35 0.65 rg (Section B: Experimental Validation & Benchmarks) Tj',
    '0 -18 Td /F1 9 Tf 0.3 0.35 0.45 rg (- Cross-validation across stratified evaluation folds) Tj',
    '0 -16 Td (- Evaluation metrics: Precision, Recall, F1-Score, and Latency) Tj',
    'ET',
    // Watermark / Seal Line
    '0.8 0.85 0.9 RG 1.5 w 45 100 505 0 re S',
    // Footer
    'BT /F1 9 Tf 0.45 0.5 0.6 rg',
    '45 80 Td (Generated securely for authenticated university portal student.) Tj',
    '0 -14 Td (Kafrelsheikh University - All Rights Reserved 2026.) Tj',
    'ET',
  ];

  const stream = streamLines.join('\n');
  const streamLength = Buffer.byteLength(stream, 'ascii');

  const objects: string[] = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>';
  objects[4] = '<< /Length ' + streamLength + ' >>\nstream\n' + stream + '\nendstream';
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf, 'ascii');
    pdf += i + ' 0 obj\n' + objects[i] + '\nendobj\n';
  }
  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    pdf += offsets[i].toString().padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';

  return Buffer.from(pdf, 'ascii');
}

export function generateDemoSvg(content: {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
}): string {
  const safeTitle = content.title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1. Vanishing Gradient vs ReLU diagram (e.g. dl-img2)
  if (content.id === 'dl-img2' || content.title.includes('تلاشي التدرج') || content.title.includes('Vanishing')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640" width="1000" height="640" dir="rtl" style="background:#f8fafc; font-family:'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">
  <defs>
    <style>
      @font-face {
        font-family: 'Cairo';
        font-style: normal;
        font-weight: 400 900;
        font-display: swap;
        src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      }
    </style>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="reluGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="sigGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Header Banner -->
  <rect width="1000" height="90" fill="url(#headerGrad)"/>
  <text x="960" y="42" text-anchor="end" fill="#ffffff" font-size="20" font-weight="800">كلية الذكاء الاصطناعي - جامعة كفر الشيخ</text>
  <text x="960" y="68" text-anchor="end" fill="#93c5fd" font-size="14" font-weight="600">مقرر أساسيات التعلم العميق (AI302) • مخطط بياني توضيحي</text>
  <rect x="40" y="28" width="140" height="34" rx="17" fill="#1e40af" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="110" y="50" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">محتوى معتمد</text>

  <!-- Title Card -->
  <g transform="translate(40, 110)">
    <rect width="920" height="60" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="890" y="38" text-anchor="end" fill="#0f172a" font-size="16" font-weight="800">${safeTitle}</text>
  </g>

  <!-- Left Card: Sigmoid & Vanishing Gradient -->
  <g transform="translate(40, 190)">
    <rect width="445" height="410" rx="20" fill="#ffffff" stroke="#fecdd3" stroke-width="1.5" filter="url(#shadow)"/>
    <rect width="445" height="42" rx="20" fill="#fff1f2"/>
    <text x="420" y="27" text-anchor="end" fill="#be123c" font-size="15" font-weight="800">دالة السجمويد: σ(x) = 1 / (1 + e^-x)</text>

    <!-- Axes -->
    <line x1="50" y1="220" x2="395" y2="220" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="222" y1="70" x2="222" y2="270" stroke="#cbd5e1" stroke-width="2"/>
    <text x="395" y="238" text-anchor="end" fill="#64748b" font-size="11">+x</text>
    <text x="50" y="238" text-anchor="start" fill="#64748b" font-size="11">-x</text>
    <text x="232" y="80" text-anchor="start" fill="#64748b" font-size="11">y=1.0</text>
    <text x="232" y="215" text-anchor="start" fill="#64748b" font-size="11">y=0.0</text>

    <!-- Sigmoid S-Curve -->
    <path d="M 60 216 C 140 215, 170 210, 222 145 C 270 80, 310 75, 385 74" fill="none" stroke="url(#sigGrad)" stroke-width="3.5"/>
    
    <!-- Derivative Curve σ'(x) -->
    <path d="M 60 220 C 130 220, 170 210, 222 170 C 270 210, 310 220, 385 220" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 3"/>

    <!-- Explanatory Box -->
    <rect x="25" y="285" width="395" height="105" rx="12" fill="#fff5f5" stroke="#fda4af" stroke-width="1"/>
    <text x="400" y="310" text-anchor="end" fill="#9f1239" font-size="12" font-weight="700">المشكلة: تلاشي التدرج (Vanishing Gradient)</text>
    <text x="400" y="332" text-anchor="end" fill="#881337" font-size="11.5">• المشتقة العظمى لـ Sigmoid هي 0.25 فقط عند x = 0.</text>
    <text x="400" y="352" text-anchor="end" fill="#881337" font-size="11.5">• عند الضرب المتتالي عبر الطبقات العميقة يتلاشى التدرج نحو الصفر.</text>
    <text x="400" y="372" text-anchor="end" fill="#881337" font-size="11.5">• النتيجة: توقف أوزان الطبقات الأولى عن التعلم تماماً.</text>
  </g>

  <!-- Right Card: ReLU & Gradient Flow Solution -->
  <g transform="translate(515, 190)">
    <rect width="445" height="410" rx="20" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5" filter="url(#shadow)"/>
    <rect width="445" height="42" rx="20" fill="#f0f9ff"/>
    <text x="420" y="27" text-anchor="end" fill="#0369a1" font-size="15" font-weight="800">دالة ReLU: f(x) = max(0, x)</text>

    <!-- Axes -->
    <line x1="50" y1="220" x2="395" y2="220" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="222" y1="70" x2="222" y2="270" stroke="#cbd5e1" stroke-width="2"/>
    <text x="395" y="238" text-anchor="end" fill="#64748b" font-size="11">+x</text>
    <text x="50" y="238" text-anchor="start" fill="#64748b" font-size="11">-x</text>
    <text x="232" y="80" text-anchor="start" fill="#64748b" font-size="11">f(x)</text>

    <!-- ReLU Curve -->
    <path d="M 60 220 L 222 220 L 375 75" fill="none" stroke="url(#reluGrad)" stroke-width="3.5"/>
    
    <!-- Derivative Curve f'(x) -->
    <line x1="60" y1="220" x2="222" y2="220" stroke="#0284c7" stroke-width="2" stroke-dasharray="4 3"/>
    <line x1="222" y1="140" x2="375" y2="140" stroke="#0284c7" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="380" y="144" text-anchor="start" fill="#0284c7" font-size="10.5" font-weight="700">f'(x)=1</text>

    <!-- Explanatory Box -->
    <rect x="25" y="285" width="395" height="105" rx="12" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
    <text x="400" y="310" text-anchor="end" fill="#166534" font-size="12" font-weight="700">الحل: التدفق الثابت للتدرج (Constant Gradient)</text>
    <text x="400" y="332" text-anchor="end" fill="#14532d" font-size="11.5">• المشتقة = 1 ثابتة لأي مدخل موجب (x &gt; 0).</text>
    <text x="400" y="352" text-anchor="end" fill="#14532d" font-size="11.5">• لا يوجد تشبع علوي؛ التدفق العكسي للتدرج يمر دون اضمحلال.</text>
    <text x="400" y="372" text-anchor="end" fill="#14532d" font-size="11.5">• سرعة تدريب تفوق Sigmoid بما يصل إلى 6 أضعاف في الشبكات العميقة.</text>
  </g>
</svg>`;
  }

  // 2. CNN Architecture diagram (e.g. dl-img1)
  if (content.id === 'dl-img1' || content.title.includes('الالتفافية') || content.title.includes('CNN')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600" dir="rtl" style="background:#f8fafc; font-family:'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">
  <defs>
    <style>
      @font-face {
        font-family: 'Cairo';
        font-style: normal;
        font-weight: 400 900;
        font-display: swap;
        src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      }
    </style>
    <linearGradient id="headerGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <filter id="shadow2" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Header Banner -->
  <rect width="1000" height="90" fill="url(#headerGrad2)"/>
  <text x="960" y="42" text-anchor="end" fill="#ffffff" font-size="20" font-weight="800">كلية الذكاء الاصطناعي - جامعة كفر الشيخ</text>
  <text x="960" y="68" text-anchor="end" fill="#93c5fd" font-size="14" font-weight="600">بنية الشبكات العصبية الالتفافية (CNN Architecture) • مخطط تفصيلي</text>

  <!-- Title Card -->
  <g transform="translate(40, 110)">
    <rect width="920" height="55" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#shadow2)"/>
    <text x="890" y="35" text-anchor="end" fill="#0f172a" font-size="16" font-weight="800">${safeTitle}</text>
  </g>

  <!-- Architecture Flow -->
  <g transform="translate(40, 185)">
    <rect width="920" height="380" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#shadow2)"/>

    <!-- Stage 1: Input Image -->
    <rect x="50" y="100" width="90" height="120" rx="10" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
    <text x="95" y="155" text-anchor="middle" fill="#0369a1" font-size="12" font-weight="700">الصورة</text>
    <text x="95" y="175" text-anchor="middle" fill="#0284c7" font-size="11">32×32×3</text>
    <text x="95" y="240" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="700">المدخلات (Input)</text>

    <!-- Arrow -->
    <path d="M 150 160 L 180 160" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arrow)"/>

    <!-- Stage 2: Conv + ReLU -->
    <rect x="190" y="80" width="105" height="160" rx="12" fill="#ede9fe" stroke="#a855f7" stroke-width="2"/>
    <text x="242" y="150" text-anchor="middle" fill="#6b21a8" font-size="12" font-weight="700">الالتفاف Conv</text>
    <text x="242" y="170" text-anchor="middle" fill="#7e22ce" font-size="11">+ ReLU</text>
    <text x="242" y="190" text-anchor="middle" fill="#9333ea" font-size="10.5">28×28×16</text>
    <text x="242" y="260" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="700">استخراج السمات</text>

    <!-- Arrow -->
    <path d="M 305 160 L 335 160" stroke="#94a3b8" stroke-width="2.5"/>

    <!-- Stage 3: Pooling -->
    <rect x="345" y="110" width="95" height="100" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="392" y="155" text-anchor="middle" fill="#b45309" font-size="12" font-weight="700">التجميع MaxPool</text>
    <text x="392" y="175" text-anchor="middle" fill="#d97706" font-size="10.5">14×14×16</text>
    <text x="392" y="230" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="700">تقليص الأبعاد</text>

    <!-- Arrow -->
    <path d="M 450 160 L 480 160" stroke="#94a3b8" stroke-width="2.5"/>

    <!-- Stage 4: Conv2 + Pool2 -->
    <rect x="490" y="95" width="105" height="130" rx="12" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
    <text x="542" y="150" text-anchor="middle" fill="#15803d" font-size="12" font-weight="700">الالتفاف 2</text>
    <text x="542" y="170" text-anchor="middle" fill="#16a34a" font-size="10.5">7×7×32</text>
    <text x="542" y="245" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="700">سمات مركبة</text>

    <!-- Arrow -->
    <path d="M 605 160 L 635 160" stroke="#94a3b8" stroke-width="2.5"/>

    <!-- Stage 5: Flatten & Dense -->
    <rect x="645" y="70" width="110" height="180" rx="12" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2"/>
    <text x="700" y="145" text-anchor="middle" fill="#be123c" font-size="12" font-weight="700">طبقة كثيفة</text>
    <text x="700" y="165" text-anchor="middle" fill="#e11d48" font-size="11">Dense / FC</text>
    <text x="700" y="185" text-anchor="middle" fill="#f43f5e" font-size="10.5">128 Nodes</text>
    <text x="700" y="270" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="700">الربط الشامل</text>

    <!-- Arrow -->
    <path d="M 765 160 L 795 160" stroke="#94a3b8" stroke-width="2.5"/>

    <!-- Stage 6: Softmax Output -->
    <rect x="805" y="105" width="85" height="110" rx="10" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
    <text x="847" y="150" text-anchor="middle" fill="#3730a3" font-size="12" font-weight="700">Softmax</text>
    <text x="847" y="170" text-anchor="middle" fill="#4f46e5" font-size="10.5">10 فئات</text>
    <text x="847" y="235" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="700">التصنيف النهائي</text>

    <!-- Summary Box -->
    <rect x="50" y="300" width="840" height="60" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="870" y="335" text-anchor="end" fill="#1e293b" font-size="12.5" font-weight="600">
      التسلسل المعياري للشبكة: تكرار طبقات الالتفاف (Convolution) والتجميع (Pooling) لاستخلاص الأنماط البصرية المعقدة ثم الربط الكثيف للتصنيف.
    </text>
  </g>
</svg>`;
  }

  // 3. General Academic Vector Graphic Fallback
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500" dir="rtl" style="background:#f8fafc; font-family:'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">
  <defs>
    <style>
      @font-face {
        font-family: 'Cairo';
        font-style: normal;
        font-weight: 400 900;
        font-display: swap;
        src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      }
    </style>
    <linearGradient id="headerGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="80" fill="url(#headerGrad3)"/>
  <text x="860" y="40" text-anchor="end" fill="#ffffff" font-size="18" font-weight="800">كلية الذكاء الاصطناعي - جامعة كفر الشيخ</text>
  <text x="860" y="62" text-anchor="end" fill="#93c5fd" font-size="13">محتوى تعليمي أكاديمي • معاينة مباشرة</text>
  <rect x="40" y="110" width="820" height="350" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="830" y="160" text-anchor="end" fill="#0f172a" font-size="18" font-weight="800">${safeTitle}</text>
  <text x="830" y="195" text-anchor="end" fill="#475569" font-size="13">${(content.description || 'مخطط بياني توضيحي للمحتوى الأكاديمي المسجل بالمنصة.').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  <rect x="70" y="230" width="760" height="180" rx="12" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="450" y="325" text-anchor="middle" fill="#64748b" font-size="14" font-weight="700">رسم بياني وتوضيح هندسي لمفاهيم المقرر الأكاديمي</text>
</svg>`;
}

export function renderFallbackHtml(content: {
  title: string;
  courseId?: string;
  format?: string;
  type?: string;
}): string {
  const safeTitle = content.title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const courseHref = content.courseId ? `/courses/${encodeURIComponent(content.courseId)}` : '/';

  // Determine crisp inline SVG icon based on content format, type, or title
  const iconSvg = getFallbackIconSvg(content);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>معاينة الملف الأكاديمي | كلية الذكاء الاصطناعي</title>
  <link rel="preload" href="/fonts/cairo/cairo-arabic.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face {
      font-family: 'Cairo';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC;
    }
    @font-face {
      font-family: 'Cairo';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC;
    }
    @font-face {
      font-family: 'Cairo';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC;
    }
    @font-face {
      font-family: 'Cairo';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC;
    }
    @font-face {
      font-family: 'Cairo';
      font-style: normal;
      font-weight: 800;
      font-display: swap;
      src: url('/fonts/cairo/cairo-arabic.woff2') format('woff2');
      unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC;
    }
    @font-face {
      font-family: 'Cairo';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/cairo/cairo-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
      font-family: 'Cairo';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/cairo/cairo-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      direction: rtl;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 28px 20px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      max-width: 100%;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 9999px;
      color: #1d4ed8;
      text-align: center;
      line-height: 1.5;
    }
    @media (max-width: 339px) {
      .badge {
        white-space: normal;
        border-radius: 12px;
      }
    }
    .icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    h1 {
      font-size: 1.125rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.4;
    }
    .file-name {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 0.875rem;
      font-weight: 700;
      color: #334155;
      word-break: break-word;
      line-height: 1.5;
      width: 100%;
      text-align: center;
    }
    p {
      font-size: 0.8125rem;
      color: #64748b;
      line-height: 1.6;
      width: 100%;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      min-height: 48px;
      padding: 12px 20px;
      border-radius: 12px;
      background: #2563eb;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.15s ease, transform 0.1s ease;
      cursor: pointer;
      border: none;
    }
    .btn:hover { background: #1d4ed8; }
    .btn:active { transform: scale(0.98); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">كلية الذكاء الاصطناعي • جامعة كفر الشيخ</div>
    <div class="icon">${iconSvg}</div>
    <h1>المحتوى الأكاديمي متاح للمعاينة والدراسة</h1>
    <div class="file-name">${safeTitle}</div>
    <p>تم التحقق من تسجيلك الأكاديمي بنجاح. يمكنك العودة لصفحة المقرر الدراسي أو متابعة المحاضرات والأنشطة المرتبطة.</p>
    <a href="${courseHref}" class="btn">العودة إلى المقرر الدراسي</a>
  </div>
</body>
</html>`;
}

/**
 * Derives a crisp inline Lucide-style SVG icon for the fallback preview card.
 */
function getFallbackIconSvg(content: {
  title?: string;
  format?: string;
  type?: string;
}): string {
  const format = (content.format || '').toLowerCase();
  const type = (content.type || '').toLowerCase();
  const title = (content.title || '').toLowerCase();

  const isVideo =
    format === 'mp4' ||
    format === 'mkv' ||
    format === 'webm' ||
    format === 'mov' ||
    format === 'avi' ||
    type === 'video' ||
    type === 'recording' ||
    title.includes('تسجيل') ||
    title.includes('فيديو') ||
    title.includes('video') ||
    (title.includes('معمل') && !title.includes('شيت'));

  const isImage =
    format === 'png' ||
    format === 'jpg' ||
    format === 'jpeg' ||
    format === 'svg' ||
    format === 'webp' ||
    format === 'gif' ||
    type === 'image' ||
    type === 'diagram' ||
    title.includes('مخطط') ||
    title.includes('رسم') ||
    title.includes('صورة');

  if (isVideo) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>`;
  }

  if (isImage) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
  }

  // Default: PDF / Lecture / Document
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;
}


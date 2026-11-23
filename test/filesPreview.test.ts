import { describe, it, expect } from 'vitest';
import { 
  generateDemoPdf, 
  generateDemoSvg, 
  renderFallbackHtml 
} from '@/lib/files/previewGenerators';

describe('Files Download & Preview Generators (Phase 7)', () => {
  it('generates a valid, standards-compliant PDF buffer for academic files', () => {
    const pdfBuf = generateDemoPdf({
      id: 'dl-f4',
      title: 'شيت العملي 01: بناء شبكة عصبية وتدريبها باستخدام PyTorch',
      courseId: 'ai-302',
      format: 'PDF',
    });

    expect(pdfBuf).toBeInstanceOf(Buffer);
    expect(pdfBuf.length).toBeGreaterThan(500);

    const pdfString = pdfBuf.toString('ascii');
    // PDF Magic Number header
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    // Standard PDF Structure
    expect(pdfString).toContain('/Type /Catalog');
    expect(pdfString).toContain('/Type /Pages');
    expect(pdfString).toContain('/Type /Page');
    expect(pdfString).toContain('xref');
    expect(pdfString).toContain('trailer');
    expect(pdfString).toContain('startxref');
    expect(pdfString.endsWith('%%EOF')).toBe(true);
  });

  it('generates rich, crisp SVG diagrams for images (dl-img1 & dl-img2)', () => {
    // 1. Vanishing Gradient vs ReLU diagram (dl-img2)
    const svgImg2 = generateDemoSvg({
      id: 'dl-img2',
      title: 'رسم بياني يوضح ظاهرة تلاشي التدرج Vanishing Gradient وحلها بدوال ReLU',
      courseId: 'ai-302',
    });

    expect(svgImg2.startsWith('<svg')).toBe(true);
    expect(svgImg2.endsWith('</svg>')).toBe(true);
    expect(svgImg2).toContain('Sigmoid');
    expect(svgImg2).toContain('ReLU');
    expect(svgImg2).toContain('تلاشي التدرج');
    expect(svgImg2).toContain('Cairo');
    expect(svgImg2).toContain('dir="rtl"');

    // 2. CNN architecture diagram (dl-img1)
    const svgImg1 = generateDemoSvg({
      id: 'dl-img1',
      title: 'مخطط بنية الشبكة الالتفافية CNN والتسلسل الطبقي',
      courseId: 'ai-302',
    });

    expect(svgImg1.startsWith('<svg')).toBe(true);
    expect(svgImg1.endsWith('</svg>')).toBe(true);
    expect(svgImg1).toContain('Conv');
    expect(svgImg1).toContain('MaxPool');
    expect(svgImg1).toContain('Softmax');
  });

  it('renders clean RTL fallback HTML without external CSP-blocked font links', () => {
    const html = renderFallbackHtml({
      title: 'مذكرة المقرر الأكاديمي',
      courseId: 'ai-302',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('<meta charset="utf-8">');
    // Must NOT link to external blocked google fonts
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
    // Must use local RTL-capable system font stack and local Cairo font assets
    expect(html).toContain("font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;");
    expect(html).toContain('/fonts/cairo/cairo-arabic.woff2');
    expect(html).toContain('@font-face');
    expect(html).toContain('مذكرة المقرر الأكاديمي');
  });

  it('renders single clean institution badge without awkward splitting and with natural narrow-screen wrap', () => {
    const html = renderFallbackHtml({
      title: 'محاضرة الذكاء الاصطناعي',
      courseId: 'ai-301',
    });

    // Single clean badge container
    expect(html).toContain('<div class="badge">كلية الذكاء الاصطناعي • جامعة كفر الشيخ</div>');
    // Pill styling
    expect(html).toContain('display: inline-flex;');
    expect(html).toContain('padding: 6px 14px;');
    expect(html).toContain('font-size: 12px;');
    expect(html).toContain('font-weight: 700;');
    expect(html).toContain('white-space: nowrap;');
    expect(html).toContain('max-width: 100%;');
    // < 340px responsive wrapping
    expect(html).toContain('@media (max-width: 339px)');
    expect(html).toContain('white-space: normal;');
  });

  it('renders crisp inline SVG icons instead of blurry emoji for video, pdf, and image items', () => {
    // 1. Video / Recording item
    const videoHtml = renderFallbackHtml({
      title: 'تسجيل المعمل 02: بناء نماذج التعلم العميق',
      courseId: 'ai-302',
      format: 'mp4',
      type: 'video',
    });

    expect(videoHtml).not.toContain('📄');
    expect(videoHtml).toContain('<div class="icon">');
    expect(videoHtml).toContain('width="28" height="28"');
    // Video icon paths
    expect(videoHtml).toContain('<rect width="14" height="12"');
    expect(videoHtml).toContain('<path d="m16 13 5.223 3.482');

    // 2. PDF / Lecture document item
    const pdfHtml = renderFallbackHtml({
      title: 'المحاضرة 03: خوارزميات التصنيف والتعزيز',
      courseId: 'ai-301',
      format: 'pdf',
      type: 'lecture',
    });

    expect(pdfHtml).not.toContain('📄');
    expect(pdfHtml).toContain('width="28" height="28"');
    // FileText icon paths
    expect(pdfHtml).toContain('<path d="M15 2H6');

    // 3. Image / Diagram item
    const imageHtml = renderFallbackHtml({
      title: 'مخطط تدفق البيانات في خط أنابيب التدريب',
      courseId: 'ai-301',
      format: 'png',
      type: 'image',
    });

    expect(imageHtml).not.toContain('📄');
    expect(imageHtml).toContain('width="28" height="28"');
    // Image icon elements
    expect(imageHtml).toContain('<circle cx="9" cy="9" r="2"');
  });

  it('enforces balanced mobile card proportions, 56x56 icon box, and 48px touch targets', () => {
    const html = renderFallbackHtml({
      title: 'شيت التمارين 04',
      courseId: 'ai-302',
    });

    // Card proportions
    expect(html).toContain('padding: 28px 20px;');
    expect(html).toContain('max-width: 420px;');
    expect(html).toContain('width: 100%;');
    expect(html).toContain('gap: 16px;');

    // 56x56 icon box
    expect(html).toContain('width: 56px;');
    expect(html).toContain('height: 56px;');
    expect(html).toContain('border-radius: 16px;');
    expect(html).toContain('background: #eff6ff;');
    expect(html).toContain('color: #2563eb;');
    expect(html).toContain('border: 1px solid #dbeafe;');

    // Button touch target & proportions
    expect(html).toContain('min-height: 48px;');
    expect(html).toContain('border-radius: 12px;');
    expect(html).toContain('width: 100%;');
  });
});

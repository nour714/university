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
    // Must use local RTL-capable system font stack
    expect(html).toContain("font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;");
    expect(html).toContain('مذكرة المقرر الأكاديمي');
  });
});

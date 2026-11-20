import { NextResponse, connection } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { appSql } from '@/lib/db/app.server';
import { env } from '@/lib/env';
import { isSafeExternalUrl } from '@/lib/safeUrl';
import { requireAuth } from '@/server/auth/requireAuth';
import { checkRateLimit } from '@/server/security/rateLimit';
import { resolveContentDownload } from '@/server/courses/service';
import { logger } from '@/lib/log';

export const maxDuration = 30;

function getR2Client(): S3Client | null {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function GET(request: Request) {
  try {
    await connection();
  } catch {
    // When running in standalone test runner outside Next.js request context
  }
  try {
    const student = await requireAuth();

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId || typeof contentId !== 'string') {
      return NextResponse.json({ error: 'المعرف المطلوب غير صحيح' }, { status: 400 });
    }

    // 1. Rate limiting: 60 download requests per minute per student
    const rateLimit = await checkRateLimit(student.accountId, 'download', 60, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى المسموح به لتحميل الملفات. يرجى الانتظار دقيقة ثم المحاولة.' },
        { status: 429 }
      );
    }

    // 2. Resolve content authorization via SQL enrollment check (Finding C1)
    const resolution = await resolveContentDownload(contentId, student.accountId);
    if (resolution.status === 'not_found' || !resolution.content) {
      return NextResponse.json({ error: 'المحتوى المطلوب غير موجود' }, { status: 404 });
    }
    if (resolution.status === 'forbidden') {
      return NextResponse.json(
        { error: 'غير مصرح: يجب تفعيل كود المقرر أولاً للوصول إلى هذا المحتوى.' },
        { status: 403 }
      );
    }

    const content = resolution.content;

    // 4. Generate presigned URL via Cloudflare R2 if storageKey exists
    const r2 = getR2Client();
    const bucket = env.R2_BUCKET || 'academic-files';

    if (r2 && content.storageKey) {
      const cleanFormat = (content.format || 'bin').toLowerCase();
      const safeAscii = `${content.title.replace(/[^\x20-\x7E]/g, '_')}.${cleanFormat}`;
      const utf8Filename = encodeURIComponent(`${content.title}.${cleanFormat}`);
      // RFC 5987 Content-Disposition
      const disposition = `inline; filename="${safeAscii}"; filename*=UTF-8''${utf8Filename}`;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: content.storageKey,
        ResponseContentDisposition: disposition,
      });

      // TTL <= 60 seconds strictly enforces active session/enrollment check on every download
      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

      // Audit download
      try {
        await appSql`
          INSERT INTO academic_private.audit_log (actor, action, details)
          VALUES (${student.accountId}, 'FILE_DOWNLOADED', ${appSql.json({ content_id: content.id, course_id: content.courseId })})
        `;
      } catch {
        // Non-blocking audit
      }

      return NextResponse.redirect(signedUrl);
    }

    // 5. Validated HTTPS external URL redirect if present
    if (content.externalUrl && isSafeExternalUrl(content.externalUrl)) {
      try {
        const parsedUrl = new URL(content.externalUrl);
        return NextResponse.redirect(parsedUrl.toString());
      } catch {
        // Malformed URL falls through
      }
    }

    // 6. Direct browser request without downloadable asset -> return styled HTML page
    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (acceptsHtml) {
      const courseHref = content.courseId ? `/courses/${encodeURIComponent(content.courseId)}` : '/';
      const safeTitle = content.title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>الملف غير متاح حالياً للتنزيل | كلية الذكاء الاصطناعي</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 1.5rem;
      padding: 2rem;
      max-width: 28rem;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
    }
    .icon {
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #d97706;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      font-size: 1.75rem;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .file-name {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 1rem;
      word-break: break-word;
    }
    p {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      background: #2563eb;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.15s ease;
      cursor: pointer;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span>كلية الذكاء الاصطناعي</span>
      <span>•</span>
      <span>جامعة كفر الشيخ</span>
    </div>
    <div class="icon">📁</div>
    <h1>الملف غير متاح حالياً للتنزيل المباشر</h1>
    <div class="file-name">${safeTitle}</div>
    <p>هذا الملف الأكاديمي مسجل ضمن الخطة الدراسية للمقرر، ولكن لم يتم ربطه بملف تنزيل مباشر بعد. يرجى مراجعة منصة المقرر أو التواصل مع مدرس المادة.</p>
    <a href="${courseHref}" class="btn">العودة إلى المقرر الدراسي</a>
  </div>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return NextResponse.json({
      message: 'الملف متاح للدراسة الأكاديمية.',
      contentId: content.id,
      title: content.title,
    });
  } catch (err: unknown) {
    const errorObj = err as { digest?: string };
    if (errorObj?.digest?.startsWith('NEXT_REDIRECT') || errorObj?.digest?.includes('HANGING_PROMISE')) {
      throw err;
    }
    logger.error('File download authorization error:', err);
    return NextResponse.json({ error: 'غير مصرح بالدخول أو انتهت الجلسة' }, { status: 401 });
  }
}

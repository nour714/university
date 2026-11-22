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
import { 
  generateDemoPdf, 
  generateDemoSvg, 
  renderFallbackHtml 
} from '@/lib/files/previewGenerators';

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

    // Audit download
    try {
      await appSql`
        INSERT INTO academic_private.audit_log (actor, action, details)
        VALUES (${student.accountId}, 'FILE_DOWNLOADED', ${appSql.json({ content_id: content.id, course_id: content.courseId })})
      `;
    } catch {
      // Non-blocking audit
    }

    const cleanFormat = (content.format || 'bin').toLowerCase().replace(/["';\r\n\\]/g, '');
    const cleanTitle = content.title.replace(/["';\r\n\\]/g, '_').replace(/[^\x20-\x7E]/g, '_');
    const safeAscii = `${cleanTitle.substring(0, 45)}.${cleanFormat}`;
    const utf8Filename = encodeURIComponent(`${content.title}.${cleanFormat}`);
    const disposition = `inline; filename="${safeAscii}"; filename*=UTF-8''${utf8Filename}`;

    // 3. Generate presigned URL via Cloudflare R2 if configured and storageKey exists
    const r2 = getR2Client();
    const bucket = env.R2_BUCKET || 'academic-files';

    if (r2 && content.storageKey) {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: content.storageKey,
        ResponseContentDisposition: disposition,
      });

      // TTL <= 60 seconds strictly enforces active session/enrollment check on every download
      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });
      return NextResponse.redirect(signedUrl);
    }

    // 4. Validated HTTPS external URL redirect if present
    if (content.externalUrl && isSafeExternalUrl(content.externalUrl)) {
      try {
        const parsedUrl = new URL(content.externalUrl, request.url);
        return NextResponse.redirect(parsedUrl.toString());
      } catch {
        // Malformed URL falls through to preview generator
      }
    }

    // 5. Serve real previewable SVG/PNG/PDF bytes for seeded demo files
    // Image formats (PNG, JPG, SVG, WebP) -> Crisp vector SVG diagram with Arabic typography
    if (
      content.format?.toLowerCase() === 'png' ||
      content.format?.toLowerCase() === 'jpg' ||
      content.format?.toLowerCase() === 'jpeg' ||
      content.format?.toLowerCase() === 'svg' ||
      content.format?.toLowerCase() === 'webp'
    ) {
      const svg = generateDemoSvg({
        id: content.id,
        title: content.title,
        courseId: content.courseId,
      });

      return new NextResponse(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Disposition': `inline; filename="${safeAscii}.svg"; filename*=UTF-8''${utf8Filename}.svg`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    // File / Lecture / Practical Sheet formats (PDF) -> Valid PDF 1.4 Document Buffer
    if (cleanFormat === 'pdf') {
      const pdfBuffer = generateDemoPdf({
        id: content.id,
        title: content.title,
        courseId: content.courseId,
        format: content.format,
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${safeAscii}.pdf"; filename*=UTF-8''${utf8Filename}.pdf`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    // 6. Direct browser request without downloadable binary -> return styled clean RTL HTML page
    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (acceptsHtml) {
      const html = renderFallbackHtml({
        title: content.title,
        courseId: content.courseId,
      });

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'private, no-store',
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

import { NextResponse, connection } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { appSql } from '@/lib/db/app.server';
import { env } from '@/lib/env';
import { requireAuth } from '@/server/auth/requireAuth';
import { checkRateLimit } from '@/server/security/rateLimit';
import { resolveContentDownload } from '@/server/courses/service';

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
          VALUES (${student.accountId}, 'FILE_DOWNLOADED', ${JSON.stringify({ content_id: content.id, course_id: content.courseId })}::jsonb)
        `;
      } catch {
        // Non-blocking audit
      }

      return NextResponse.redirect(signedUrl);
    }

    // 5. Validated HTTPS external URL redirect if present
    if (content.externalUrl) {
      try {
        const parsedUrl = new URL(content.externalUrl);
        if (parsedUrl.protocol === 'https:') {
          return NextResponse.redirect(parsedUrl.toString());
        }
      } catch {
        // Malformed URL falls through
      }
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
    console.error('File download authorization error:', err);
    return NextResponse.json({ error: 'غير مصرح بالدخول أو انتهت الجلسة' }, { status: 401 });
  }
}

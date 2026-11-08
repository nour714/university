import { NextResponse, connection } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { appSql } from '@/lib/db/app.server';
import { requireAuth } from '@/server/auth/requireAuth';

function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey || accountId === 'dummy_account') {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function GET(request: Request) {
  await connection();
  try {
    const student = await requireAuth();
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'Missing contentId parameter' }, { status: 400 });
    }

    // 1. Fetch content item and course
    const [content] = await appSql`
      SELECT id, course_id, title, format, storage_key, external_url
      FROM public.academic_course_contents
      WHERE id = ${contentId}
    `;

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // 2. Enforce enrollment authorization
    const [enrollment] = await appSql`
      SELECT 1 FROM public.academic_student_codes
      WHERE student_id = ${student.accountId} AND course_id = ${content.course_id} AND status = 'active'
    `;

    if (!enrollment) {
      return NextResponse.json({ error: 'يجب تفعيل كود المقرر أولاً لتحميل هذا المحتوى.' }, { status: 403 });
    }

    // 3. Generate presigned URL via Cloudflare R2 if available
    const r2 = getR2Client();
    const bucket = process.env.R2_BUCKET || 'academic-files';

    if (r2 && content.storage_key) {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: content.storage_key,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(content.title)}.${content.format.toLowerCase()}"`,
      });

      // 60 seconds expiry strictly enforces subscription check on every download
      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });
      return NextResponse.redirect(signedUrl);
    }

    // Fallback if direct link or mock in dev
    if (content.external_url) {
      return NextResponse.redirect(content.external_url);
    }

    return NextResponse.json({
      message: 'الملف متاح للدراسة الأكاديمية.',
      contentId: content.id,
      title: content.title,
    });
  } catch (err) {
    console.error('File download authorization error:', err);
    return NextResponse.json({ error: 'Unauthorized or failed' }, { status: 401 });
  }
}

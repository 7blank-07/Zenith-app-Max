import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { BLOG_ADMIN_SESSION_COOKIE_NAME } from '../../../../src/lib/server/blog/session.mjs';
import { resolveBlogSessionUserFromToken } from '../../../../src/lib/server/blog/auth.mjs';
import { canEditBlogPosts } from '../../../../src/lib/server/blog/permissions.mjs';
import { slugifyBlogSegment } from '../../../../src/lib/server/blog/slugs.mjs';

export const runtime = 'nodejs';

const ALLOWED_IMAGE_MIME_TYPES = Object.freeze(new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif'
]));

const MIME_EXTENSION_MAP = Object.freeze({
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif'
});

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function getUploadConfig(rawEnv = process.env) {
  const parsedMaxBytes = Number.parseInt(String(rawEnv.BLOG_IMAGE_MAX_BYTES || 8 * 1024 * 1024), 10);

  return {
    uploadDir: toText(rawEnv.BLOG_UPLOAD_DIR),
    publicUrl: toText(rawEnv.BLOG_PUBLIC_URL),
    maxBytes: Number.isFinite(parsedMaxBytes) && parsedMaxBytes > 0 ? parsedMaxBytes : 8 * 1024 * 1024
  };
}

function ensureUploadConfig(config) {
  const missing = [];

  if (!config.uploadDir) missing.push('BLOG_UPLOAD_DIR');
  if (!config.publicUrl) missing.push('BLOG_PUBLIC_URL');

  if (missing.length) {
    throw new Error(`Blog image uploads are not configured. Missing: ${missing.join(', ')}`);
  }
}

function sanitizeFileExtension(file) {
  const mimeType = toText(file?.type).toLowerCase();
  if (mimeType && MIME_EXTENSION_MAP[mimeType]) {
    return MIME_EXTENSION_MAP[mimeType];
  }

  const originalExtension = path.extname(toText(file?.name, ''));
  const normalizedExtension = originalExtension.toLowerCase().replace(/[^a-z0-9.]/g, '');
  return normalizedExtension && normalizedExtension.length <= 10 ? normalizedExtension : '.img';
}

function isAcceptedImage(file) {
  const mimeType = toText(file?.type).toLowerCase();
  if (mimeType && ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    return true;
  }

  const extension = sanitizeFileExtension(file);
  return Object.values(MIME_EXTENSION_MAP).includes(extension);
}

function buildUniqueFileName(file, slugHint) {
  const baseName = slugifyBlogSegment(
    toText(slugHint) || path.parse(toText(file?.name, 'image')).name || 'image',
    { fallback: 'image' }
  );
  const uniqueSuffix = randomUUID().replace(/-/g, '');
  return `${baseName}-${uniqueSuffix}${sanitizeFileExtension(file)}`;
}

function buildPublicUrl(baseUrl, fileName) {
  return `${toText(baseUrl).replace(/\/+$/g, '')}/${fileName}`;
}

async function writeUploadedFile({ file, fileName, uploadDir }) {
  const targetDirectory = path.resolve(uploadDir);
  const targetPath = path.join(targetDirectory, fileName);
  const body = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(targetDirectory, { recursive: true });
  await fs.writeFile(targetPath, body);

  return targetPath;
}

export async function POST(request) {
  const token = request.cookies.get(BLOG_ADMIN_SESSION_COOKIE_NAME)?.value;
  const user = await resolveBlogSessionUserFromToken(token);

  if (!user || !canEditBlogPosts(user)) {
    return NextResponse.json({ error: 'Unauthorized blog upload request.' }, { status: 401 });
  }

  const config = getUploadConfig(process.env);

  try {
    ensureUploadConfig(config);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Blog image uploads are not configured.' },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const slugHint = toText(formData.get('slugHint'));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Upload requests must include an image file.' }, { status: 400 });
  }

  if (!file.size) {
    return NextResponse.json({ error: 'Uploaded files must not be empty.' }, { status: 400 });
  }

  if (!isAcceptedImage(file)) {
    return NextResponse.json({ error: 'Only image uploads are allowed.' }, { status: 415 });
  }

  if (file.size > config.maxBytes) {
    return NextResponse.json({ error: `Files must stay under ${Math.round(config.maxBytes / 1024 / 1024)}MB.` }, { status: 413 });
  }

  try {
    const fileName = buildUniqueFileName(file, slugHint);
    await writeUploadedFile({
      file,
      fileName,
      uploadDir: config.uploadDir
    });

    return NextResponse.json({
      url: buildPublicUrl(config.publicUrl, fileName),
      filename: fileName
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Blog image upload failed.' },
      { status: 500 }
    );
  }
}

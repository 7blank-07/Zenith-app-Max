import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const ALLOWED_HOST_PATTERNS = [
  /(^|\.)images\.zenithfcm\.com$/i,
  /(^|\.)renderz\.app$/i,
  /(^|\.)cdn\.futbin\.com$/i,
  /(^|\.)api\.qrserver\.com$/i
];

function isAllowedHost(hostname) {
  return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = String(searchParams.get('url') || '').trim();

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing required query parameter: url' }, { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid export image URL' }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(targetUrl.protocol)) {
    return NextResponse.json({ error: 'Unsupported protocol for export image URL' }, { status: 400 });
  }
  if (!isAllowedHost(targetUrl.hostname)) {
    return NextResponse.json({ error: 'Host is not allowed for export image proxy' }, { status: 403 });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(targetUrl.href, {
      cache: 'force-cache',
      headers: {
        'User-Agent': 'ZenithExportProxy/1.0'
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to fetch export image: ${message}` }, { status: 502 });
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      { error: `Upstream image request failed with status ${upstreamResponse.status}` },
      { status: 502 }
    );
  }

  const contentType = upstreamResponse.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('image/')) {
    return NextResponse.json({ error: 'Upstream response is not an image' }, { status: 415 });
  }

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  headers.set('X-Content-Type-Options', 'nosniff');

  const contentLength = upstreamResponse.headers.get('content-length');
  if (contentLength) {
    headers.set('Content-Length', contentLength);
  }

  return new NextResponse(upstreamResponse.body, {
    status: 200,
    headers
  });
}


import { NextResponse } from 'next/server';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await requireBlogSessionUser();

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path || !path.startsWith('/')) {
      return NextResponse.json({ error: 'Valid path starting with / is required' }, { status: 400 });
    }

    const host = request.headers.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const targetUrl = `${protocol}://${host}${path}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Zenith-Internal-SEO-Bot/1.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch page' }, { status: res.status });
    }

    const html = await res.text();
    
    // Parse title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1] : '';

    // Parse meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    let metaDescription = descMatch ? descMatch[1] : '';

    return NextResponse.json({
      title: title.trim(),
      metaDescription: metaDescription.trim()
    });
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

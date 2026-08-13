import { NextResponse } from 'next/server';
import { listRedirects } from '../../../../src/lib/server/redirects/repository.mjs';

// Revalidate every 60 seconds (or 3600 for 1 hour, but let's keep it somewhat fresh)
export const revalidate = 60;

export async function GET(request) {
  try {
    const redirects = await listRedirects();
    
    // Create a fast lookup map: { '/old-url': '/new-url' }
    const redirectMap = {};
    for (const r of redirects) {
      if (r.oldUrl && r.newUrl) {
        redirectMap[r.oldUrl] = r.newUrl;
      }
    }

    return NextResponse.json(redirectMap);
  } catch (error) {
    console.error('[api/internal/redirects] error fetching redirects', error);
    // Return empty object on failure so we don't break the middleware
    return NextResponse.json({}, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import {
  BLOG_ADMIN_SESSION_COOKIE_NAME,
  buildAdminLoginPath,
  verifySignedBlogSessionToken
} from './src/lib/server/blog/session.mjs';

/**
 * Technical SEO Middleware
 * Handles:
 * 1. Admin authentication
 * 2. Legacy tool query parameter redirects (301)
 * 3. Cleanup of ?tool= param from clean SEO routes
 */
export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // --- 1. Tool Redirects & Cleanup ---
  const toolParam = searchParams.get('tool');

  if (toolParam) {
    // Case A: Legacy root /tools?tool=...
    if (pathname === '/tools') {
      const tool = toolParam.toLowerCase();
      let destination = null;

      if (tool === 'squadbuilder' || tool === 'squad-builder') {
        destination = '/tools/squad-builder';
      } else if (tool === 'compare') {
        destination = '/tools/player-compare';
      } else if (tool === 'watchlist') {
        destination = '/tools/watchlist';
      }

      if (destination) {
        const url = request.nextUrl.clone();
        url.pathname = destination;
        url.search = ''; // Strip all query params
        return NextResponse.redirect(url, 301);
      }
    }

    // Case B: Cleanup /tools/clean-route?tool=...
    if (pathname.startsWith('/tools/')) {
      const url = request.nextUrl.clone();
      url.searchParams.delete('tool'); // Specifically remove 'tool' param
      // If no other params remain, clear search string entirely
      if (url.searchParams.toString() === '') {
        url.search = '';
      }
      return NextResponse.redirect(url, 301);
    }
  }

  // --- 2. Admin Authentication ---
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin') {
      return NextResponse.next();
    }

    const token = request.cookies.get(BLOG_ADMIN_SESSION_COOKIE_NAME)?.value;
    const session = await verifySignedBlogSessionToken(token, process.env);

    if (session) {
      return NextResponse.next();
    }

    const response = NextResponse.redirect(
      new URL(buildAdminLoginPath(`${pathname}${request.nextUrl.search || ''}`), request.url)
    );

    if (token) {
      response.cookies.set(BLOG_ADMIN_SESSION_COOKIE_NAME, '', {
        path: '/',
        maxAge: 0
      });
    }

    return response;
  }

  // --- 3. Global DB Redirects ---
  // Only process if it's a GET request and not an API or static route
  if (request.method === 'GET' && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.match(/\.[^/]+$/)) {
    try {
      // Fetch redirects from our internal API (which will be cached heavily by Next.js fetch cache)
      const baseUrl = request.nextUrl.origin;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout to prevent hanging

      let res;
      try {
        // Try local fetch first for speed (avoids public network loop)
        const port = process.env.PORT || 3000;
        res = await fetch(`http://127.0.0.1:${port}/api/internal/redirects`, {
          signal: controller.signal,
          headers: { host: request.nextUrl.host }
        });
      } catch (localErr) {
        // Fallback to public URL if local fails
        res = await fetch(`${baseUrl}/api/internal/redirects`, {
          signal: controller.signal,
        });
      }
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const redirectMap = await res.json();
        
        // Check if current pathname has a redirect
        if (redirectMap[pathname]) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = redirectMap[pathname];
          // Preserve search params if any
          return NextResponse.redirect(redirectUrl, 301);
        }
      }
    } catch (e) {
      console.error('[middleware] Failed to fetch or process redirects:', e);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Broaden matcher to include tools, admin, and all general routes for global redirects
  // Excluding /api, /_next/static, /_next/image, favicon.ico, and common asset extensions
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)']
};

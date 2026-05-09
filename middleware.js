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

  return NextResponse.next();
}

export const config = {
  // Broaden matcher to include tools and admin
  matcher: ['/admin/:path*', '/tools', '/tools/:path*']
};

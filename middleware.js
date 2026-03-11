import { NextResponse } from 'next/server';
import {
  BLOG_ADMIN_SESSION_COOKIE_NAME,
  buildAdminLoginPath,
  verifySignedBlogSessionToken
} from './src/lib/server/blog/session.mjs';

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/admin') {
    return NextResponse.next();
  }

  const token = request.cookies.get(BLOG_ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = await verifySignedBlogSessionToken(token, process.env);

  if (session) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(
    new URL(buildAdminLoginPath(`${pathname}${search || ''}`), request.url)
  );

  if (token) {
    response.cookies.set(BLOG_ADMIN_SESSION_COOKIE_NAME, '', {
      path: '/',
      maxAge: 0
    });
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*']
};

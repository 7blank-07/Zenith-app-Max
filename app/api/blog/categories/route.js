import { NextResponse } from 'next/server';
import { BLOG_ADMIN_SESSION_COOKIE_NAME } from '../../../../src/lib/server/blog/session.mjs';
import { resolveBlogSessionUserFromToken } from '../../../../src/lib/server/blog/auth.mjs';
import { canReviewBlogPosts } from '../../../../src/lib/server/blog/permissions.mjs';
import { createBlogCategory } from '../../../../src/lib/server/blog/repository.mjs';

export const runtime = 'nodejs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function resolveStatusCode(error) {
  const message = toText(error instanceof Error ? error.message : error).toLowerCase();
  if (message.includes('already exists')) {
    return 409;
  }

  if (message.includes('required')) {
    return 400;
  }

  return 500;
}

export async function POST(request) {
  const token = request.cookies.get(BLOG_ADMIN_SESSION_COOKIE_NAME)?.value;
  const user = await resolveBlogSessionUserFromToken(token);

  if (!user || !canReviewBlogPosts(user)) {
    return NextResponse.json(
      { error: 'Only blog admins can create categories.' },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  try {
    const category = await createBlogCategory({
      name: toText(body?.name),
      slug: toText(body?.slug),
      description: toText(body?.description)
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Category creation failed.' },
      { status: resolveStatusCode(error) }
    );
  }
}

import { revalidatePath } from 'next/cache';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizePath(pathValue) {
  const trimmed = toText(pathValue);
  return trimmed.startsWith('/') ? trimmed : '';
}

function getCategorySlug(post) {
  return toText(post?.category?.slug || post?.categorySlug);
}

function getTagSlugs(post) {
  const tagSlugs = new Set();
  const source = Array.isArray(post?.tags)
    ? post.tags
    : Array.isArray(post?.tagSlugs)
      ? post.tagSlugs
      : [];

  for (const entry of source) {
    if (typeof entry === 'string') {
      const slug = toText(entry);
      if (slug) tagSlugs.add(slug);
      continue;
    }

    const slug = toText(entry?.slug || entry?.name);
    if (slug) tagSlugs.add(slug);
  }

  return [...tagSlugs];
}

function addPublishedPostPaths(targetPaths, post) {
  if (!post || toText(post.status) !== 'published') {
    return;
  }

  const categorySlug = getCategorySlug(post);
  const articleSlug = toText(post?.slug);

  targetPaths.add('/');
  targetPaths.add('/blogs');
  targetPaths.add('/sitemap.xml');

  if (categorySlug) {
    targetPaths.add(`/blogs/${encodeURIComponent(categorySlug)}`);
  }

  if (categorySlug && articleSlug) {
    targetPaths.add(`/blogs/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`);
  }

  for (const tagSlug of getTagSlugs(post)) {
    targetPaths.add(`/blogs/tag/${encodeURIComponent(tagSlug)}`);
  }
}

export function buildBlogRevalidationPaths({ previousPost = null, nextPost = null, extraPaths = [] } = {}) {
  const targetPaths = new Set();

  addPublishedPostPaths(targetPaths, previousPost);
  addPublishedPostPaths(targetPaths, nextPost);

  for (const extraPath of Array.isArray(extraPaths) ? extraPaths : []) {
    const normalized = normalizePath(extraPath);
    if (normalized) {
      targetPaths.add(normalized);
    }
  }

  return [...targetPaths];
}

export function buildBlogRevalidationPathsFromPayload(body = {}) {
  return buildBlogRevalidationPaths({
    previousPost: body.previousBlogPost || body.previousBlog,
    nextPost: body.blogPost || body.blog,
    extraPaths: body.blogPaths
  });
}

export async function revalidateAppPaths(paths = []) {
  const uniquePaths = [...new Set((Array.isArray(paths) ? paths : []).map((entry) => normalizePath(entry)).filter(Boolean))];
  const failures = [];

  for (const path of uniquePaths) {
    try {
      revalidatePath(path);
    } catch (error) {
      failures.push({
        path,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    paths: uniquePaths,
    failures
  };
}

export async function revalidateBlogChange({ previousPost = null, nextPost = null, extraPaths = [] } = {}) {
  const paths = buildBlogRevalidationPaths({
    previousPost,
    nextPost,
    extraPaths
  });

  return revalidateAppPaths(paths);
}


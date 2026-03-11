import { BLOG_CATEGORY_SLUGS, BLOG_SLUG_MAX_LENGTH } from './constants.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function trimSlug(slug, maxLength) {
  if (slug.length <= maxLength) return slug;

  const sliced = slug.slice(0, maxLength).replace(/-+$/g, '');
  const boundary = sliced.lastIndexOf('-');
  if (boundary >= Math.floor(maxLength * 0.6)) {
    return sliced.slice(0, boundary);
  }
  return sliced;
}

function normalizeSlugText(value) {
  return toText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function slugifyBlogSegment(value, options = {}) {
  const maxLength = Number.isFinite(Number(options.maxLength)) && Number(options.maxLength) > 0
    ? Math.trunc(Number(options.maxLength))
    : BLOG_SLUG_MAX_LENGTH;

  const fallback = toText(options.fallback || 'post', 'post');
  const normalizedFallback = fallback === value ? 'post' : fallback;

  const slug = trimSlug(
    normalizeSlugText(value)
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-'),
    maxLength
  );

  if (slug) return slug;

  const safeFallback = normalizeSlugText(normalizedFallback)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'post';

  return trimSlug(safeFallback, maxLength);
}

export function appendSlugSuffix(baseSlug, suffix, options = {}) {
  const maxLength = Number.isFinite(Number(options.maxLength)) && Number(options.maxLength) > 0
    ? Math.trunc(Number(options.maxLength))
    : BLOG_SLUG_MAX_LENGTH;

  const normalizedBase = slugifyBlogSegment(baseSlug, { maxLength, fallback: 'post' });
  const normalizedSuffix = slugifyBlogSegment(suffix, { maxLength, fallback: '' });
  if (!normalizedSuffix) return normalizedBase;

  const remainingLength = Math.max(1, maxLength - normalizedSuffix.length - 1);
  const truncatedBase = trimSlug(normalizedBase, remainingLength) || 'post';
  return `${truncatedBase}-${normalizedSuffix}`;
}

export function isBlogCategorySlug(value) {
  return BLOG_CATEGORY_SLUGS.includes(toText(value).toLowerCase());
}

export function assertBlogCategorySlug(value) {
  const slug = toText(value).toLowerCase();
  if (!isBlogCategorySlug(slug)) {
    throw new Error(`Unsupported blog category slug "${value}".`);
  }
  return slug;
}

export async function generateUniqueBlogSlug(value, isTaken, options = {}) {
  if (typeof isTaken !== 'function') {
    throw new Error('generateUniqueBlogSlug requires an isTaken callback.');
  }

  const maxLength = Number.isFinite(Number(options.maxLength)) && Number(options.maxLength) > 0
    ? Math.trunc(Number(options.maxLength))
    : BLOG_SLUG_MAX_LENGTH;
  const maxAttempts = Number.isFinite(Number(options.maxAttempts)) && Number(options.maxAttempts) > 1
    ? Math.trunc(Number(options.maxAttempts))
    : 100;

  const baseSlug = slugifyBlogSegment(value, {
    maxLength,
    fallback: toText(options.fallback || 'post', 'post')
  });

  if (!(await isTaken(baseSlug))) {
    return baseSlug;
  }

  for (let suffix = 2; suffix <= maxAttempts; suffix += 1) {
    const candidate = appendSlugSuffix(baseSlug, String(suffix), { maxLength });
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  throw new Error(`Unable to generate a unique slug for "${value}".`);
}

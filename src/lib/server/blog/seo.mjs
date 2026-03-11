import React from 'react';
import { BLOG_FIXED_CATEGORIES, BLOG_MAX_PAGE_SIZE } from './constants.mjs';
import { getBlogArticlePageData, getBlogCategoryPageData, getBlogIndexPageData, getBlogPublicAvailability, getBlogTagPageData } from './public.mjs';
import { listBlogCategories, listPublishedBlogs } from './repository.mjs';

const { cache } = React;

export const BLOG_ROUTE_REVALIDATE_SECONDS = 60 * 60;

const BLOG_SITE_NAME = 'Zenith';
const BLOG_SECTION_NAME = 'Zenith Blogs';
const BLOG_DEFAULT_DESCRIPTION = 'Daily FC Mobile news, investments, event guides, and reviews.';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toTextArray(values) {
  return Array.isArray(values) ? values.map((entry) => toText(entry)).filter(Boolean) : [];
}

function pageSearchParams(page) {
  return page > 1 ? { page: String(page) } : {};
}

function pageSuffix(page) {
  return page > 1 ? ` - Page ${page}` : '';
}

function buildCanonicalPath(basePath, page) {
  return page > 1 ? `${basePath}?page=${page}` : basePath;
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(toText(value));
}

export function getBlogSiteUrl(rawEnv = process.env) {
  const fallback = 'https://zenithfcm.com';
  const siteUrl = toText(rawEnv.NEXT_PUBLIC_SITE_URL, fallback);

  try {
    return new URL(siteUrl).toString();
  } catch {
    return fallback;
  }
}

export function toAbsoluteBlogUrl(pathValue, rawEnv = process.env) {
  const value = toText(pathValue);
  if (isAbsoluteUrl(value)) return value;
  return new URL(value.startsWith('/') ? value : `/${value}`, getBlogSiteUrl(rawEnv)).toString();
}

export function humanizeBlogSlug(value) {
  return toText(value)
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() || ''}${part.slice(1).toLowerCase()}`)
    .join(' ');
}

export function parseBlogPageParam(searchParams) {
  const rawValue = Array.isArray(searchParams?.page) ? searchParams.page[0] : searchParams?.page;
  const parsed = Number.parseInt(String(rawValue ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getSeoImageUrl(imageValue, rawEnv = process.env) {
  const image = toText(imageValue);
  if (!image) return undefined;
  return isAbsoluteUrl(image) ? image : toAbsoluteBlogUrl(image, rawEnv);
}

function buildMetadata({
  title,
  description,
  canonicalPath,
  keywords = [],
  image,
  noIndex = false,
  openGraphType = 'website',
  article = null
} = {}) {
  const imageUrl = getSeoImageUrl(image);
  const metadata = {
    title,
    description,
    keywords: toTextArray(keywords),
    alternates: {
      canonical: canonicalPath
    },
    robots: {
      index: !noIndex,
      follow: !noIndex
    },
    openGraph: {
      title,
      description,
      type: openGraphType,
      url: toAbsoluteBlogUrl(canonicalPath),
      siteName: BLOG_SITE_NAME
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description
    }
  };

  if (imageUrl) {
    metadata.openGraph.images = [{ url: imageUrl }];
    metadata.twitter.images = [imageUrl];
  }

  if (openGraphType === 'article' && article) {
    metadata.authors = article.author?.name ? [{ name: article.author.name }] : undefined;
    metadata.openGraph.publishedTime = article.publishedAt || undefined;
    metadata.openGraph.modifiedTime = article.updatedAt || article.publishedAt || undefined;
    metadata.openGraph.authors = article.author?.name ? [article.author.name] : undefined;
    metadata.openGraph.tags = Array.isArray(article.tags) ? article.tags.map((tag) => tag.name).filter(Boolean) : undefined;
    metadata.openGraph.section = article.category?.name || undefined;
  }

  return metadata;
}

export const getCachedBlogIndexPageData = cache(async (page = 1) => getBlogIndexPageData({ searchParams: pageSearchParams(page) }));
export const getCachedBlogCategoryPageData = cache(async (categorySlug, page = 1) =>
  getBlogCategoryPageData(categorySlug, { searchParams: pageSearchParams(page) })
);
export const getCachedBlogTagPageData = cache(async (tagSlug, page = 1) =>
  getBlogTagPageData(tagSlug, { searchParams: pageSearchParams(page) })
);
export const getCachedBlogArticlePageData = cache(async (categorySlug, slug) => getBlogArticlePageData(categorySlug, slug));

export function buildBlogIndexRouteMetadata(pageData, { page = 1 } = {}) {
  const noIndex = pageData?.availability?.isConfigured === false;

  return buildMetadata({
    title: `Blogs | Zenith${pageSuffix(page)}`,
    description: pageData?.description || BLOG_DEFAULT_DESCRIPTION,
    canonicalPath: buildCanonicalPath('/blogs', page),
    keywords: ['FC Mobile blog', 'FC Mobile news', 'FC Mobile reviews', 'FC Mobile investments'],
    image: pageData?.featuredPosts?.[0]?.coverImage,
    noIndex
  });
}

export function buildBlogCategoryRouteMetadata(pageData, { categorySlug, page = 1 } = {}) {
  const categoryName = pageData?.category?.name || pageData?.title || humanizeBlogSlug(categorySlug) || 'Blogs';
  const description = pageData?.description || BLOG_DEFAULT_DESCRIPTION;

  return buildMetadata({
    title: `${categoryName} | Zenith Blogs${pageSuffix(page)}`,
    description,
    canonicalPath: buildCanonicalPath(`/blogs/${encodeURIComponent(categorySlug)}`, page),
    keywords: [categoryName, 'FC Mobile', 'Zenith Blogs'],
    image: pageData?.posts?.[0]?.coverImage,
    noIndex: pageData?.availability?.isConfigured === false || !pageData
  });
}

export function buildBlogTagRouteMetadata(pageData, { tagSlug, page = 1 } = {}) {
  const tagName = pageData?.tag?.name || pageData?.activeTag?.name || humanizeBlogSlug(tagSlug) || 'Tag';
  const description =
    pageData?.description ||
    `FC Mobile ${tagName} guides, news, reviews, and market analysis from Zenith.`;

  return buildMetadata({
    title: `${tagName} | Zenith Blogs${pageSuffix(page)}`,
    description,
    canonicalPath: buildCanonicalPath(`/blogs/tag/${encodeURIComponent(tagSlug)}`, page),
    keywords: [tagName, 'FC Mobile', 'Zenith Blogs'],
    image: pageData?.posts?.[0]?.coverImage,
    noIndex: pageData?.availability?.isConfigured === false || !pageData
  });
}

export function buildBlogArticleRouteMetadata(pageData, { categorySlug, slug } = {}) {
  const article = pageData?.post;

  if (!article) {
    return buildMetadata({
      title: 'Blog Article | Zenith',
      description: 'Read the latest FC Mobile editorial coverage from Zenith.',
      canonicalPath: `/blogs/${encodeURIComponent(toText(categorySlug, 'article'))}/${encodeURIComponent(toText(slug, 'post'))}`,
      noIndex: true
    });
  }

  return buildMetadata({
    title: `${article.title} | Zenith Blogs`,
    description: article.metaDescription || article.excerpt || BLOG_DEFAULT_DESCRIPTION,
    canonicalPath: `/blogs/${encodeURIComponent(article.category?.slug || categorySlug)}/${encodeURIComponent(article.slug || slug)}`,
    keywords: [...toTextArray(article.seoKeywords), ...toTextArray(article.tags?.map((tag) => tag.name)), article.category?.name].filter(Boolean),
    image: article.coverImage,
    noIndex: pageData?.availability?.isConfigured === false,
    openGraphType: 'article',
    article
  });
}

function resolveLatestDate(posts = []) {
  const timestamps = posts
    .map((post) => post?.updatedAt || post?.publishedAt || post?.createdAt)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .map((value) => value.getTime());

  return timestamps.length ? new Date(Math.max(...timestamps)) : new Date();
}

async function listAllPublishedBlogsForSitemap() {
  const items = [];
  let page = 1;

  while (true) {
    const result = await listPublishedBlogs({
      page,
      pageSize: BLOG_MAX_PAGE_SIZE
    });

    if (!result.items.length) {
      break;
    }

    items.push(...result.items);

    if (!result.pagination?.hasNextPage) {
      break;
    }

    page += 1;
  }

  return items;
}

function getPublishedCategoryEntries(posts) {
  const categoryMap = new Map();

  for (const post of posts) {
    const slug = toText(post?.category?.slug);
    if (!slug) continue;

    const current = categoryMap.get(slug);
    const nextDate = new Date(post.updatedAt || post.publishedAt || post.createdAt || Date.now());

    if (!current || nextDate > current.lastModified) {
      categoryMap.set(slug, {
        slug,
        lastModified: nextDate
      });
    }
  }

  return [...categoryMap.values()];
}

function getPublishedTagEntries(posts) {
  const tagMap = new Map();

  for (const post of posts) {
    for (const tag of Array.isArray(post.tags) ? post.tags : []) {
      const slug = toText(tag?.slug);
      if (!slug) continue;

      const current = tagMap.get(slug);
      const nextDate = new Date(post.updatedAt || post.publishedAt || post.createdAt || Date.now());

      if (!current || nextDate > current.lastModified) {
        tagMap.set(slug, {
          slug,
          lastModified: nextDate
        });
      }
    }
  }

  return [...tagMap.values()];
}

export async function getBlogSitemapEntries(rawEnv = process.env) {
  const availability = getBlogPublicAvailability(rawEnv);

  if (!availability.isConfigured) {
    return [];
  }

  try {
    const [categories, posts] = await Promise.all([
      listBlogCategories(),
      listAllPublishedBlogsForSitemap()
    ]);

    const latestDate = resolveLatestDate(posts);
    const entries = [
      {
        url: toAbsoluteBlogUrl('/blogs', rawEnv),
        lastModified: latestDate,
        changeFrequency: 'daily',
        priority: 0.85
      }
    ];

    const publishedCategories = getPublishedCategoryEntries(posts);
    const publishedCategorySlugs = new Set(publishedCategories.map((entry) => entry.slug));

    for (const category of categories) {
      if (!publishedCategorySlugs.has(category.slug)) continue;
      const matched = publishedCategories.find((entry) => entry.slug === category.slug);

      entries.push({
        url: toAbsoluteBlogUrl(`/blogs/${encodeURIComponent(category.slug)}`, rawEnv),
        lastModified: matched?.lastModified || latestDate,
        changeFrequency: 'daily',
        priority: 0.8
      });
    }

    for (const tag of getPublishedTagEntries(posts)) {
      entries.push({
        url: toAbsoluteBlogUrl(`/blogs/tag/${encodeURIComponent(tag.slug)}`, rawEnv),
        lastModified: tag.lastModified,
        changeFrequency: 'weekly',
        priority: 0.65
      });
    }

    for (const post of posts) {
      const categorySlug = toText(post?.category?.slug);
      const slug = toText(post?.slug);
      if (!categorySlug || !slug) continue;

      entries.push({
        url: toAbsoluteBlogUrl(`/blogs/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slug)}`, rawEnv),
        lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.75
      });
    }

    return entries;
  } catch (error) {
    console.error('[blog-seo] sitemap generation failed', {
      message: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

export function getBlogDefaultCategories() {
  return BLOG_FIXED_CATEGORIES;
}

export function getBlogSiteName() {
  return BLOG_SITE_NAME;
}

export function getBlogSectionName() {
  return BLOG_SECTION_NAME;
}


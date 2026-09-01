import {
  BLOG_DEFAULT_PAGE_SIZE,
  BLOG_FEATURED_HOME_LIMIT,
  BLOG_FIXED_CATEGORIES,
  BLOG_RELATED_ARTICLES_LIMIT
} from './constants.mjs';
import { getBlogEnvironment } from './env.mjs';
import {
  getPublishedBlogByCategoryAndSlug,
  listActiveBlogCategories,
  listBlogCategories,
  listFeaturedBlogs,
  listPublishedBlogs,
  listPublishedBlogsByCategory,
  listPublishedBlogsByTag
} from './repository.mjs';

const BLOG_SETUP_TITLE = 'Blog CMS is not configured yet';
const BLOG_SETUP_DESCRIPTION =
  'Set `BLOG_DATABASE_URL` (or `DATABASE_URL`), run `npm run db:migrate:blog`, and publish articles to populate these public blog routes.';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function humanizeSlug(value) {
  return toText(value)
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() || ''}${part.slice(1).toLowerCase()}`)
    .join(' ');
}

function readSearchParam(searchParams, key) {
  if (!searchParams) return '';
  const rawValue = searchParams[key];
  if (Array.isArray(rawValue)) {
    return toText(rawValue[0]);
  }
  return toText(rawValue);
}

function parsePage(searchParams) {
  const parsed = Number.parseInt(readSearchParam(searchParams, 'page'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildEmptyPagination(page) {
  return {
    page,
    pageSize: BLOG_DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: page > 1,
    hasNextPage: false
  };
}

function toPublicCategory(category) {
  return {
    id: toText(category.id || category.slug),
    name: toText(category.name),
    slug: toText(category.slug),
    description: toText(category.description)
  };
}

function getFallbackCategories() {
  return BLOG_FIXED_CATEGORIES.map((category) => toPublicCategory(category));
}

function getFallbackCategoryBySlug(categorySlug) {
  const normalizedSlug = toText(categorySlug).toLowerCase();
  const category = BLOG_FIXED_CATEGORIES.find((entry) => entry.slug === normalizedSlug);
  return category ? toPublicCategory(category) : null;
}

export function getKnownBlogCategory(categorySlug) {
  return getFallbackCategoryBySlug(categorySlug);
}

export function getBlogPublicAvailability(rawEnv = process.env) {
  const { databaseUrl } = getBlogEnvironment(rawEnv);
  return {
    isConfigured: Boolean(databaseUrl),
    title: BLOG_SETUP_TITLE,
    description: BLOG_SETUP_DESCRIPTION
  };
}

function buildPopularPosts(posts, limit = 5) {
  const deduped = new Map();

  for (const post of Array.isArray(posts) ? posts : []) {
    if (!post?.id || deduped.has(post.id)) continue;
    deduped.set(post.id, post);
  }

  return [...deduped.values()]
    .sort((left, right) => {
      if ((right.views || 0) !== (left.views || 0)) {
        return (right.views || 0) - (left.views || 0);
      }

      return String(right.publishedAt || right.createdAt || '').localeCompare(String(left.publishedAt || left.createdAt || ''));
    })
    .slice(0, limit);
}

function mergeUniquePosts(groups, limit) {
  const merged = [];
  const seen = new Set();

  for (const group of groups) {
    for (const post of group || []) {
      if (!post?.id || seen.has(post.id)) continue;
      seen.add(post.id);
      merged.push(post);
      if (merged.length >= limit) {
        return merged;
      }
    }
  }

  return merged;
}

function buildUnavailableCollectionState({ page, title, description, categories, activeCategorySlug, activeTag }) {
  return {
    availability: getBlogPublicAvailability(),
    categories,
    title,
    description,
    activeCategorySlug: activeCategorySlug || '',
    activeTag: activeTag || null,
    featuredPosts: [],
    popularPosts: [],
    posts: [],
    pagination: buildEmptyPagination(page),
    emptyTitle: BLOG_SETUP_TITLE,
    emptyDescription: BLOG_SETUP_DESCRIPTION
  };
}

export async function getBlogIndexPageData({ searchParams = {}, rawEnv = process.env } = {}) {
  const page = parsePage(searchParams);
  const availability = getBlogPublicAvailability(rawEnv);
  const rawCategories = availability.isConfigured ? await listActiveBlogCategories() : getFallbackCategories();
  const categories = rawCategories.filter((cat) => cat.slug !== 'redeem-codes');

  if (!availability.isConfigured) {
    return buildUnavailableCollectionState({
      page,
      title: 'Zenith Blogs',
      description: 'Daily FC Mobile news, investments, event guides, and reviews.',
      categories
    });
  }

  const featuredPosts = await listFeaturedBlogs({ limit: BLOG_FEATURED_HOME_LIMIT });
  const listResult = await listPublishedBlogs({
    page,
    pageSize: BLOG_DEFAULT_PAGE_SIZE,
    excludeFeatured: featuredPosts.length > 0
  });

  return {
    availability,
    categories,
    title: 'Zenith Blogs',
    description: 'Daily FC Mobile news, investments, event guides, and reviews.',
    activeCategorySlug: '',
    activeTag: null,
    featuredPosts,
    popularPosts: buildPopularPosts([...featuredPosts, ...listResult.items]),
    posts: listResult.items,
    pagination: listResult.pagination,
    emptyTitle: 'No published blog posts yet',
    emptyDescription: 'Published blog articles will appear here once the editorial workflow starts shipping content.'
  };
}

export async function getBlogCategoryPageData(categorySlug, { searchParams = {}, rawEnv = process.env } = {}) {
  const normalizedCategorySlug = toText(categorySlug).toLowerCase();
  if (!normalizedCategorySlug) return null;

  const page = parsePage(searchParams);
  const availability = getBlogPublicAvailability(rawEnv);

  if (!availability.isConfigured) {
    const fallbackCategory = getFallbackCategoryBySlug(normalizedCategorySlug);
    if (!fallbackCategory) return null;

    return buildUnavailableCollectionState({
      page,
      title: fallbackCategory.name,
      description: fallbackCategory.description,
      categories: getFallbackCategories(),
      activeCategorySlug: fallbackCategory.slug
    });
  }

  const rawCategories = await listBlogCategories();
  const categories = rawCategories.filter((cat) => cat.slug !== 'redeem-codes');
  const result = await listPublishedBlogsByCategory(normalizedCategorySlug, {
    page,
    pageSize: BLOG_DEFAULT_PAGE_SIZE
  });

  if (!result.category) {
    return null;
  }

  return {
    availability,
    categories,
    title: result.category.name,
    description: result.category.description || `Published FC Mobile articles in ${result.category.name}.`,
    activeCategorySlug: result.category.slug,
    activeTag: null,
    category: result.category,
    featuredPosts: [],
    popularPosts: buildPopularPosts(result.items),
    posts: result.items,
    pagination: result.pagination,
    emptyTitle: `No ${result.category.name.toLowerCase()} articles yet`,
    emptyDescription: `Published articles in ${result.category.name} will appear here as soon as they are available.`
  };
}

export async function getBlogTagPageData(tagSlug, { searchParams = {}, rawEnv = process.env } = {}) {
  const page = parsePage(searchParams);
  const availability = getBlogPublicAvailability(rawEnv);
  const rawCategories = availability.isConfigured ? await listBlogCategories() : getFallbackCategories();
  const categories = rawCategories.filter((cat) => cat.slug !== 'redeem-codes');
  const tagLabel = humanizeSlug(tagSlug);

  if (!availability.isConfigured) {
    return buildUnavailableCollectionState({
      page,
      title: `Tag: ${tagLabel}`,
      description: `Published FC Mobile articles tagged with ${tagLabel}.`,
      categories,
      activeTag: { slug: toText(tagSlug), name: tagLabel }
    });
  }

  const result = await listPublishedBlogsByTag(toText(tagSlug), {
    page,
    pageSize: BLOG_DEFAULT_PAGE_SIZE
  });

  if (!result.tag) {
    return null;
  }

  return {
    availability,
    categories,
    title: `${result.tag.name} FC Mobile Articles`,
    description: `FC Mobile ${result.tag.name} guides, news, reviews, and market analysis from Zenith.`,
    activeCategorySlug: '',
    activeTag: result.tag,
    tag: result.tag,
    featuredPosts: [],
    popularPosts: buildPopularPosts(result.items),
    posts: result.items,
    pagination: result.pagination,
    emptyTitle: `No published posts for ${result.tag.name}`,
    emptyDescription: 'This tag exists, but there are no published articles assigned to it yet.'
  };
}

export async function getBlogArticlePageData(categorySlug, slug, { rawEnv = process.env } = {}) {
  const normalizedCategorySlug = toText(categorySlug).toLowerCase();
  const normalizedSlug = toText(slug);
  if (!normalizedCategorySlug || !normalizedSlug) return null;

  const availability = getBlogPublicAvailability(rawEnv);

  if (!availability.isConfigured) {
    const fallbackCategory = getFallbackCategoryBySlug(normalizedCategorySlug);
    if (!fallbackCategory) return null;

    return {
      availability,
      categories: getFallbackCategories(),
      category: fallbackCategory,
      post: null,
      relatedPosts: []
    };
  }

  const rawCategories = await listBlogCategories();
  const categories = rawCategories.filter((cat) => cat.slug !== 'redeem-codes');
  const post = await getPublishedBlogByCategoryAndSlug(normalizedCategorySlug, normalizedSlug);
  if (!post) {
    return null;
  }

  const relatedRequests = [
    listPublishedBlogs({
      categorySlug: post.category?.slug,
      excludeBlogId: post.id,
      pageSize: BLOG_RELATED_ARTICLES_LIMIT
    }),
    listPublishedBlogs({
      excludeBlogId: post.id,
      pageSize: BLOG_RELATED_ARTICLES_LIMIT
    })
  ];

  if (post.tags?.[0]?.slug) {
    relatedRequests.splice(
      1,
      0,
      listPublishedBlogs({
        tagSlug: post.tags[0].slug,
        excludeBlogId: post.id,
        pageSize: BLOG_RELATED_ARTICLES_LIMIT
      })
    );
  }

  const [categoryRelated, maybeTagRelated, latestRelated] = await Promise.all(relatedRequests);
  const relatedGroups = relatedRequests.length === 3
    ? [categoryRelated.items, maybeTagRelated.items, latestRelated.items]
    : [categoryRelated.items, maybeTagRelated.items];

  return {
    availability,
    categories,
    category: post.category || null,
    post,
    relatedPosts: mergeUniquePosts(relatedGroups, BLOG_RELATED_ARTICLES_LIMIT)
  };
}

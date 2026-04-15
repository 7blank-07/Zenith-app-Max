import { getStoredEditorHtml, sanitizeRichTextHtml } from './html.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toNullableText(value) {
  const text = toText(value);
  return text || null;
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const normalized = toText(value).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseJsonValue(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      return JSON.parse(trimmed);
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object') return value;
  return fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  const parsed = parseJsonValue(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

function toObject(value) {
  const parsed = parseJsonValue(value, null);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
}

function toTextArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toText(entry))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

export function serializeBlogUserRow(row) {
  if (!row) return null;
  const source = toObject(row) || row;

  return {
    id: toText(source.id),
    name: toText(source.name),
    email: toText(source.email),
    role: toText(source.role),
    isActive: toBoolean(source.is_active ?? source.isActive),
    sessionVersion: toInteger(source.session_version ?? source.sessionVersion, 1),
    createdAt: toIso(source.created_at ?? source.createdAt),
    updatedAt: toIso(source.updated_at ?? source.updatedAt)
  };
}

export function serializeBlogCategoryRow(row) {
  if (!row) return null;
  const source = toObject(row) || row;

  return {
    id: toText(source.id),
    name: toText(source.name),
    slug: toText(source.slug),
    description: toNullableText(source.description),
    createdAt: toIso(source.created_at ?? source.createdAt),
    updatedAt: toIso(source.updated_at ?? source.updatedAt)
  };
}

export function serializeBlogTagRow(row) {
  if (!row) return null;
  const source = toObject(row) || row;

  return {
    id: toText(source.id),
    name: toText(source.name),
    slug: toText(source.slug),
    createdAt: toIso(source.created_at ?? source.createdAt),
    updatedAt: toIso(source.updated_at ?? source.updatedAt)
  };
}

export function serializeBlogPostRow(row) {
  if (!row) return null;
  const source = row;

  const category = serializeBlogCategoryRow(
    source.category || {
      id: source.category_id ?? source.categoryId,
      name: source.category_name ?? source.categoryName,
      slug: source.category_slug ?? source.categorySlug,
      description: source.category_description ?? source.categoryDescription
    }
  );

  const author = serializeBlogUserRow(
    source.author || {
      id: source.author_id ?? source.authorId,
      name: source.author_name ?? source.authorName,
      email: source.author_email ?? source.authorEmail,
      role: source.author_role ?? source.authorRole,
      is_active: source.author_is_active ?? source.authorIsActive,
      session_version: source.author_session_version ?? source.authorSessionVersion
    }
  );

  const tags = toArray(source.tags)
    .map((tag) => serializeBlogTagRow(tag))
    .filter(Boolean);
  const contentJson = parseJsonValue(source.content_json ?? source.contentJson, null);
  const contentHtml = sanitizeRichTextHtml(
    getStoredEditorHtml(contentJson, source.content_html ?? source.contentHtml)
  );

  return {
    id: toText(source.id),
    title: toText(source.title),
    subtitle: toNullableText(source.subtitle),
    slug: toText(source.slug),
    excerpt: toNullableText(source.excerpt),
    categoryId: category?.id || toText(source.category_id ?? source.categoryId),
    authorId: author?.id || toText(source.author_id ?? source.authorId),
    coverImage: toNullableText(source.cover_image ?? source.coverImage),
    contentJson,
    contentHtml: contentHtml || null,
    seoKeywords: toTextArray(source.seo_keywords ?? source.seoKeywords),
    metaDescription: toNullableText(source.meta_description ?? source.metaDescription),
    featured: toBoolean(source.featured),
    views: toInteger(source.views, 0),
    internalLinks: toArray(source.internal_links ?? source.internalLinks),
    externalLinks: toArray(source.external_links ?? source.externalLinks),
    status: toText(source.status),
    readingTime: Math.max(1, toInteger(source.reading_time ?? source.readingTime, 1)),
    publishedAt: toIso(source.published_at ?? source.publishedAt),
    createdAt: toIso(source.created_at ?? source.createdAt),
    updatedAt: toIso(source.updated_at ?? source.updatedAt),
    category,
    author,
    tags
  };
}

export function serializeBlogStatusCountsRow(row) {
  const source = row || {};
  return {
    draft: toInteger(source.draft_count ?? source.draftCount, 0),
    pending: toInteger(source.pending_count ?? source.pendingCount, 0),
    published: toInteger(source.published_count ?? source.publishedCount, 0),
    rejected: toInteger(source.rejected_count ?? source.rejectedCount, 0),
    total: toInteger(source.total_count ?? source.totalCount, 0)
  };
}

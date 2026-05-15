import {
  BLOG_DEFAULT_ADMIN_PAGE_SIZE,
  BLOG_DEFAULT_PAGE_SIZE,
  BLOG_EXCERPT_MAX_LENGTH,
  BLOG_FEATURED_HOME_LIMIT,
  BLOG_MAX_ADMIN_PAGE_SIZE,
  BLOG_MAX_PAGE_SIZE,
  BLOG_META_DESCRIPTION_MAX_LENGTH,
  BLOG_STATUS,
  BLOG_STATUS_VALUES
} from './constants.mjs';
import { runBlogQuery, withBlogTransaction } from './db.mjs';
import { createExcerpt, estimateReadingTime } from './reading-time.mjs';
import {
  buildBlogSlugExistsQuery,
  buildBlogDashboardCountsQuery,
  buildCountAdminBlogsQuery,
  buildCountPublishedBlogsQuery,
  buildGetPublishedBlogByCategoryAndSlugQuery,
  buildListAdminBlogsQuery,
  buildListPublishedBlogsQuery,
  COUNT_BLOG_STATUS_QUERY,
  DELETE_BLOG_QUERY,
  DELETE_BLOG_TAG_RELATIONS_QUERY,
  GET_BLOG_BY_ID_QUERY,
  GET_BLOG_CATEGORY_BY_ID_QUERY,
  GET_BLOG_CATEGORY_BY_SLUG_QUERY,
  GET_BLOG_TAG_BY_SLUG_QUERY,
  GET_BLOG_USER_BY_ID_QUERY,
  INSERT_BLOG_CATEGORY_QUERY,
  INSERT_BLOG_QUERY,
  INSERT_BLOG_TAG_RELATION_QUERY,
  LIST_ACTIVE_BLOG_CATEGORIES_QUERY,
  LIST_BLOG_CATEGORIES_QUERY,
  LIST_BLOG_TAGS_QUERY,
  UPDATE_BLOG_QUERY,
  UPDATE_BLOG_STATUS_QUERY,
  UPSERT_BLOG_TAG_QUERY
} from './queries.mjs';
import {
  serializeBlogCategoryRow,
  serializeBlogPostRow,
  serializeBlogStatusCountsRow,
  serializeBlogTagRow,
  serializeBlogUserRow
} from './serializers.mjs';
import { generateUniqueBlogSlug, slugifyBlogSegment } from './slugs.mjs';

const DEFAULT_TIPTAP_DOCUMENT = Object.freeze({
  type: 'doc',
  content: []
});

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toNullableText(value) {
  const text = toText(value);
  return text || null;
}

function toInteger(value, fallback = 0, minimum = Number.NEGATIVE_INFINITY) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, parsed);
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function normalizePage(value, fallback = 1) {
  return Math.max(1, toInteger(value, fallback, 1));
}

function normalizePageSize(value, fallback, maximum) {
  const parsed = toInteger(value, fallback, 1);
  return Math.min(parsed, maximum);
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => toText(entry)).filter(Boolean))];
  }

  if (typeof value === 'string') {
    return [...new Set(value.split(',').map((entry) => entry.trim()).filter(Boolean))];
  }

  return [];
}

function normalizeLinks(value) {
  const input = Array.isArray(value) ? value : [];
  const normalized = [];
  const seen = new Set();

  for (const entry of input) {
    if (typeof entry === 'string') {
      const href = toText(entry);
      if (!href || seen.has(href)) continue;
      seen.add(href);
      normalized.push({ href });
      continue;
    }

    if (!entry || typeof entry !== 'object') continue;
    const href = toText(entry.href || entry.url);
    if (!href || seen.has(href)) continue;
    seen.add(href);

    normalized.push({
      href,
      label: toNullableText(entry.label || entry.text || entry.title),
      title: toNullableText(entry.title)
    });
  }

  return normalized;
}

function normalizeJsonDocument(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_TIPTAP_DOCUMENT;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return DEFAULT_TIPTAP_DOCUMENT;
    try {
      return normalizeJsonDocument(JSON.parse(trimmed));
    } catch {
      return DEFAULT_TIPTAP_DOCUMENT;
    }
  }

  if (typeof value === 'object') {
    return value;
  }

  return DEFAULT_TIPTAP_DOCUMENT;
}

function parseStatusOrNull(value) {
  const normalized = toText(value).toLowerCase();
  return BLOG_STATUS_VALUES.includes(normalized) ? normalized : null;
}

function normalizeDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function buildPagination(items, totalItems, page, pageSize) {
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;
  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: totalPages > 0 && page < totalPages
    }
  };
}

async function queryWithExecutor(query, options = {}) {
  const text = typeof query === 'string' ? query : query.text;
  const values = typeof query === 'string' ? [] : query.values || [];
  return runBlogQuery(text, values, options);
}

async function queryOne(query, options = {}) {
  const result = await queryWithExecutor(query, options);
  return result.rows[0] || null;
}

async function resolveCategoryRecord(input, options = {}) {
  if (input?.categoryId) {
    const row = await queryOne({ text: GET_BLOG_CATEGORY_BY_ID_QUERY, values: [toText(input.categoryId)] }, options);
    if (!row) {
      throw new Error(`Blog category "${input.categoryId}" does not exist.`);
    }
    return serializeBlogCategoryRow(row);
  }

  if (input?.categorySlug) {
    const row = await queryOne({ text: GET_BLOG_CATEGORY_BY_SLUG_QUERY, values: [toText(input.categorySlug)] }, options);
    if (!row) {
      throw new Error(`Blog category "${input.categorySlug}" does not exist.`);
    }
    return serializeBlogCategoryRow(row);
  }

  throw new Error('A blog category is required.');
}

async function resolveAuthorRecord(input, options = {}) {
  const authorId = toText(input?.authorId);
  if (!authorId) {
    throw new Error('An authorId is required.');
  }

  const row = await queryOne({ text: GET_BLOG_USER_BY_ID_QUERY, values: [authorId] }, options);
  if (!row) {
    throw new Error(`Author "${authorId}" does not exist.`);
  }

  const author = serializeBlogUserRow(row);
  if (!author?.isActive) {
    throw new Error(`Author "${authorId}" is not active.`);
  }

  return author;
}

function normalizeTagInputs(tags) {
  const rawValues = Array.isArray(tags) ? tags : normalizeStringArray(tags);
  const deduped = new Map();

  for (const entry of rawValues) {
    if (typeof entry === 'string') {
      const name = toText(entry);
      if (!name) continue;
      const slug = slugifyBlogSegment(name, { fallback: 'tag' });
      if (!deduped.has(slug)) {
        deduped.set(slug, { name, slug });
      }
      continue;
    }

    if (!entry || typeof entry !== 'object') continue;
    const name = toText(entry.name || entry.label || entry.slug);
    if (!name) continue;
    const slug = slugifyBlogSegment(entry.slug || name, { fallback: 'tag' });
    if (!deduped.has(slug)) {
      deduped.set(slug, { name, slug });
    }
  }

  return [...deduped.values()];
}

function prepareBlogWritePayload(input, options = {}) {
  const existing = options.existing || null;
  const contentJson = input.contentJson !== undefined
    ? normalizeJsonDocument(input.contentJson)
    : normalizeJsonDocument(existing?.contentJson);
  const contentHtml = input.contentHtml !== undefined
    ? toText(input.contentHtml)
    : toText(existing?.contentHtml);
  const readingTime = input.readingTime !== undefined
    ? Math.max(1, toInteger(input.readingTime, 1, 1))
    : estimateReadingTime(contentHtml || contentJson).minutes;
  const excerpt = input.excerpt !== undefined
    ? toNullableText(input.excerpt)
    : existing?.excerpt || null;
  const metaDescription = input.metaDescription !== undefined
    ? toNullableText(input.metaDescription)
    : existing?.metaDescription || null;
  const explicitStatus = input.status !== undefined ? parseStatusOrNull(input.status) : null;
  if (input.status !== undefined && !explicitStatus) {
    throw new Error(`Unsupported blog status "${input.status}".`);
  }

  const status = explicitStatus || existing?.status || BLOG_STATUS.DRAFT;
  const publishedAt = status === BLOG_STATUS.PUBLISHED
    ? normalizeDate(input.publishedAt ?? existing?.publishedAt ?? new Date())
    : null;

  return {
    title: toText(input.title ?? existing?.title),
    subtitle: input.subtitle !== undefined ? toNullableText(input.subtitle) : existing?.subtitle || null,
    slug: toText(input.slug ?? existing?.slug),
    excerpt: excerpt || createExcerpt(contentHtml || contentJson, { maxLength: BLOG_EXCERPT_MAX_LENGTH }) || null,
    categoryId: toText(input.categoryId ?? existing?.categoryId),
    authorId: toText(input.authorId ?? existing?.authorId),
    coverImage: input.coverImage !== undefined ? toNullableText(input.coverImage) : existing?.coverImage || null,
    contentJson,
    contentHtml,
    seoKeywords: normalizeStringArray(input.seoKeywords !== undefined ? input.seoKeywords : existing?.seoKeywords),
    metaDescription:
      metaDescription ||
      createExcerpt(contentHtml || contentJson, { maxLength: BLOG_META_DESCRIPTION_MAX_LENGTH }) ||
      null,
    featured: input.featured !== undefined ? toBoolean(input.featured) : existing?.featured || false,
    views: input.views !== undefined ? Math.max(0, toInteger(input.views, 0, 0)) : existing?.views || 0,
    internalLinks: normalizeLinks(input.internalLinks !== undefined ? input.internalLinks : existing?.internalLinks),
    externalLinks: normalizeLinks(input.externalLinks !== undefined ? input.externalLinks : existing?.externalLinks),
    status,
    readingTime,
    publishedAt
  };
}

async function syncBlogTags(client, blogId, tags) {
  const normalizedTags = normalizeTagInputs(tags);
  await client.query(DELETE_BLOG_TAG_RELATIONS_QUERY, [blogId]);

  for (const tag of normalizedTags) {
    const upserted = await client.query(UPSERT_BLOG_TAG_QUERY, [tag.name, tag.slug]);
    const tagId = upserted.rows[0]?.id;
    if (!tagId) continue;
    await client.query(INSERT_BLOG_TAG_RELATION_QUERY, [blogId, tagId]);
  }

  return normalizedTags;
}

export async function listBlogCategories(options = {}) {
  const result = await queryWithExecutor(LIST_BLOG_CATEGORIES_QUERY, options);
  return result.rows.map((row) => serializeBlogCategoryRow(row));
}

export async function listActiveBlogCategories(options = {}) {
  const result = await queryWithExecutor(LIST_ACTIVE_BLOG_CATEGORIES_QUERY, options);
  return result.rows.map((row) => serializeBlogCategoryRow(row));
}

export async function createBlogCategory(input = {}, options = {}) {
  const name = toText(input?.name);
  if (!name) {
    throw new Error('A category name is required.');
  }

  const slug = slugifyBlogSegment(input?.slug || name, { fallback: 'category' });
  const description = toNullableText(input?.description);
  const inserted = await queryOne(
    {
      text: INSERT_BLOG_CATEGORY_QUERY,
      values: [name, slug, description]
    },
    options
  );

  if (inserted) {
    return serializeBlogCategoryRow(inserted);
  }

  const existing = await queryOne(
    {
      text: GET_BLOG_CATEGORY_BY_SLUG_QUERY,
      values: [slug]
    },
    options
  );

  if (existing) {
    throw new Error(`A blog category with slug "${slug}" already exists.`);
  }

  throw new Error('Blog category could not be created.');
}

export async function getBlogCategoryBySlug(slug, options = {}) {
  const row = await queryOne({ text: GET_BLOG_CATEGORY_BY_SLUG_QUERY, values: [toText(slug)] }, options);
  return serializeBlogCategoryRow(row);
}

export async function listBlogTags(options = {}) {
  const result = await queryWithExecutor(LIST_BLOG_TAGS_QUERY, options);
  return result.rows.map((row) => serializeBlogTagRow(row));
}

export async function getBlogTagBySlug(slug, options = {}) {
  const row = await queryOne({ text: GET_BLOG_TAG_BY_SLUG_QUERY, values: [toText(slug)] }, options);
  return serializeBlogTagRow(row);
}

export async function getBlogById(id, options = {}) {
  const row = await queryOne({ text: GET_BLOG_BY_ID_QUERY, values: [toText(id)] }, options);
  return serializeBlogPostRow(row);
}

export async function listFeaturedBlogs(options = {}) {
  const limit = normalizePageSize(options.limit, BLOG_FEATURED_HOME_LIMIT, BLOG_MAX_PAGE_SIZE);
  const result = await queryWithExecutor(
    buildListPublishedBlogsQuery({
      featuredOnly: true,
      limit,
      offset: 0
    }),
    options
  );

  return result.rows.map((row) => serializeBlogPostRow(row));
}

export async function listPublishedBlogs(options = {}) {
  const page = normalizePage(options.page, 1);
  const pageSize = normalizePageSize(options.pageSize, BLOG_DEFAULT_PAGE_SIZE, BLOG_MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;

  const [rowsResult, countResult] = await Promise.all([
    queryWithExecutor(
      buildListPublishedBlogsQuery({
        categorySlug: options.categorySlug,
        tagSlug: options.tagSlug,
        featuredOnly: options.featuredOnly,
        excludeBlogId: options.excludeBlogId,
        limit: pageSize,
        offset
      }),
      options
    ),
    queryWithExecutor(
      buildCountPublishedBlogsQuery({
        categorySlug: options.categorySlug,
        tagSlug: options.tagSlug,
        featuredOnly: options.featuredOnly,
        excludeBlogId: options.excludeBlogId
      }),
      options
    )
  ]);

  const items = rowsResult.rows.map((row) => serializeBlogPostRow(row));
  const totalItems = countResult.rows[0]?.total_count ?? 0;
  return buildPagination(items, totalItems, page, pageSize);
}

export async function listPublishedBlogsByCategory(categorySlug, options = {}) {
  const category = await getBlogCategoryBySlug(categorySlug, options);
  const result = await listPublishedBlogs({ ...options, categorySlug });
  return {
    category,
    ...result
  };
}

export async function listPublishedBlogsByTag(tagSlug, options = {}) {
  const tag = await getBlogTagBySlug(tagSlug, options);
  const result = await listPublishedBlogs({ ...options, tagSlug });
  return {
    tag,
    ...result
  };
}

export async function getPublishedBlogByCategoryAndSlug(categorySlug, slug, options = {}) {
  const row = await queryOne(
    buildGetPublishedBlogByCategoryAndSlugQuery({
      categorySlug,
      slug
    }),
    options
  );

  return serializeBlogPostRow(row);
}

export async function listAdminBlogs(options = {}) {
  const page = normalizePage(options.page, 1);
  const pageSize = normalizePageSize(options.pageSize, BLOG_DEFAULT_ADMIN_PAGE_SIZE, BLOG_MAX_ADMIN_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  const statuses = Array.isArray(options.statuses)
    ? options.statuses.map((status) => parseStatusOrNull(status)).filter(Boolean)
    : options.status
      ? [parseStatusOrNull(options.status)].filter(Boolean)
      : [];

  const [rowsResult, countResult] = await Promise.all([
    queryWithExecutor(
      buildListAdminBlogsQuery({
        statuses,
        search: options.search,
        authorId: options.authorId,
        categorySlug: options.categorySlug,
        limit: pageSize,
        offset
      }),
      options
    ),
    queryWithExecutor(
      buildCountAdminBlogsQuery({
        statuses,
        search: options.search,
        authorId: options.authorId,
        categorySlug: options.categorySlug
      }),
      options
    )
  ]);

  const items = rowsResult.rows.map((row) => serializeBlogPostRow(row));
  const totalItems = countResult.rows[0]?.total_count ?? 0;
  return buildPagination(items, totalItems, page, pageSize);
}

export async function getBlogDashboardCounts(options = {}) {
  const row = options.authorId || options.categorySlug || options.search || options.status || options.statuses?.length
    ? await queryOne(buildBlogDashboardCountsQuery(options), options)
    : await queryOne(COUNT_BLOG_STATUS_QUERY, options);
  return serializeBlogStatusCountsRow(row);
}

export async function blogSlugExists({ categoryId, slug, excludeBlogId } = {}, options = {}) {
  const row = await queryOne(
    buildBlogSlugExistsQuery({
      categoryId,
      slug,
      excludeBlogId
    }),
    options
  );

  return Boolean(row?.slug_exists);
}

export async function generateAvailableBlogSlug({ categoryId, categorySlug, value, excludeBlogId } = {}, options = {}) {
  const category = await resolveCategoryRecord({ categoryId, categorySlug }, options);
  const sourceValue = toText(value);

  if (!sourceValue) {
    throw new Error('A title or slug value is required to generate a blog slug.');
  }

  return generateUniqueBlogSlug(
    sourceValue,
    async (candidate) =>
      blogSlugExists(
        {
          categoryId: category.id,
          slug: candidate,
          excludeBlogId
        },
        options
      ),
    { fallback: 'post' }
  );
}

export async function createBlog(input, options = {}) {
  return withBlogTransaction(async (client) => {
    const category = await resolveCategoryRecord(input, { ...options, client });
    const author = await resolveAuthorRecord(input, { ...options, client });
    const slug = input.slug
      ? await generateAvailableBlogSlug(
          {
            categoryId: category.id,
            value: input.slug
          },
          { ...options, client }
        )
      : await generateAvailableBlogSlug(
          {
            categoryId: category.id,
            value: input.title
          },
          { ...options, client }
        );

    const payload = prepareBlogWritePayload(
      {
        ...input,
        slug,
        categoryId: category.id,
        authorId: author.id
      },
      { existing: null }
    );

    if (!payload.title) {
      throw new Error('Blog title is required.');
    }

    const inserted = await client.query(INSERT_BLOG_QUERY, [
      payload.title,
      payload.subtitle,
      payload.slug,
      payload.excerpt,
      payload.categoryId,
      payload.authorId,
      payload.coverImage,
      JSON.stringify(payload.contentJson),
      payload.contentHtml,
      payload.seoKeywords,
      payload.metaDescription,
      payload.featured,
      payload.views,
      JSON.stringify(payload.internalLinks),
      JSON.stringify(payload.externalLinks),
      payload.status,
      payload.readingTime,
      payload.publishedAt
    ]);

    const blogId = inserted.rows[0]?.id;
    if (!blogId) {
      throw new Error('Blog insert failed to return an id.');
    }

    await syncBlogTags(client, blogId, input.tags);
    return getBlogById(blogId, { ...options, client });
  }, options);
}

export async function updateBlog(id, input, options = {}) {
  return withBlogTransaction(async (client) => {
    const existing = await getBlogById(id, { ...options, client });
    if (!existing) {
      throw new Error(`Blog "${id}" does not exist.`);
    }

    const category = await resolveCategoryRecord(
      {
        categoryId: input.categoryId || existing.categoryId,
        categorySlug: input.categorySlug
      },
      { ...options, client }
    );

    const author = await resolveAuthorRecord(
      {
        authorId: input.authorId || existing.authorId
      },
      { ...options, client }
    );

    const desiredSlugSource = input.slug !== undefined
      ? input.slug
      : existing.slug;

    const slug = await generateAvailableBlogSlug(
      {
        categoryId: category.id,
        value: desiredSlugSource || input.title || existing.title,
        excludeBlogId: existing.id
      },
      { ...options, client }
    );

    const payload = prepareBlogWritePayload(
      {
        ...existing,
        ...input,
        slug,
        categoryId: category.id,
        authorId: author.id
      },
      { existing }
    );

    if (!payload.title) {
      throw new Error('Blog title is required.');
    }

    await client.query(UPDATE_BLOG_QUERY, [
      payload.title,
      payload.subtitle,
      payload.slug,
      payload.excerpt,
      payload.categoryId,
      payload.authorId,
      payload.coverImage,
      JSON.stringify(payload.contentJson),
      payload.contentHtml,
      payload.seoKeywords,
      payload.metaDescription,
      payload.featured,
      payload.views,
      JSON.stringify(payload.internalLinks),
      JSON.stringify(payload.externalLinks),
      payload.status,
      payload.readingTime,
      payload.publishedAt,
      existing.id
    ]);

    if (input.tags !== undefined) {
      await syncBlogTags(client, existing.id, input.tags);
    }

    return getBlogById(existing.id, { ...options, client });
  }, options);
}

export async function setBlogStatus(id, status, options = {}) {
  const normalizedStatus = parseStatusOrNull(status);
  if (!normalizedStatus) {
    throw new Error(`Unsupported blog status "${status}".`);
  }
  const publishedAt = normalizedStatus === BLOG_STATUS.PUBLISHED
    ? normalizeDate(options.publishedAt || new Date())
    : null;

  return withBlogTransaction(async (client) => {
    const updated = await client.query(UPDATE_BLOG_STATUS_QUERY, [
      toText(id),
      normalizedStatus,
      publishedAt
    ]);

    const updatedId = updated.rows[0]?.id;
    if (!updatedId) {
      throw new Error(`Blog "${id}" does not exist.`);
    }

    return getBlogById(updatedId, { ...options, client });
  }, options);
}

export async function deleteBlog(id, options = {}) {
  return withBlogTransaction(async (client) => {
    const deleted = await client.query(DELETE_BLOG_QUERY, [toText(id)]);
    const deletedId = deleted.rows[0]?.id;
    if (!deletedId) {
      throw new Error(`Blog "${id}" does not exist.`);
    }

    return { id: deletedId };
  }, options);
}

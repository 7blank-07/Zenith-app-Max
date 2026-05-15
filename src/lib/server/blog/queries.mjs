import { BLOG_STATUS } from './constants.mjs';

const BLOG_SELECT_COLUMNS = `
  b.id,
  b.title,
  b.subtitle,
  b.slug,
  b.excerpt,
  b.cover_image,
  b.content_json,
  b.content_html,
  b.seo_keywords,
  b.meta_description,
  b.featured,
  b.views,
  b.internal_links,
  b.external_links,
  b.status,
  b.reading_time,
  b.published_at,
  b.created_at,
  b.updated_at,
  b.category_id,
  b.author_id,
  jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug,
    'description', c.description,
    'createdAt', c.created_at,
    'updatedAt', c.updated_at
  ) AS category,
  jsonb_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'role', u.role,
    'isActive', u.is_active,
    'sessionVersion', u.session_version,
    'createdAt', u.created_at,
    'updatedAt', u.updated_at
  ) AS author,
  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'createdAt', t.created_at,
        'updatedAt', t.updated_at
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::jsonb
  ) AS tags
`;

const BLOG_FROM_FRAGMENT = `
  FROM blogs b
  INNER JOIN blog_categories c ON c.id = b.category_id
  INNER JOIN users u ON u.id = b.author_id
  LEFT JOIN blog_tag_relations btr ON btr.blog_id = b.id
  LEFT JOIN blog_tags t ON t.id = btr.tag_id
`;

const BLOG_GROUP_BY_FRAGMENT = `
  GROUP BY
    b.id,
    c.id,
    u.id
`;

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildPublishedFilters(options = {}) {
  const values = [BLOG_STATUS.PUBLISHED];
  const conditions = [`b.status = $${values.length}`];

  if (options.categorySlug) {
    values.push(String(options.categorySlug).trim());
    conditions.push(`c.slug = $${values.length}`);
  }

  if (options.tagSlug) {
    values.push(String(options.tagSlug).trim());
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM blog_tag_relations tag_rel
        INNER JOIN blog_tags tag_lookup ON tag_lookup.id = tag_rel.tag_id
        WHERE tag_rel.blog_id = b.id
          AND tag_lookup.slug = $${values.length}
      )
    `);
  }

  if (options.excludeBlogId) {
    values.push(String(options.excludeBlogId).trim());
    conditions.push(`b.id <> $${values.length}`);
  }

  if (options.featuredOnly) {
    conditions.push('b.featured = TRUE');
  }

  if (options.excludeFeatured) {
    conditions.push('b.featured = FALSE');
  }

  return { values, where: conditions.join(' AND ') };
}

function buildAdminFilters(options = {}) {
  const values = [];
  const conditions = [];

  if (Array.isArray(options.statuses) && options.statuses.length) {
    values.push(options.statuses.map((status) => String(status).trim()).filter(Boolean));
    conditions.push(`b.status = ANY($${values.length}::text[])`);
  }

  if (options.authorId) {
    values.push(String(options.authorId).trim());
    conditions.push(`b.author_id = $${values.length}`);
  }

  if (options.categorySlug) {
    values.push(String(options.categorySlug).trim());
    conditions.push(`c.slug = $${values.length}`);
  }

  if (options.search) {
    values.push(`%${String(options.search).trim()}%`);
    const searchParamIndex = values.length;
    conditions.push(`
      (
        b.title ILIKE $${searchParamIndex}
        OR b.slug ILIKE $${searchParamIndex}
        OR COALESCE(b.excerpt, '') ILIKE $${searchParamIndex}
        OR COALESCE(b.meta_description, '') ILIKE $${searchParamIndex}
      )
    `);
  }

  return {
    values,
    where: conditions.length ? conditions.join(' AND ') : 'TRUE'
  };
}

export const LIST_BLOG_CATEGORIES_QUERY = `
  SELECT id, name, slug, description, created_at, updated_at
  FROM blog_categories
  ORDER BY name ASC
`;

export const LIST_ACTIVE_BLOG_CATEGORIES_QUERY = `
  SELECT DISTINCT c.id, c.name, c.slug, c.description, c.created_at, c.updated_at
  FROM blog_categories c
  INNER JOIN blogs b ON b.category_id = c.id
  WHERE b.status = 'published'
  ORDER BY c.name ASC
`;

export const GET_BLOG_CATEGORY_BY_ID_QUERY = `
  SELECT id, name, slug, description, created_at, updated_at
  FROM blog_categories
  WHERE id = $1
  LIMIT 1
`;

export const GET_BLOG_CATEGORY_BY_SLUG_QUERY = `
  SELECT id, name, slug, description, created_at, updated_at
  FROM blog_categories
  WHERE slug = $1
  LIMIT 1
`;

export const INSERT_BLOG_CATEGORY_QUERY = `
  INSERT INTO blog_categories (name, slug, description)
  VALUES ($1, $2, $3)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, name, slug, description, created_at, updated_at
`;

export const LIST_BLOG_TAGS_QUERY = `
  SELECT id, name, slug, created_at, updated_at
  FROM blog_tags
  ORDER BY name ASC
`;

export const GET_BLOG_TAG_BY_SLUG_QUERY = `
  SELECT id, name, slug, created_at, updated_at
  FROM blog_tags
  WHERE slug = $1
  LIMIT 1
`;

export const GET_BLOG_USER_BY_ID_QUERY = `
  SELECT id, name, email, role, is_active, session_version, created_at, updated_at
  FROM users
  WHERE id = $1
  LIMIT 1
`;

export const GET_BLOG_BY_ID_QUERY = `
  SELECT
    ${BLOG_SELECT_COLUMNS}
  ${BLOG_FROM_FRAGMENT}
  WHERE b.id = $1
  ${BLOG_GROUP_BY_FRAGMENT}
  LIMIT 1
`;

export const INSERT_BLOG_QUERY = `
  INSERT INTO blogs (
    title,
    subtitle,
    slug,
    excerpt,
    category_id,
    author_id,
    cover_image,
    content_json,
    content_html,
    seo_keywords,
    meta_description,
    featured,
    views,
    internal_links,
    external_links,
    status,
    reading_time,
    published_at
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::text[], $11, $12, $13, $14::jsonb, $15::jsonb, $16, $17, $18
  )
  RETURNING id
`;

export const UPDATE_BLOG_QUERY = `
  UPDATE blogs
  SET
    title = $1,
    subtitle = $2,
    slug = $3,
    excerpt = $4,
    category_id = $5,
    author_id = $6,
    cover_image = $7,
    content_json = $8::jsonb,
    content_html = $9,
    seo_keywords = $10::text[],
    meta_description = $11,
    featured = $12,
    views = $13,
    internal_links = $14::jsonb,
    external_links = $15::jsonb,
    status = $16,
    reading_time = $17,
    published_at = $18,
    updated_at = NOW()
  WHERE id = $19
  RETURNING id
`;

export const UPDATE_BLOG_STATUS_QUERY = `
  UPDATE blogs
  SET
    status = $2,
    published_at = $3,
    updated_at = NOW()
  WHERE id = $1
  RETURNING id
`;

export const DELETE_BLOG_QUERY = `
  DELETE FROM blogs
  WHERE id = $1
  RETURNING id
`;

export const UPSERT_BLOG_TAG_QUERY = `
  INSERT INTO blog_tags (name, slug)
  VALUES ($1, $2)
  ON CONFLICT (slug)
  DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW()
  RETURNING id, name, slug, created_at, updated_at
`;

export const DELETE_BLOG_TAG_RELATIONS_QUERY = `
  DELETE FROM blog_tag_relations
  WHERE blog_id = $1
`;

export const INSERT_BLOG_TAG_RELATION_QUERY = `
  INSERT INTO blog_tag_relations (blog_id, tag_id)
  VALUES ($1, $2)
  ON CONFLICT (blog_id, tag_id) DO NOTHING
`;

export const COUNT_BLOG_STATUS_QUERY = `
  SELECT
    COUNT(*)::int AS total_count,
    COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_count,
    COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
    COUNT(*) FILTER (WHERE status = 'published')::int AS published_count,
    COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_count
  FROM blogs
`;

export function buildBlogDashboardCountsQuery(options = {}) {
  const { values, where } = buildAdminFilters(options);
  return {
    text: `
      SELECT
        COUNT(*)::int AS total_count,
        COUNT(*) FILTER (WHERE b.status = 'draft')::int AS draft_count,
        COUNT(*) FILTER (WHERE b.status = 'pending')::int AS pending_count,
        COUNT(*) FILTER (WHERE b.status = 'published')::int AS published_count,
        COUNT(*) FILTER (WHERE b.status = 'rejected')::int AS rejected_count
      FROM blogs b
      INNER JOIN blog_categories c ON c.id = b.category_id
      WHERE ${where}
    `,
    values
  };
}

export function buildListPublishedBlogsQuery(options = {}) {
  const { values, where } = buildPublishedFilters(options);
  values.push(Math.max(1, toInteger(options.limit, 12)));
  values.push(Math.max(0, toInteger(options.offset, 0)));

  return {
    text: `
      SELECT
        ${BLOG_SELECT_COLUMNS}
      ${BLOG_FROM_FRAGMENT}
      WHERE ${where}
      ${BLOG_GROUP_BY_FRAGMENT}
      ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC, b.id DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values
  };
}

export function buildCountPublishedBlogsQuery(options = {}) {
  const { values, where } = buildPublishedFilters(options);
  return {
    text: `
      SELECT COUNT(*)::int AS total_count
      FROM blogs b
      INNER JOIN blog_categories c ON c.id = b.category_id
      WHERE ${where}
    `,
    values
  };
}

export function buildGetPublishedBlogByCategoryAndSlugQuery(options = {}) {
  const values = [BLOG_STATUS.PUBLISHED, String(options.categorySlug || '').trim(), String(options.slug || '').trim()];
  return {
    text: `
      SELECT
        ${BLOG_SELECT_COLUMNS}
      ${BLOG_FROM_FRAGMENT}
      WHERE b.status = $1
        AND c.slug = $2
        AND b.slug = $3
      ${BLOG_GROUP_BY_FRAGMENT}
      LIMIT 1
    `,
    values
  };
}

export function buildListAdminBlogsQuery(options = {}) {
  const { values, where } = buildAdminFilters(options);
  values.push(Math.max(1, toInteger(options.limit, 25)));
  values.push(Math.max(0, toInteger(options.offset, 0)));

  return {
    text: `
      SELECT
        ${BLOG_SELECT_COLUMNS}
      ${BLOG_FROM_FRAGMENT}
      WHERE ${where}
      ${BLOG_GROUP_BY_FRAGMENT}
      ORDER BY
        CASE WHEN b.published_at IS NULL THEN 1 ELSE 0 END,
        b.published_at DESC NULLS LAST,
        b.updated_at DESC,
        b.id DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values
  };
}

export function buildCountAdminBlogsQuery(options = {}) {
  const { values, where } = buildAdminFilters(options);
  return {
    text: `
      SELECT COUNT(*)::int AS total_count
      FROM blogs b
      INNER JOIN blog_categories c ON c.id = b.category_id
      WHERE ${where}
    `,
    values
  };
}

export function buildBlogSlugExistsQuery(options = {}) {
  const values = [String(options.categoryId || '').trim(), String(options.slug || '').trim()];
  let where = 'category_id = $1 AND slug = $2';

  if (options.excludeBlogId) {
    values.push(String(options.excludeBlogId).trim());
    where += ` AND id <> $${values.length}`;
  }

  return {
    text: `
      SELECT EXISTS (
        SELECT 1
        FROM blogs
        WHERE ${where}
      ) AS slug_exists
    `,
    values
  };
}

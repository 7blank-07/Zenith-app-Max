import {
  STREAM_STATUS,
  STREAM_STATUS_VALUES,
  STREAM_MATCH_STAGE_VALUES,
  STREAM_DEFAULT_PAGE_SIZE,
  STREAM_MAX_PAGE_SIZE
} from './constants.mjs';
import { runBlogQuery, withBlogTransaction } from '../blog/db.mjs';

const STREAM_SELECT_COLUMNS = `
  id,
  title,
  slug,
  youtube_id,
  thumbnail,
  status,
  tournament_name,
  match_stage,
  match_date,
  host_name,
  participants,
  description,
  featured,
  homepage_visible,
  discord_link,
  related_blog_id,
  seo_title,
  meta_description,
  tags,
  created_at,
  updated_at
`;

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

function toInteger(value, fallback, minimum = Number.NEGATIVE_INFINITY) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, parsed);
}

function normalizePage(page) {
  return Math.max(1, toInteger(page, 1, 1));
}

function normalizePageSize(pageSize) {
  const parsed = toInteger(pageSize, STREAM_DEFAULT_PAGE_SIZE, 1);
  return Math.min(parsed, STREAM_MAX_PAGE_SIZE);
}

function normalizeStatus(status) {
  const normalized = toText(status).toLowerCase();
  return STREAM_STATUS_VALUES.includes(normalized) ? normalized : '';
}

function normalizeMatchStage(matchStage) {
  const normalized = toText(matchStage);
  return STREAM_MATCH_STAGE_VALUES.includes(normalized) ? normalized : null;
}

function normalizeSearch(search) {
  return toText(search).slice(0, 160);
}

function normalizeDate(value, fallback = null) {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
}

function normalizeTags(tags, fallback = []) {
  const values = Array.isArray(tags) ? tags : [];
  const deduped = new Set(values.map((entry) => toText(entry)).filter(Boolean));
  return deduped.size ? [...deduped] : fallback;
}

function serializeStreamRow(row) {
  if (!row?.id) return null;
  const status = normalizeStatus(row.status);

  return {
    id: toText(row.id),
    title: toText(row.title),
    slug: toText(row.slug),
    youtubeId: toText(row.youtube_id),
    thumbnail: toText(row.thumbnail, null),
    status,
    tournamentName: toText(row.tournament_name, null),
    matchStage: normalizeMatchStage(row.match_stage),
    matchDate: normalizeDate(row.match_date),
    hostName: toText(row.host_name, null),
    participants: toText(row.participants, null),
    description: toText(row.description, null),
    featured: Boolean(row.featured),
    homepageVisible: Boolean(row.homepage_visible),
    discordLink: toText(row.discord_link, null),
    relatedBlogId: toText(row.related_blog_id, null) || null,
    seoTitle: toText(row.seo_title, null),
    metaDescription: toText(row.meta_description, null),
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };
}

function buildWhereClause({ status = '', search = '' } = {}) {
  const whereParts = [];
  const values = [];

  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus) {
    values.push(normalizedStatus);
    whereParts.push(`status = $${values.length}`);
  }

  const normalizedSearch = normalizeSearch(search);
  if (normalizedSearch) {
    values.push(`%${normalizedSearch}%`);
    whereParts.push(`(title ILIKE $${values.length} OR tournament_name ILIKE $${values.length})`);
  }

  return {
    sql: whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '',
    values
  };
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

function isMissingStreamTableError(error) {
  const code = toText(error?.code);
  const message = toText(error?.message).toLowerCase();
  return code === '42P01' || (message.includes('streams') && message.includes('does not exist'));
}

export async function getStreamById(id, options = {}) {
  const query = `
    SELECT ${STREAM_SELECT_COLUMNS}
    FROM streams
    WHERE id = $1
    LIMIT 1
  `;

  try {
    const result = await runBlogQuery(query, [toText(id)], options);
    return serializeStreamRow(result.rows[0] || null);
  } catch (error) {
    if (isMissingStreamTableError(error)) {
      return null;
    }
    throw error;
  }
}

export async function getStreamBySlug(slug, options = {}) {
  const query = `
    SELECT ${STREAM_SELECT_COLUMNS}
    FROM streams
    WHERE slug = $1
    LIMIT 1
  `;

  try {
    const result = await runBlogQuery(query, [toText(slug)], options);
    return serializeStreamRow(result.rows[0] || null);
  } catch (error) {
    if (isMissingStreamTableError(error)) {
      return null;
    }
    throw error;
  }
}

export async function getStreamDashboardCounts(options = {}) {
  const query = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'live')::int AS live,
      COUNT(*) FILTER (WHERE status = 'upcoming')::int AS upcoming,
      COUNT(*) FILTER (WHERE status = 'replay')::int AS replay
    FROM streams
  `;
  try {
    const result = await runBlogQuery(query, [], options);
    const row = result.rows[0] || {};

    return {
      total: Number(row.total || 0),
      live: Number(row.live || 0),
      upcoming: Number(row.upcoming || 0),
      replay: Number(row.replay || 0)
    };
  } catch (error) {
    if (isMissingStreamTableError(error)) {
      return { total: 0, live: 0, upcoming: 0, replay: 0 };
    }
    throw error;
  }
}

export async function listAdminStreams(options = {}) {
  const page = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);
  const offset = (page - 1) * pageSize;
  const where = buildWhereClause({
    status: options.status,
    search: options.search
  });

  const rowsQuery = `
    SELECT ${STREAM_SELECT_COLUMNS}
    FROM streams
    ${where.sql}
    ORDER BY
      CASE 
        WHEN status = '${STREAM_STATUS.LIVE}' THEN 0 
        WHEN status = '${STREAM_STATUS.UPCOMING}' THEN 1
        ELSE 2 
      END ASC,
      match_date DESC NULLS LAST,
      updated_at DESC NULLS LAST
    LIMIT $${where.values.length + 1}
    OFFSET $${where.values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total_count
    FROM streams
    ${where.sql}
  `;

  try {
    const [rowsResult, countResult] = await Promise.all([
      runBlogQuery(rowsQuery, [...where.values, pageSize, offset], options),
      runBlogQuery(countQuery, where.values, options)
    ]);

    const items = rowsResult.rows.map((row) => serializeStreamRow(row)).filter(Boolean);
    const totalItems = Number(countResult.rows[0]?.total_count || 0);
    return buildPagination(items, totalItems, page, pageSize);
  } catch (error) {
    if (isMissingStreamTableError(error)) {
      return buildPagination([], 0, page, pageSize);
    }
    throw error;
  }
}

export async function listPublicStreams({ status = '', search = '', limit = 250 } = {}, options = {}) {
  const where = buildWhereClause({ status, search });
  const safeLimit = Math.min(Math.max(1, toInteger(limit, 250, 1)), 500);
  const rowsQuery = `
    SELECT ${STREAM_SELECT_COLUMNS}
    FROM streams
    ${where.sql}
    ORDER BY
      CASE 
        WHEN status = '${STREAM_STATUS.LIVE}' THEN 0 
        WHEN status = '${STREAM_STATUS.UPCOMING}' THEN 1
        ELSE 2 
      END ASC,
      match_date DESC NULLS LAST,
      updated_at DESC NULLS LAST
    LIMIT $${where.values.length + 1}
  `;
  try {
    const result = await runBlogQuery(rowsQuery, [...where.values, safeLimit], options);
    return result.rows.map((row) => serializeStreamRow(row)).filter(Boolean);
  } catch (error) {
    if (isMissingStreamTableError(error)) return [];
    throw error;
  }
}

export async function getHomepageFeaturedStream(options = {}) {
  // Try to find a live featured stream, then upcoming featured, then replay featured
  const query = `
    SELECT ${STREAM_SELECT_COLUMNS}
    FROM streams
    WHERE homepage_visible = TRUE
    ORDER BY
      CASE 
        WHEN status = '${STREAM_STATUS.LIVE}' THEN 0 
        WHEN status = '${STREAM_STATUS.UPCOMING}' THEN 1
        ELSE 2 
      END ASC,
      featured DESC,
      match_date DESC NULLS LAST
    LIMIT 1
  `;
  try {
    const result = await runBlogQuery(query, [], options);
    return serializeStreamRow(result.rows[0] || null);
  } catch (error) {
    if (isMissingStreamTableError(error)) return null;
    throw error;
  }
}

function normalizeWritePayload(input = {}, existing = null) {
  const title = toText(input.title ?? existing?.title);
  let slug = toText(input.slug ?? existing?.slug).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug && title) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  const youtubeId = toText(input.youtubeId ?? existing?.youtubeId);
  const thumbnail = toText(input.thumbnail ?? existing?.thumbnail);
  const status = normalizeStatus((input.status ?? existing?.status) || STREAM_STATUS.UPCOMING);
  const tournamentName = toText(input.tournamentName ?? existing?.tournamentName);
  const matchStage = normalizeMatchStage(input.matchStage ?? existing?.matchStage);
  const matchDate = normalizeDate(input.matchDate ?? existing?.matchDate);
  const hostName = toText(input.hostName ?? existing?.hostName);
  const participants = toText(input.participants ?? existing?.participants);
  const description = toText(input.description ?? existing?.description);
  const featured = toBoolean(input.featured ?? existing?.featured, false);
  const homepageVisible = toBoolean(input.homepageVisible ?? existing?.homepageVisible, true);
  const discordLink = toText(input.discordLink ?? existing?.discordLink);
  const relatedBlogId = toText(input.relatedBlogId ?? existing?.relatedBlogId) || null;
  const seoTitle = toText(input.seoTitle ?? existing?.seoTitle);
  const metaDescription = toText(input.metaDescription ?? existing?.metaDescription);
  const tags = normalizeTags(input.tags ?? existing?.tags);

  if (!title) throw new Error('Stream title is required.');
  if (!slug) throw new Error('Stream slug is required.');
  if (!youtubeId) throw new Error('YouTube ID is required.');
  if (!status) throw new Error('Stream status is invalid.');

  return {
    title, slug, youtubeId, thumbnail, status, tournamentName, matchStage,
    matchDate, hostName, participants, description, featured, homepageVisible,
    discordLink, relatedBlogId, seoTitle, metaDescription, tags
  };
}

export async function createStream(input = {}, options = {}) {
  return withBlogTransaction(async (client) => {
    const payload = normalizeWritePayload(input, null);

    const result = await client.query(
      `
        INSERT INTO streams (
          title, slug, youtube_id, thumbnail, status, tournament_name, match_stage,
          match_date, host_name, participants, description, featured, homepage_visible,
          discord_link, related_blog_id, seo_title, meta_description, tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING ${STREAM_SELECT_COLUMNS}
      `,
      [
        payload.title, payload.slug, payload.youtubeId, payload.thumbnail, payload.status,
        payload.tournamentName, payload.matchStage, payload.matchDate, payload.hostName,
        payload.participants, payload.description, payload.featured, payload.homepageVisible,
        payload.discordLink, payload.relatedBlogId, payload.seoTitle, payload.metaDescription, payload.tags
      ]
    );

    return serializeStreamRow(result.rows[0] || null);
  }, options).catch((error) => {
    if (isMissingStreamTableError(error)) {
      throw new Error('Streams table is not configured. Run npm run db:migrate:blog first.');
    }
    if (error.code === '23505' && error.constraint === 'streams_slug_unique_idx') {
      throw new Error('A stream with this slug already exists.');
    }
    throw error;
  });
}

export async function updateStream(id, input = {}, options = {}) {
  return withBlogTransaction(async (client) => {
    const existing = await getStreamById(id, { ...options, client });
    if (!existing) {
      throw new Error(`Stream "${id}" no longer exists.`);
    }

    const payload = normalizeWritePayload(input, existing);

    const result = await client.query(
      `
        UPDATE streams
        SET
          title = $2, slug = $3, youtube_id = $4, thumbnail = $5, status = $6,
          tournament_name = $7, match_stage = $8, match_date = $9, host_name = $10,
          participants = $11, description = $12, featured = $13, homepage_visible = $14,
          discord_link = $15, related_blog_id = $16, seo_title = $17, meta_description = $18, tags = $19
        WHERE id = $1
        RETURNING ${STREAM_SELECT_COLUMNS}
      `,
      [
        existing.id, payload.title, payload.slug, payload.youtubeId, payload.thumbnail, payload.status,
        payload.tournamentName, payload.matchStage, payload.matchDate, payload.hostName,
        payload.participants, payload.description, payload.featured, payload.homepageVisible,
        payload.discordLink, payload.relatedBlogId, payload.seoTitle, payload.metaDescription, payload.tags
      ]
    );

    return serializeStreamRow(result.rows[0] || null);
  }, options).catch((error) => {
    if (isMissingStreamTableError(error)) {
      throw new Error('Streams table is not configured. Run npm run db:migrate:blog first.');
    }
    if (error.code === '23505' && error.constraint === 'streams_slug_unique_idx') {
      throw new Error('A stream with this slug already exists.');
    }
    throw error;
  });
}

export async function deleteStream(id, options = {}) {
  let result;
  try {
    result = await runBlogQuery(
      `
        DELETE FROM streams
        WHERE id = $1
        RETURNING id
      `,
      [toText(id)],
      options
    );
  } catch (error) {
    if (isMissingStreamTableError(error)) {
      throw new Error('Streams table is not configured. Run npm run db:migrate:blog first.');
    }
    throw error;
  }

  const deletedId = toText(result.rows[0]?.id);
  if (!deletedId) {
    throw new Error(`Stream "${id}" no longer exists.`);
  }

  return { id: deletedId };
}

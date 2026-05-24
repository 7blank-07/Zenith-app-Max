import {
  PARTNER_PLATFORM_VALUES,
  PARTNER_DEFAULT_PAGE_SIZE,
  PARTNER_MAX_PAGE_SIZE
} from './constants.mjs';
import { runBlogQuery, withBlogTransaction } from '../blog/db.mjs';

const PARTNER_SELECT_COLUMNS = `
  id,
  name,
  username,
  platform,
  bio,
  avatar_url,
  follower_count,
  social_url,
  featured,
  verified,
  display_order,
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
  const parsed = toInteger(pageSize, PARTNER_DEFAULT_PAGE_SIZE, 1);
  return Math.min(parsed, PARTNER_MAX_PAGE_SIZE);
}

function normalizePlatform(platform) {
  const normalized = toText(platform).toLowerCase();
  return PARTNER_PLATFORM_VALUES.includes(normalized) ? normalized : '';
}

function normalizeSearch(search) {
  return toText(search).slice(0, 100);
}

function normalizeDate(value, fallback = null) {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
}

function serializePartnerRow(row) {
  if (!row?.id) return null;
  return {
    id: toText(row.id),
    name: toText(row.name),
    username: toText(row.username, null),
    platform: normalizePlatform(row.platform),
    bio: toText(row.bio, null),
    avatarUrl: toText(row.avatar_url, null),
    followerCount: toText(row.follower_count, null),
    socialUrl: toText(row.social_url),
    featured: Boolean(row.featured),
    verified: Boolean(row.verified),
    displayOrder: Number(row.display_order || 0),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };
}

function buildWhereClause({ platform = '', search = '' } = {}) {
  const whereParts = [];
  const values = [];

  const normalizedPlatform = normalizePlatform(platform);
  if (normalizedPlatform) {
    values.push(normalizedPlatform);
    whereParts.push(`platform = $${values.length}`);
  }

  const normalizedSearch = normalizeSearch(search);
  if (normalizedSearch) {
    values.push(`%${normalizedSearch}%`);
    whereParts.push(`(name ILIKE $${values.length} OR username ILIKE $${values.length} OR bio ILIKE $${values.length})`);
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

function isMissingPartnerTableError(error) {
  const code = toText(error?.code);
  const message = toText(error?.message).toLowerCase();
  return code === '42P01' || (message.includes('partners') && message.includes('does not exist'));
}

export async function getPartnerById(id, options = {}) {
  const query = `
    SELECT ${PARTNER_SELECT_COLUMNS}
    FROM partners
    WHERE id = $1
    LIMIT 1
  `;

  try {
    const result = await runBlogQuery(query, [toText(id)], options);
    return serializePartnerRow(result.rows[0] || null);
  } catch (error) {
    if (isMissingPartnerTableError(error)) return null;
    throw error;
  }
}

export async function getPartnerDashboardCounts(options = {}) {
  const query = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE featured = TRUE)::int AS featured,
      COUNT(*) FILTER (WHERE verified = TRUE)::int AS verified
    FROM partners
  `;
  try {
    const result = await runBlogQuery(query, [], options);
    const row = result.rows[0] || {};
    return {
      total: Number(row.total || 0),
      featured: Number(row.featured || 0),
      verified: Number(row.verified || 0)
    };
  } catch (error) {
    if (isMissingPartnerTableError(error)) {
      return { total: 0, featured: 0, verified: 0 };
    }
    throw error;
  }
}

export async function listAdminPartners(options = {}) {
  const page = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);
  const offset = (page - 1) * pageSize;
  const where = buildWhereClause({
    platform: options.platform,
    search: options.search
  });

  const rowsQuery = `
    SELECT ${PARTNER_SELECT_COLUMNS}
    FROM partners
    ${where.sql}
    ORDER BY display_order ASC, created_at DESC
    LIMIT $${where.values.length + 1}
    OFFSET $${where.values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total_count
    FROM partners
    ${where.sql}
  `;

  try {
    const [rowsResult, countResult] = await Promise.all([
      runBlogQuery(rowsQuery, [...where.values, pageSize, offset], options),
      runBlogQuery(countQuery, where.values, options)
    ]);

    const items = rowsResult.rows.map((row) => serializePartnerRow(row)).filter(Boolean);
    const totalItems = Number(countResult.rows[0]?.total_count || 0);
    return buildPagination(items, totalItems, page, pageSize);
  } catch (error) {
    if (isMissingPartnerTableError(error)) {
      return buildPagination([], 0, page, pageSize);
    }
    throw error;
  }
}

export async function listPublicPartners({ platform = '', search = '' } = {}, options = {}) {
  const where = buildWhereClause({ platform, search });
  const rowsQuery = `
    SELECT ${PARTNER_SELECT_COLUMNS}
    FROM partners
    ${where.sql}
    ORDER BY featured DESC, display_order ASC, created_at DESC
  `;
  try {
    const result = await runBlogQuery(rowsQuery, where.values, options);
    return result.rows.map((row) => serializePartnerRow(row)).filter(Boolean);
  } catch (error) {
    if (isMissingPartnerTableError(error)) return [];
    throw error;
  }
}

function normalizeWritePayload(input = {}, existing = null) {
  const name = toText(input.name ?? existing?.name);
  const username = toText(input.username ?? existing?.username);
  const platform = normalizePlatform(input.platform ?? existing?.platform);
  const bio = toText(input.bio ?? existing?.bio);
  const avatarUrl = toText(input.avatarUrl ?? existing?.avatarUrl);
  const followerCount = toText(input.followerCount ?? existing?.followerCount);
  const socialUrl = toText(input.socialUrl ?? existing?.socialUrl);
  const featured = toBoolean(input.featured ?? existing?.featured, false);
  const verified = toBoolean(input.verified ?? existing?.verified, false);
  const displayOrder = toInteger(input.displayOrder ?? existing?.displayOrder, 0);

  if (!name) throw new Error('Partner name is required.');
  if (!platform) throw new Error('Partner platform is required.');
  if (!socialUrl) throw new Error('Partner social URL is required.');

  return {
    name, username, platform, bio, avatarUrl, followerCount, socialUrl,
    featured, verified, displayOrder
  };
}

export async function createPartner(input = {}, options = {}) {
  return withBlogTransaction(async (client) => {
    const payload = normalizeWritePayload(input, null);
    const result = await client.query(
      `
        INSERT INTO partners (
          name, username, platform, bio, avatar_url, follower_count, social_url,
          featured, verified, display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING ${PARTNER_SELECT_COLUMNS}
      `,
      [
        payload.name, payload.username, payload.platform, payload.bio, payload.avatarUrl,
        payload.followerCount, payload.socialUrl, payload.featured, payload.verified, payload.displayOrder
      ]
    );
    return serializePartnerRow(result.rows[0] || null);
  }, options).catch((error) => {
    if (isMissingPartnerTableError(error)) {
      throw new Error('Partners table is not configured.');
    }
    throw error;
  });
}

export async function updatePartner(id, input = {}, options = {}) {
  return withBlogTransaction(async (client) => {
    const existing = await getPartnerById(id, { ...options, client });
    if (!existing) throw new Error(`Partner "${id}" no longer exists.`);
    const payload = normalizeWritePayload(input, existing);
    const result = await client.query(
      `
        UPDATE partners
        SET
          name = $2, username = $3, platform = $4, bio = $5, avatar_url = $6,
          follower_count = $7, social_url = $8, featured = $9, verified = $10, display_order = $11,
          updated_at = NOW()
        WHERE id = $1
        RETURNING ${PARTNER_SELECT_COLUMNS}
      `,
      [
        existing.id, payload.name, payload.username, payload.platform, payload.bio, payload.avatarUrl,
        payload.followerCount, payload.socialUrl, payload.featured, payload.verified, payload.displayOrder
      ]
    );
    return serializePartnerRow(result.rows[0] || null);
  }, options).catch((error) => {
    if (isMissingPartnerTableError(error)) {
      throw new Error('Partners table is not configured.');
    }
    throw error;
  });
}

export async function deletePartner(id, options = {}) {
  try {
    const result = await runBlogQuery(
      `DELETE FROM partners WHERE id = $1 RETURNING id`,
      [toText(id)],
      options
    );
    const deletedId = toText(result.rows[0]?.id);
    if (!deletedId) throw new Error(`Partner "${id}" no longer exists.`);
    return { id: deletedId };
  } catch (error) {
    if (isMissingPartnerTableError(error)) {
      throw new Error('Partners table is not configured.');
    }
    throw error;
  }
}

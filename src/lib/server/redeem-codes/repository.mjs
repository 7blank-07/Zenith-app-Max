import {
  REDEEM_CODE_SCOPE,
  REDEEM_CODE_SCOPE_VALUES,
  REDEEM_CODE_STATUS,
  REDEEM_CODE_STATUS_VALUES,
  REDEEM_DEFAULT_PAGE_SIZE,
  REDEEM_MAX_PAGE_SIZE,
  getRedeemScopeLabel
} from './constants.mjs';
import { runBlogQuery, withBlogTransaction } from '../blog/db.mjs';

const REDEEM_SELECT_COLUMNS = `
  id,
  title,
  code_value,
  scope,
  status,
  published_at,
  expires_at,
  created_at,
  updated_at
`;

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
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
  const parsed = toInteger(pageSize, REDEEM_DEFAULT_PAGE_SIZE, 1);
  return Math.min(parsed, REDEEM_MAX_PAGE_SIZE);
}

function normalizeScope(scope) {
  const normalized = toText(scope).toLowerCase();
  return REDEEM_CODE_SCOPE_VALUES.includes(normalized) ? normalized : '';
}

function normalizeStatus(status) {
  const normalized = toText(status).toLowerCase();
  return REDEEM_CODE_STATUS_VALUES.includes(normalized) ? normalized : '';
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

function normalizeScopes(scopes, fallback = []) {
  const values = Array.isArray(scopes) ? scopes : [];
  const deduped = new Set(values.map((entry) => normalizeScope(entry)).filter(Boolean));
  return deduped.size ? [...deduped] : fallback;
}

function serializeRedeemCodeRow(row) {
  if (!row?.id) return null;
  const scope = normalizeScope(row.scope);
  const status = normalizeStatus(row.status);

  return {
    id: toText(row.id),
    title: toText(row.title),
    codeValue: toText(row.code_value),
    scope,
    scopeLabel: getRedeemScopeLabel(scope),
    status,
    publishedAt: normalizeDate(row.published_at),
    expiresAt: normalizeDate(row.expires_at),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };
}

function buildWhereClause({ scopes = [], status = '', search = '' } = {}) {
  const whereParts = [];
  const values = [];

  const normalizedScopes = normalizeScopes(scopes);
  if (normalizedScopes.length) {
    values.push(normalizedScopes);
    whereParts.push(`scope = ANY($${values.length})`);
  }

  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus) {
    values.push(normalizedStatus);
    whereParts.push(`status = $${values.length}`);
  }

  const normalizedSearch = normalizeSearch(search);
  if (normalizedSearch) {
    values.push(`%${normalizedSearch}%`);
    whereParts.push(`(title ILIKE $${values.length} OR code_value ILIKE $${values.length})`);
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

function isMissingRedeemTableError(error) {
  const code = toText(error?.code);
  const message = toText(error?.message).toLowerCase();
  return code === '42P01' || (message.includes('redeem_codes') && message.includes('does not exist'));
}

export async function getRedeemCodeById(id, options = {}) {
  const query = `
    SELECT ${REDEEM_SELECT_COLUMNS}
    FROM redeem_codes
    WHERE id = $1
    LIMIT 1
  `;

  try {
    const result = await runBlogQuery(query, [toText(id)], options);
    return serializeRedeemCodeRow(result.rows[0] || null);
  } catch (error) {
    if (isMissingRedeemTableError(error)) {
      return null;
    }
    throw error;
  }
}

export async function getRedeemDashboardCounts(options = {}) {
  const query = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'active')::int AS active,
      COUNT(*) FILTER (WHERE status = 'expired')::int AS expired
    FROM redeem_codes
  `;
  try {
    const result = await runBlogQuery(query, [], options);
    const row = result.rows[0] || {};

    return {
      redeemTotal: Number(row.total || 0),
      redeemActive: Number(row.active || 0),
      redeemExpired: Number(row.expired || 0)
    };
  } catch (error) {
    if (isMissingRedeemTableError(error)) {
      return {
        redeemTotal: 0,
        redeemActive: 0,
        redeemExpired: 0
      };
    }
    throw error;
  }
}

export async function listAdminRedeemCodes(options = {}) {
  const page = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);
  const offset = (page - 1) * pageSize;
  const where = buildWhereClause({
    scopes: options.scope ? [options.scope] : [],
    status: options.status,
    search: options.search
  });

  const rowsQuery = `
    SELECT ${REDEEM_SELECT_COLUMNS}
    FROM redeem_codes
    ${where.sql}
    ORDER BY
      CASE WHEN status = '${REDEEM_CODE_STATUS.ACTIVE}' THEN 0 ELSE 1 END ASC,
      published_at DESC NULLS LAST,
      updated_at DESC NULLS LAST
    LIMIT $${where.values.length + 1}
    OFFSET $${where.values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total_count
    FROM redeem_codes
    ${where.sql}
  `;

  try {
    const [rowsResult, countResult] = await Promise.all([
      runBlogQuery(rowsQuery, [...where.values, pageSize, offset], options),
      runBlogQuery(countQuery, where.values, options)
    ]);

    const items = rowsResult.rows.map((row) => serializeRedeemCodeRow(row)).filter(Boolean);
    const totalItems = Number(countResult.rows[0]?.total_count || 0);
    return buildPagination(items, totalItems, page, pageSize);
  } catch (error) {
    if (isMissingRedeemTableError(error)) {
      return buildPagination([], 0, page, pageSize);
    }
    throw error;
  }
}

export async function listPublicRedeemCodes({ scopes = [REDEEM_CODE_SCOPE.GLOBAL], search = '', limit = 250 } = {}, options = {}) {
  const where = buildWhereClause({
    scopes,
    search
  });
  const safeLimit = Math.min(Math.max(1, toInteger(limit, 250, 1)), 500);
  const rowsQuery = `
    SELECT ${REDEEM_SELECT_COLUMNS}
    FROM redeem_codes
    ${where.sql}
    ORDER BY
      CASE WHEN status = '${REDEEM_CODE_STATUS.ACTIVE}' THEN 0 ELSE 1 END ASC,
      published_at DESC NULLS LAST,
      updated_at DESC NULLS LAST
    LIMIT $${where.values.length + 1}
  `;
  const result = await runBlogQuery(rowsQuery, [...where.values, safeLimit], options);
  return result.rows.map((row) => serializeRedeemCodeRow(row)).filter(Boolean);
}

export async function getNewestActiveRedeemCode({ scopes = [REDEEM_CODE_SCOPE.GLOBAL] } = {}, options = {}) {
  const normalizedScopes = normalizeScopes(scopes, [REDEEM_CODE_SCOPE.GLOBAL]);
  const query = `
    SELECT ${REDEEM_SELECT_COLUMNS}
    FROM redeem_codes
    WHERE scope = ANY($1) AND status = '${REDEEM_CODE_STATUS.ACTIVE}'
    ORDER BY published_at DESC NULLS LAST, updated_at DESC NULLS LAST
    LIMIT 1
  `;
  const result = await runBlogQuery(query, [normalizedScopes], options);
  return serializeRedeemCodeRow(result.rows[0] || null);
}


function normalizeWritePayload(input = {}, existing = null) {
  const title = toText(input.title ?? existing?.title);
  const codeValue = toText(input.codeValue ?? existing?.codeValue);
  const scope = normalizeScope(input.scope ?? existing?.scope);
  const status = normalizeStatus((input.status ?? existing?.status) || REDEEM_CODE_STATUS.ACTIVE);
  const publishedAt = normalizeDate(input.publishedAt ?? existing?.publishedAt ?? new Date());
  const expiresAt = status === REDEEM_CODE_STATUS.EXPIRED
    ? normalizeDate(input.expiresAt ?? existing?.expiresAt ?? new Date())
    : null;

  if (!title) {
    throw new Error('Redeem code title is required.');
  }

  if (!codeValue) {
    throw new Error('Redeem code value is required.');
  }

  if (!scope) {
    throw new Error('Redeem code scope is invalid.');
  }

  if (!status) {
    throw new Error('Redeem code status is invalid.');
  }

  if (!publishedAt) {
    throw new Error('Redeem code publish date is required.');
  }

  return {
    title,
    codeValue,
    scope,
    status,
    publishedAt,
    expiresAt
  };
}

export async function createRedeemCode(input = {}, options = {}) {
  return withBlogTransaction(async (client) => {
    const payload = normalizeWritePayload(input, null);

    const result = await client.query(
      `
        INSERT INTO redeem_codes (
          title,
          code_value,
          scope,
          status,
          published_at,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING ${REDEEM_SELECT_COLUMNS}
      `,
      [payload.title, payload.codeValue, payload.scope, payload.status, payload.publishedAt, payload.expiresAt]
    );

    return serializeRedeemCodeRow(result.rows[0] || null);
  }, options).catch((error) => {
    if (isMissingRedeemTableError(error)) {
      throw new Error('Redeem code table is not configured. Run npm run db:migrate:blog first.');
    }
    throw error;
  });
}

export async function updateRedeemCode(id, input = {}, options = {}) {
  return withBlogTransaction(async (client) => {
    const existing = await getRedeemCodeById(id, { ...options, client });
    if (!existing) {
      throw new Error(`Redeem code "${id}" no longer exists.`);
    }

    const payload = normalizeWritePayload(input, existing);

    const result = await client.query(
      `
        UPDATE redeem_codes
        SET
          title = $2,
          code_value = $3,
          scope = $4,
          status = $5,
          published_at = $6,
          expires_at = $7
        WHERE id = $1
        RETURNING ${REDEEM_SELECT_COLUMNS}
      `,
      [existing.id, payload.title, payload.codeValue, payload.scope, payload.status, payload.publishedAt, payload.expiresAt]
    );

    return serializeRedeemCodeRow(result.rows[0] || null);
  }, options).catch((error) => {
    if (isMissingRedeemTableError(error)) {
      throw new Error('Redeem code table is not configured. Run npm run db:migrate:blog first.');
    }
    throw error;
  });
}

export async function deleteRedeemCode(id, options = {}) {
  let result;
  try {
    result = await runBlogQuery(
      `
        DELETE FROM redeem_codes
        WHERE id = $1
        RETURNING id
      `,
      [toText(id)],
      options
    );
  } catch (error) {
    if (isMissingRedeemTableError(error)) {
      throw new Error('Redeem code table is not configured. Run npm run db:migrate:blog first.');
    }
    throw error;
  }

  const deletedId = toText(result.rows[0]?.id);
  if (!deletedId) {
    throw new Error(`Redeem code "${id}" no longer exists.`);
  }

  return { id: deletedId };
}

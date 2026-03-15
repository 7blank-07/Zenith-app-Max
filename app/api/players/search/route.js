import { NextResponse } from 'next/server';
import { normalizePlayerStableRecord, preferPlayerStableRecord } from '../../../../src/lib/server/player-seo-contract.mjs';

export const dynamic = 'force-dynamic';

const DEFAULT_API_BASE_URL = 'https://zenithfcm.com/api';
const LOCAL_API_BASE_URLS = ['http://127.0.0.1:8000', 'http://localhost:8000'];
const DIACRITIC_MARKS_REGEX = /[\u0300-\u036f]/g;
const DEFAULT_COLOR_FALLBACK_RANKS = 5;

const ALLOWED_PARAMS = new Set([
  'q',
  'name_starts_with',
  'position',
  'league',
  'team',
  'nation',
  'event',
  'min_ovr',
  'max_ovr',
  'skill_moves',
  'is_untradable',
  'limit',
  'offset',
  'sort_by',
  'order',
  'rank'
]);

function configuredBaseUrl() {
  return String(process.env.ZENITH_API_BASE_URL || '')
    .trim()
    .replace(/\/+$/, '');
}

function backendCandidates() {
  const configured = configuredBaseUrl();
  const values = [configured, ...LOCAL_API_BASE_URLS, DEFAULT_API_BASE_URL]
    .map((value) => String(value || '').trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return [...new Set(values)];
}

function buildEndpointUrl(baseUrl, pathname, query) {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  const normalizedPath = base.endsWith('/api') ? pathname.replace(/^\/api/, '') : pathname;
  return `${base}${normalizedPath}?${query.toString()}`;
}

function toErrorReason(payload, details = '') {
  if (payload?.error && typeof payload.error === 'string') return payload.error;
  if (typeof payload?.detail === 'string') return payload.detail;
  if (Array.isArray(payload?.detail)) {
    const messages = payload.detail
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          const location = Array.isArray(entry.loc) ? entry.loc.join('.') : '';
          const message = String(entry.msg || '').trim();
          return location ? `${location}: ${message}` : message;
        }
        return '';
      })
      .filter(Boolean);
    if (messages.length) return messages.join('; ');
  }
  return details;
}

function resolvePlayerId(row) {
  return String(row?.player_id ?? row?.playerId ?? row?.playerid ?? row?.id ?? '').trim();
}

function dedupePreferredPlayers(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];

  const byId = new Map();
  const fallbackRows = [];

  for (const row of rows) {
    const playerId = resolvePlayerId(row);
    if (!playerId) {
      fallbackRows.push(row);
      continue;
    }

    const normalized = normalizePlayerStableRecord(row, playerId);
    const existing = byId.get(playerId);
    if (!existing) {
      byId.set(playerId, { row, normalized });
      continue;
    }

    const preferred = preferPlayerStableRecord(existing.normalized, normalized);
    if (preferred === normalized) {
      byId.set(playerId, { row, normalized });
    }
  }

  return [...byId.values()].map((entry) => entry.row).concat(fallbackRows);
}

function readRowColorValue(row, keys) {
  for (const key of keys) {
    const value = String(row?.[key] ?? '').trim();
    if (value) return value;
  }
  return '';
}

function hasRowColorData(row) {
  return !!(
    readRowColorValue(row, ['color_name', 'colorName', 'colorname']) ||
    readRowColorValue(row, ['color_position', 'colorPosition', 'colorposition']) ||
    readRowColorValue(row, ['color_rating', 'colorRating', 'colorrating'])
  );
}

function mergeRowColorData(row, colorSource) {
  const currentName = readRowColorValue(row, ['color_name', 'colorName', 'colorname']);
  const currentPosition = readRowColorValue(row, ['color_position', 'colorPosition', 'colorposition']);
  const currentRating = readRowColorValue(row, ['color_rating', 'colorRating', 'colorrating']);
  const fallbackName = readRowColorValue(colorSource, ['color_name', 'colorName', 'colorname']);
  const fallbackPosition = readRowColorValue(colorSource, ['color_position', 'colorPosition', 'colorposition']);
  const fallbackRating = readRowColorValue(colorSource, ['color_rating', 'colorRating', 'colorrating']);
  if (!fallbackName && !fallbackPosition && !fallbackRating) return row;

  return {
    ...row,
    color_name: currentName || fallbackName,
    color_position: currentPosition || fallbackPosition,
    color_rating: currentRating || fallbackRating
  };
}

async function fetchColorRowsByIdsAtRank(base, ids, rank, attempts) {
  if (!ids.length) return [];
  const query = new URLSearchParams({
    ids: ids.join(','),
    rank: String(rank)
  });
  const url = buildEndpointUrl(base, '/api/players/by-ids', query);

  try {
    const result = await fetchJson(url);
    if (!result.response.ok) {
      attempts.push({
        url,
        status: result.response.status,
        reason: toErrorReason(result.payload, result.details)
      });
      return [];
    }
    const rows = Array.isArray(result.payload?.players) ? result.payload.players : [];
    return dedupePreferredPlayers(rows);
  } catch (error) {
    attempts.push({
      url,
      status: 502,
      reason: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

async function enrichPayloadColors(base, normalizedPayload, attempts) {
  const rows = Array.isArray(normalizedPayload?.players) ? normalizedPayload.players : [];
  if (!rows.length) return normalizedPayload;

  const unresolvedIds = [...new Set(rows.map(resolvePlayerId).filter(Boolean))].filter((playerId) => {
    const row = rows.find((entry) => resolvePlayerId(entry) === playerId);
    return row ? !hasRowColorData(row) : false;
  });
  if (!unresolvedIds.length) return normalizedPayload;

  const colorById = new Map();
  let pendingIds = unresolvedIds;
  for (let rank = 1; rank <= DEFAULT_COLOR_FALLBACK_RANKS && pendingIds.length; rank += 1) {
    const fallbackRows = await fetchColorRowsByIdsAtRank(base, pendingIds, rank, attempts);
    for (const fallbackRow of fallbackRows) {
      const playerId = resolvePlayerId(fallbackRow);
      if (!playerId || colorById.has(playerId) || !hasRowColorData(fallbackRow)) continue;
      colorById.set(playerId, fallbackRow);
    }
    pendingIds = pendingIds.filter((playerId) => !colorById.has(playerId));
  }

  if (!colorById.size) return normalizedPayload;

  return {
    ...normalizedPayload,
    players: rows.map((row) => {
      const playerId = resolvePlayerId(row);
      const fallbackRow = colorById.get(playerId);
      if (!fallbackRow || hasRowColorData(row)) return row;
      return mergeRowColorData(row, fallbackRow);
    })
  };
}

function normalizePlayersPayload(payload, fallbackOffset = 0, fallbackLimit = 50) {
  if (payload && typeof payload === 'object' && Array.isArray(payload.players)) {
    const dedupedPlayers = dedupePreferredPlayers(payload.players);
    const pagination = payload.pagination && typeof payload.pagination === 'object' ? payload.pagination : null;
    const total = Number(pagination?.total);
    return {
      ...payload,
      players: dedupedPlayers,
      ...(pagination
        ? {
            pagination: {
              ...pagination,
              total: Number.isFinite(total) ? Math.max(total, dedupedPlayers.length) : dedupedPlayers.length
            }
          }
        : {})
    };
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.results)) {
    const dedupedResults = dedupePreferredPlayers(payload.results);
    const total = Number.isFinite(Number(payload.total)) ? Number(payload.total) : payload.results.length;
    const limit = Number.isFinite(Number(payload.limit)) ? Number(payload.limit) : fallbackLimit;
    const offset = Number.isFinite(Number(payload.offset)) ? Number(payload.offset) : fallbackOffset;
    const hasMore = payload.has_more === true || offset + dedupedResults.length < total;
    return {
      players: dedupedResults,
      pagination: {
        total: Math.max(total, dedupedResults.length),
        limit,
        offset,
        has_more: hasMore
      }
    };
  }

  return null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(7_000)
  });
  const text = await response.text();
  if (!text) return { response, payload: null, details: '' };

  try {
    return { response, payload: JSON.parse(text), details: text.slice(0, 500) };
  } catch {
    return { response, payload: null, details: text.slice(0, 500) };
  }
}

function pickSearchParams(incoming) {
  const outgoing = new URLSearchParams();
  for (const [key, value] of incoming.entries()) {
    if (!ALLOWED_PARAMS.has(key)) continue;
    const text = String(value || '').trim();
    if (!text) continue;
    outgoing.append(key, text);
  }

  const limit = Math.min(50, Math.max(1, Number.parseInt(outgoing.get('limit') || '50', 10) || 50));
  outgoing.set('limit', String(limit));
  const directQuery = String(outgoing.get('q') || '').trim();
  const legacyQuery = String(outgoing.get('name_starts_with') || '').trim();
  const normalizedQuery = directQuery || legacyQuery;
  if (normalizedQuery) {
    outgoing.set('q', normalizedQuery);
  } else {
    outgoing.delete('q');
  }
  if (legacyQuery) {
    outgoing.set('name_starts_with', legacyQuery);
  } else {
    outgoing.delete('name_starts_with');
  }
  return outgoing;
}

function buildPlayersQuery(outgoing, { includeQ } = { includeQ: true }) {
  const query = new URLSearchParams(outgoing);
  const normalizedSearch = String(query.get('q') || query.get('name_starts_with') || '').trim();
  if (includeQ) {
    if (normalizedSearch) {
      query.set('q', normalizedSearch);
    } else {
      query.delete('q');
    }
    if (!String(query.get('name_starts_with') || '').trim()) {
      query.delete('name_starts_with');
    }
    return query;
  }
  if (normalizedSearch) {
    query.set('name_starts_with', normalizedSearch);
  } else {
    query.delete('name_starts_with');
  }
  query.delete('q');
  return query;
}

function buildLegacySearchQuery(outgoing) {
  const q = String(outgoing.get('q') || outgoing.get('name_starts_with') || '').trim();
  if (!q) return null;

  const query = new URLSearchParams();
  query.set('q', q);
  query.set('limit', outgoing.get('limit') || '50');
  query.set('offset', outgoing.get('offset') || '0');
  query.set('rank', outgoing.get('rank') || '0');
  return query;
}

function normalizeSearchValue(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(DIACRITIC_MARKS_REGEX, '')
    .toLowerCase();
}

function rowSearchSource(row) {
  return normalizeSearchValue(`${row?.name || row?.player_name || ''} ${row?.card_name || row?.cardName || ''}`);
}

function payloadMatchesSearchFilter(normalizedPayload, query) {
  const needle = normalizeSearchValue(query);
  if (!needle) return true;
  const rows = Array.isArray(normalizedPayload?.players) ? normalizedPayload.players : [];
  if (!rows.length) return true;
  return rows.every((row) => rowSearchSource(row).includes(needle));
}

function filterPayloadBySearch(normalizedPayload, query) {
  const needle = normalizeSearchValue(query);
  if (!needle) return normalizedPayload;
  const rows = Array.isArray(normalizedPayload?.players) ? normalizedPayload.players : [];
  const filteredRows = rows.filter((row) => rowSearchSource(row).includes(needle));
  const fallbackPagination = normalizedPayload?.pagination && typeof normalizedPayload.pagination === 'object'
    ? normalizedPayload.pagination
    : {};
  return {
    players: filteredRows,
    pagination: {
      total: filteredRows.length,
      limit: Number.isFinite(Number(fallbackPagination.limit)) ? Number(fallbackPagination.limit) : filteredRows.length,
      offset: Number.isFinite(Number(fallbackPagination.offset)) ? Number(fallbackPagination.offset) : 0,
      has_more: false
    }
  };
}

async function tryPlayersCompatibility(base, outgoing, fallbackOffset, fallbackLimit, attempts) {
  const compatibilityQuery = buildPlayersQuery(outgoing, { includeQ: false });
  const compatibilityUrl = buildEndpointUrl(base, '/api/players', compatibilityQuery);
  try {
    const compatibilityResult = await fetchJson(compatibilityUrl);
    const normalizedCompatibility = normalizePlayersPayload(compatibilityResult.payload, fallbackOffset, fallbackLimit);
    if (compatibilityResult.response.ok && normalizedCompatibility) {
      return {
        payload: normalizedCompatibility,
        status: compatibilityResult.response.status
      };
    }
    attempts.push({
      url: compatibilityUrl,
      status: compatibilityResult.response.status,
      reason: toErrorReason(compatibilityResult.payload, compatibilityResult.details)
    });
  } catch (compatibilityError) {
    attempts.push({
      url: compatibilityUrl,
      status: 502,
      reason: compatibilityError instanceof Error ? compatibilityError.message : String(compatibilityError)
    });
  }
  return null;
}

export async function GET(request) {
  const incoming = new URL(request.url).searchParams;
  const outgoing = pickSearchParams(incoming);
  const fallbackOffset = Number.parseInt(outgoing.get('offset') || '0', 10) || 0;
  const fallbackLimit = Number.parseInt(outgoing.get('limit') || '50', 10) || 50;
  const searchQuery = String(outgoing.get('q') || '').trim();
  const attempts = [];

  for (const base of backendCandidates()) {
    const playersQuery = buildPlayersQuery(outgoing, { includeQ: true });
    const playersUrl = buildEndpointUrl(base, '/api/players', playersQuery);

    try {
      const result = await fetchJson(playersUrl);
      const normalized = normalizePlayersPayload(result.payload, fallbackOffset, fallbackLimit);
      const normalizedWithColors = result.response.ok && normalized
        ? await enrichPayloadColors(base, normalized, attempts)
        : normalized;

      if (result.response.ok && normalizedWithColors) {
        if (searchQuery && playersQuery.has('q') && !payloadMatchesSearchFilter(normalizedWithColors, searchQuery)) {
          const compatibilityPayload = await tryPlayersCompatibility(base, outgoing, fallbackOffset, fallbackLimit, attempts);
          if (compatibilityPayload) {
            const compatibilityWithColors = await enrichPayloadColors(base, compatibilityPayload.payload, attempts);
            return NextResponse.json(compatibilityWithColors, { status: compatibilityPayload.status });
          }
          return NextResponse.json(filterPayloadBySearch(normalizedWithColors, searchQuery), { status: result.response.status });
        }
        return NextResponse.json(normalizedWithColors, { status: result.response.status });
      }

      const reason = toErrorReason(result.payload, result.details);
      attempts.push({ url: playersUrl, status: result.response.status, reason });

      if ((result.response.status === 400 || result.response.status === 422) && playersQuery.has('q')) {
        const compatibilityPayload = await tryPlayersCompatibility(base, outgoing, fallbackOffset, fallbackLimit, attempts);
        if (compatibilityPayload) {
          const compatibilityWithColors = await enrichPayloadColors(base, compatibilityPayload.payload, attempts);
          return NextResponse.json(compatibilityWithColors, { status: compatibilityPayload.status });
        }
      }

      // Some deployments only expose /api/players/search (q=...) and return 422 for /api/players.
      if (result.response.status === 422) {
        const legacyQuery = buildLegacySearchQuery(outgoing);
        if (legacyQuery) {
          const legacyUrl = buildEndpointUrl(base, '/api/players/search', legacyQuery);
          try {
            const legacyResult = await fetchJson(legacyUrl);
            const normalizedLegacy = normalizePlayersPayload(legacyResult.payload, fallbackOffset, fallbackLimit);
            if (legacyResult.response.ok && normalizedLegacy) {
              const legacyWithColors = await enrichPayloadColors(base, normalizedLegacy, attempts);
              return NextResponse.json(legacyWithColors, { status: legacyResult.response.status });
            }

            attempts.push({
              url: legacyUrl,
              status: legacyResult.response.status,
              reason: toErrorReason(legacyResult.payload, legacyResult.details)
            });
          } catch (legacyError) {
            attempts.push({
              url: legacyUrl,
              status: 502,
              reason: legacyError instanceof Error ? legacyError.message : String(legacyError)
            });
          }
        }
      }

      if (result.response.status >= 500 || result.response.status === 404 || result.response.status === 422) {
        continue;
      }
    } catch (error) {
      attempts.push({
        url: playersUrl,
        status: 502,
        reason: error instanceof Error ? error.message : String(error)
      });
      continue;
    }
  }

  const configHint = configuredBaseUrl()
    ? ''
    : ' Set ZENITH_API_BASE_URL to your FastAPI origin (example: http://127.0.0.1:8000).';

  return NextResponse.json(
    {
      error: `Player search backend is unreachable or rejected the request.${configHint}`,
      attempts
    },
    { status: 502 }
  );
}

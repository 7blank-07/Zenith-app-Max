import fs from 'node:fs/promises';
import path from 'node:path';
import { getPlayerSlugResolverPool, hasPlayerColorData, mergePlayerColorData, normalizePlayerStableRecord, preferPlayerStableRecord } from './player-seo-contract.mjs';

const TOP_PLAYERS_PATH = path.join(process.cwd(), 'src', 'data', 'top-players.json');
const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';
const DEFAULT_FILTER_PAGE_SIZE = 500;
const DEFAULT_FILTER_MAX_PAGES = 100;
const DEFAULT_FILTER_FETCH_CONCURRENCY = 6;
const DEFAULT_FILTER_CACHE_TTL_MS = 1000 * 60 * 60;
const DEFAULT_BY_IDS_CACHE_TTL_MS = 1000 * 60 * 5;
const DEFAULT_LATEST_PLAYERS_CACHE_TTL_MS = 1000 * 60 * 5;
const DEFAULT_TOP_IDS_CACHE_TTL_MS = 1000 * 60 * 10;
const DEFAULT_CACHE_MAX_ENTRIES = 20;

let playerFilterMetadataCache = {
  key: '',
  expiresAt: 0,
  value: null,
  inFlight: null
};

const loggedSanitizationContexts = new Set();
const loggedFallbackContexts = new Set();
const SHOULD_LOG_SANITIZATION = process.env.ZENITH_SANITIZE_LOGS === '1';

const playersByIdsCache = new Map();
const latestPlayersCache = new Map();

let topPlayerIdsCache = {
  expiresAt: 0,
  value: null,
  inFlight: null
};

function ensureList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of ['players', 'data', 'results', 'items']) {
    if (payload[key]) return ensureList(payload[key]);
  }
  return [];
}

function sanitizeJsonText(text) {
  const escapeMap = {
    0x08: '\\b',
    0x09: '\\t',
    0x0a: '\\n',
    0x0c: '\\f',
    0x0d: '\\r'
  };
  const isControl = (code) => code <= 0x1f || (code >= 0x7f && code <= 0x9f);
  const escapeControl = (code) => escapeMap[code] || `\\u${code.toString(16).padStart(4, '0')}`;
  const validEscapes = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't'];
  const isWhitespace = (char) => char === ' ' || char === '\n' || char === '\r' || char === '\t';
  const isLikelyStringTerminator = (startIndex) => {
    for (let index = startIndex + 1; index < text.length; index += 1) {
      const char = text[index];
      if (isWhitespace(char)) continue;
      return char === ':' || char === ',' || char === '}' || char === ']';
    }
    return true;
  };

  let output = '';
  let inString = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const code = text.charCodeAt(index);

    if (!inString) {
      if (char === '"') {
        inString = true;
        output += char;
        continue;
      }
      if (isControl(code)) {
        output += code === 0x09 || code === 0x0a || code === 0x0d ? char : ' ';
        continue;
      }
      output += char;
      continue;
    }

    if (char === '"') {
      if (isLikelyStringTerminator(index)) {
        inString = false;
        output += char;
      } else {
        output += '\\"';
      }
      continue;
    }

    if (char === '\\') {
      const nextIndex = index + 1;
      if (nextIndex >= text.length) {
        output += '\\\\';
        break;
      }

      const nextChar = text[nextIndex];
      if (nextChar === 'u') {
        const hex = text.slice(nextIndex + 1, nextIndex + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          output += `\\u${hex}`;
          index = nextIndex + 4;
          continue;
        }
        output += '\\\\';
        continue;
      }

      if (validEscapes.includes(nextChar)) {
        output += `\\${nextChar}`;
        index = nextIndex;
        continue;
      }

      output += '\\\\';
      continue;
    }

    output += isControl(code) ? escapeControl(code) : char;
  }

  return output;
}

function stripControlCharacters(text) {
  return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

async function parseJsonResponse(response, context) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    const sanitized = sanitizeJsonText(text);
    if (sanitized === text) throw error;

    try {
      if (SHOULD_LOG_SANITIZATION && !loggedSanitizationContexts.has(`sanitize:${context}`)) {
        loggedSanitizationContexts.add(`sanitize:${context}`);
        console.warn(`[top-players] Sanitized invalid control characters in ${context} JSON response`);
      }
      return JSON.parse(sanitized);
    } catch {
      const stripped = stripControlCharacters(text);
      if (stripped !== text) {
        try {
          if (SHOULD_LOG_SANITIZATION && !loggedSanitizationContexts.has(`strip:${context}`)) {
            loggedSanitizationContexts.add(`strip:${context}`);
            console.warn(`[top-players] Stripped invalid control characters in ${context} JSON response`);
          }
          return JSON.parse(stripped);
        } catch {
          throw error;
        }
      }
      throw error;
    }
  }
}

async function fetchWithRetry(url, context, maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Failed to fetch ${context} (${response.status}): ${details || response.statusText}`);
      }

      return await parseJsonResponse(response, context);
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts) throw error;
      const delay = attempt * 1000;
      console.warn(`[top-players] Fetch failed for ${context}, retrying in ${delay}ms...`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function ensurePositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.floor(parsed);
  if (normalized <= 0) return fallback;
  return normalized;
}

function setBoundedCacheEntry(cacheMap, cacheKey, value) {
  cacheMap.set(cacheKey, value);
  if (cacheMap.size <= DEFAULT_CACHE_MAX_ENTRIES) return;
  const oldestKey = cacheMap.keys().next().value;
  if (oldestKey !== undefined) {
    cacheMap.delete(oldestKey);
  }
}

function splitIntoChunks(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function toText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function toDateTimestamp(value) {
  const text = toText(value);
  if (!text) return 0;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareLatestPlayers(left, right) {
  const leftDate = toDateTimestamp(left?.dateAdded);
  const rightDate = toDateTimestamp(right?.dateAdded);
  if (leftDate !== rightDate) return rightDate - leftDate;

  const leftOvr = Number(left?.ovr) || 0;
  const rightOvr = Number(right?.ovr) || 0;
  if (leftOvr !== rightOvr) return rightOvr - leftOvr;

  return toText(left?.name).localeCompare(toText(right?.name));
}

function addIfPresent(targetSet, value) {
  const text = toText(value);
  if (text) targetSet.add(text);
}

function parseAlternatePositions(value) {
  const text = toText(value);
  if (!text) return [];
  return text
    .split(/[|,/]/)
    .map((entry) => entry.trim().toUpperCase())
    .filter((entry) => entry && entry !== '0');
}

function sortTextSet(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function resolveEventText(row, normalizedRow) {
  const candidates = [
    row?.event_name,
    row?.event,
    row?.eventName,
    row?.eventname,
    row?.program_name,
    row?.programName,
    normalizedRow?.eventName
  ];
  for (const candidate of candidates) {
    const text = toText(candidate);
    if (text) return text;
  }
  return '';
}

async function fetchRowsByIdsAtRank(baseUrl, ids, rank, chunkSize, concurrency = DEFAULT_FILTER_FETCH_CONCURRENCY) {
  const chunks = splitIntoChunks(ids, chunkSize);
  const results = [];

  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (chunk) => {
        const query = new URLSearchParams({
          ids: chunk.join(','),
          rank: String(rank)
        });
        const requestUrl = `${baseUrl}/players/by-ids?${query.toString()}`;
        return ensureList(await fetchWithRetry(requestUrl, '/players/by-ids'));
      })
    );
    results.push(...batchResults.flat());
  }

  return results;
}

async function fetchColorFallbackById(baseUrl, unresolvedIds, chunkSize, maxFallbackRank) {
  const colorById = new Map();
  let pendingIds = [...new Set(unresolvedIds.map((id) => String(id)).filter(Boolean))];

  for (let fallbackRank = 1; fallbackRank <= maxFallbackRank && pendingIds.length; fallbackRank += 1) {
    try {
      const rows = await fetchRowsByIdsAtRank(baseUrl, pendingIds, fallbackRank, chunkSize);
      for (const row of rows) {
        const normalized = normalizePlayerStableRecord(row, row?.player_id || row?.id);
        if (!normalized.playerId || colorById.has(normalized.playerId) || !hasPlayerColorData(normalized)) continue;
        colorById.set(normalized.playerId, normalized);
      }
      pendingIds = pendingIds.filter((id) => !colorById.has(id));
    } catch (error) {
      console.warn('[top-players] Failed color fallback rank fetch:', {
        fallbackRank,
        unresolvedCount: pendingIds.length,
        reason: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return colorById;
}

export async function readTopPlayerIds(limit = 10000) {
  const parsedLimit = Number(limit);
  const normalizedLimit = Number.isFinite(parsedLimit) ? Math.max(0, Math.floor(parsedLimit)) : 10000;
  const now = Date.now();

  if (Array.isArray(topPlayerIdsCache.value) && topPlayerIdsCache.expiresAt > now) {
    return topPlayerIdsCache.value.slice(0, normalizedLimit);
  }

  if (topPlayerIdsCache.inFlight) {
    const cachedIds = await topPlayerIdsCache.inFlight;
    return cachedIds.slice(0, normalizedLimit);
  }

  const inFlight = (async () => {
    let fileContent;
    try {
      fileContent = await fs.readFile(TOP_PLAYERS_PATH, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') return [];
      throw error;
    }

    const parsed = JSON.parse(fileContent);
    if (!Array.isArray(parsed)) {
      throw new Error('src/data/top-players.json must contain an array of player IDs');
    }

    return parsed.map((id) => String(id)).filter(Boolean);
  })();

  topPlayerIdsCache = {
    ...topPlayerIdsCache,
    inFlight
  };

  try {
    const resolvedIds = await inFlight;
    topPlayerIdsCache = {
      value: resolvedIds,
      expiresAt: Date.now() + DEFAULT_TOP_IDS_CACHE_TTL_MS,
      inFlight: null
    };
    return resolvedIds.slice(0, normalizedLimit);
  } catch (error) {
    topPlayerIdsCache = {
      ...topPlayerIdsCache,
      inFlight: null
    };
    throw error;
  }
}

export async function fetchPlayersByIds(playerIds, options = {}) {
  if (!Array.isArray(playerIds) || !playerIds.length) return [];

  const rank = options.rank ?? 0;
  const normalizedIds = playerIds.map((id) => String(id)).filter(Boolean);
  const chunkSize = ensurePositiveInteger(options.chunkSize, 100);
  const maxColorFallbackRank = ensurePositiveInteger(options.colorFallbackRanks, 5);
  const shouldEnrichColors = options.enrichColors !== false && normalizedIds.length <= 500;
  const cacheTtlMs = ensurePositiveInteger(options.cacheTtlMs, DEFAULT_BY_IDS_CACHE_TTL_MS);
  const baseUrl = (options.baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const cacheKey = `${baseUrl}|${rank}|${chunkSize}|${shouldEnrichColors ? `color-${maxColorFallbackRank}` : 'color-0'}|${normalizedIds.join(',')}`;
  const now = Date.now();
  const cached = playersByIdsCache.get(cacheKey);

  if (cached?.value && cached.expiresAt > now) {
    return cached.value;
  }

  if (cached?.inFlight) {
    return cached.inFlight;
  }

  const inFlight = (async () => {
    const rows = await fetchRowsByIdsAtRank(baseUrl, normalizedIds, rank, chunkSize);

    const byId = new Map();
    for (const row of rows) {
      const normalized = normalizePlayerStableRecord(row, row?.player_id || row?.id);
      if (!normalized.playerId) continue;
      const existing = byId.get(normalized.playerId);
      byId.set(normalized.playerId, preferPlayerStableRecord(existing, normalized));
    }

    if (shouldEnrichColors) {
      const missingColorIds = normalizedIds.filter((id) => {
        const player = byId.get(id);
        return !!player && !hasPlayerColorData(player);
      });

      if (missingColorIds.length) {
        const colorFallbackById = await fetchColorFallbackById(baseUrl, missingColorIds, chunkSize, maxColorFallbackRank);
        for (const id of missingColorIds) {
          const player = byId.get(id);
          const colorSource = colorFallbackById.get(id);
          if (!player || !colorSource) continue;
          byId.set(id, mergePlayerColorData(player, colorSource));
        }
      }
    }

    return normalizedIds
      .map((id) => byId.get(id))
      .filter(Boolean);
  })();

  setBoundedCacheEntry(playersByIdsCache, cacheKey, {
    value: cached?.value || null,
    expiresAt: 0,
    inFlight
  });

  try {
    const value = await inFlight;
    setBoundedCacheEntry(playersByIdsCache, cacheKey, {
      value,
      expiresAt: Date.now() + cacheTtlMs,
      inFlight: null
    });
    return value;
  } catch (error) {
    playersByIdsCache.delete(cacheKey);
    throw error;
  }
}

export async function fetchLatestPlayers(options = {}) {
  const requestedLimit = ensurePositiveInteger(options.limit, 12);
  const rank = options.rank ?? 0;
  const candidateLimit = ensurePositiveInteger(options.candidateLimit, Math.max(requestedLimit * 12, 180));
  const maxCandidateLimit = Math.min(candidateLimit, 1000);
  const chunkSize = ensurePositiveInteger(options.chunkSize, 100);
  const maxColorFallbackRank = ensurePositiveInteger(options.colorFallbackRanks, 5);
  const shouldEnrichColors = options.enrichColors !== false && maxCandidateLimit <= 500;
  const cacheTtlMs = ensurePositiveInteger(options.cacheTtlMs, DEFAULT_LATEST_PLAYERS_CACHE_TTL_MS);
  const baseUrl = (options.baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const cacheKey =
    `${baseUrl}|rank-${rank}|limit-${requestedLimit}|candidates-${maxCandidateLimit}|` +
    `${shouldEnrichColors ? `color-${maxColorFallbackRank}` : 'color-0'}`;
  const now = Date.now();
  const cached = latestPlayersCache.get(cacheKey);

  if (cached?.value && cached.expiresAt > now) {
    return cached.value.slice(0, requestedLimit);
  }

  if (cached?.inFlight) {
    const resolved = await cached.inFlight;
    return resolved.slice(0, requestedLimit);
  }

  const inFlight = (async () => {
    const query = new URLSearchParams({
      limit: String(maxCandidateLimit),
      offset: '0',
      rank: String(rank),
      sort_by: 'date_added',
      order: 'desc'
    });
    const requestUrl = `${baseUrl}/players?${query.toString()}`;
    const payload = await fetchWithRetry(requestUrl, 'latest /players');
    const rows = ensureList(payload);
    const byId = new Map();
    for (const row of rows) {
      const normalized = normalizePlayerStableRecord(row, row?.player_id || row?.id);
      if (!normalized.playerId) continue;
      const existing = byId.get(normalized.playerId);
      byId.set(normalized.playerId, preferPlayerStableRecord(existing, normalized));
    }

    const latestPlayers = [...byId.values()];
    if (shouldEnrichColors) {
      const missingColorIds = latestPlayers
        .filter((player) => player && !hasPlayerColorData(player))
        .map((player) => player.playerId)
        .filter(Boolean);

      if (missingColorIds.length) {
        const colorFallbackById = await fetchColorFallbackById(baseUrl, missingColorIds, chunkSize, maxColorFallbackRank);
        for (const [index, player] of latestPlayers.entries()) {
          if (!player) continue;
          const colorSource = colorFallbackById.get(player.playerId);
          if (!colorSource || hasPlayerColorData(player)) continue;
          latestPlayers[index] = mergePlayerColorData(player, colorSource);
        }
      }
    }

    latestPlayers.sort(compareLatestPlayers);
    return latestPlayers.slice(0, requestedLimit);
  })();

  setBoundedCacheEntry(latestPlayersCache, cacheKey, {
    value: cached?.value || null,
    expiresAt: 0,
    inFlight
  });

  try {
    const value = await inFlight;
    setBoundedCacheEntry(latestPlayersCache, cacheKey, {
      value,
      expiresAt: Date.now() + cacheTtlMs,
      inFlight: null
    });
    return value;
  } catch (error) {
    latestPlayersCache.delete(cacheKey);
    throw error;
  }
}

export async function fetchAllPlayerFilterMetadata(options = {}) {
  const rank = options.rank ?? 0;
  const pageSize = ensurePositiveInteger(options.pageSize, DEFAULT_FILTER_PAGE_SIZE);
  const maxPages = ensurePositiveInteger(options.maxPages, DEFAULT_FILTER_MAX_PAGES);
  const fetchConcurrency = ensurePositiveInteger(options.fetchConcurrency, DEFAULT_FILTER_FETCH_CONCURRENCY);
  const cacheTtlMs = ensurePositiveInteger(options.cacheTtlMs, DEFAULT_FILTER_CACHE_TTL_MS);
  const fallbackCount = ensurePositiveInteger(options.fallbackCount, Math.min(pageSize * 2, 1500));
  const baseUrl = (options.baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const cacheKey = `${baseUrl}|${rank}|${pageSize}|${maxPages}`;
  const now = Date.now();

  if (
    playerFilterMetadataCache.value &&
    playerFilterMetadataCache.key === cacheKey &&
    playerFilterMetadataCache.expiresAt > now
  ) {
    return playerFilterMetadataCache.value;
  }

  if (playerFilterMetadataCache.inFlight && playerFilterMetadataCache.key === cacheKey) {
    return playerFilterMetadataCache.inFlight;
  }

  const inFlight = (async () => {
    const positions = new Set();
    const leagues = new Set();
    const clubs = new Set();
    const nations = new Set();
    const events = new Set();
    const skillMoves = new Set();

    const collectRows = (rows) => {
      for (const row of rows) {
        const normalized = normalizePlayerStableRecord(row, row?.player_id || row?.id);
        addIfPresent(positions, toText(normalized.position).toUpperCase());
        parseAlternatePositions(normalized.alternatePosition).forEach((position) => addIfPresent(positions, position));
        addIfPresent(leagues, normalized.league);
        addIfPresent(clubs, normalized.club);
        addIfPresent(nations, normalized.nation);
        addIfPresent(events, resolveEventText(row, normalized));
        const moves = Number(normalized.skillMoves);
        if (Number.isFinite(moves) && moves > 0) skillMoves.add(moves);
      }
    };

    const fetchPageRows = async (page) => {
      const offset = page * pageSize;
      const query = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
        rank: String(rank),
        sort_by: 'ovr',
        order: 'desc'
      });
      const requestUrl = `${baseUrl}/players?${query.toString()}`;
      const payload = await fetchWithRetry(requestUrl, '/players metadata');
      const rows = ensureList(payload);
      const total = Number(payload?.pagination?.total);
      const hasMore = payload?.pagination?.has_more;
      return {
        rows,
        total: Number.isFinite(total) ? total : null,
        hasMore: typeof hasMore === 'boolean' ? hasMore : null
      };
    };

    try {
      let dbSuccess = false;
      try {
        const dbPool = getPlayerSlugResolverPool();
        if (dbPool) {
          const result = await dbPool.query('SELECT player_id, id, position, alternate_position, league, team, nation_region, event, skill_moves_stars FROM player_stats');
          if (result.rows.length) {
            collectRows(result.rows);
            dbSuccess = true;
          }
        }
      } catch (dbErr) {
        console.warn('[db-fast-path] Filter metadata DB query failed:', dbErr?.message);
      }

      if (!dbSuccess) {
        const firstPage = await fetchPageRows(0);
        if (firstPage.rows.length) {
          collectRows(firstPage.rows);
        }

        const computedTotalPages = firstPage.total ? Math.ceil(firstPage.total / pageSize) : null;
        const effectiveMaxPages = Math.min(maxPages, computedTotalPages || maxPages);
        const firstPageStops = !firstPage.rows.length || firstPage.rows.length < pageSize || firstPage.hasMore === false;

        if (!firstPageStops) {
          for (let pageStart = 1; pageStart < effectiveMaxPages; pageStart += fetchConcurrency) {
            const batchPages = [];
            const pageUpperBound = Math.min(effectiveMaxPages, pageStart + fetchConcurrency);
            for (let page = pageStart; page < pageUpperBound; page += 1) {
              batchPages.push(page);
            }

            const batchResults = await Promise.all(batchPages.map((page) => fetchPageRows(page)));
            let shouldStop = false;

            for (const result of batchResults) {
              if (!result.rows.length) {
                shouldStop = true;
                break;
              }

              collectRows(result.rows);

              if (result.rows.length < pageSize || result.hasMore === false) {
                shouldStop = true;
                break;
              }
            }

            if (shouldStop) break;
          }
        }
      }
    } catch (error) {
      if (SHOULD_LOG_SANITIZATION && !loggedFallbackContexts.has(cacheKey)) {
        loggedFallbackContexts.add(cacheKey);
        console.warn('[top-players] Falling back to top player pool for filter metadata:', {
          reason: error instanceof Error ? error.message : String(error)
        });
      }
      try {
        const fallbackIds = await readTopPlayerIds(fallbackCount);
        if (fallbackIds.length) {
          const fallbackRows = await fetchPlayersByIds(fallbackIds, { rank });
          collectRows(fallbackRows);
        }
      } catch (fallbackError) {
        console.warn('[top-players] Filter metadata fallback failed:', {
          reason: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        });
      }
    }

    const value = {
      positions: sortTextSet(positions),
      leagues: sortTextSet(leagues),
      clubs: sortTextSet(clubs),
      nations: sortTextSet(nations),
      events: sortTextSet(events),
      skillMoves: [...skillMoves].sort((left, right) => right - left)
    };

    playerFilterMetadataCache = {
      key: cacheKey,
      value,
      expiresAt: Date.now() + cacheTtlMs,
      inFlight: null
    };
    return value;
  })();

  playerFilterMetadataCache = {
    ...playerFilterMetadataCache,
    key: cacheKey,
    inFlight
  };

  try {
    return await inFlight;
  } catch (error) {
    playerFilterMetadataCache = {
      ...playerFilterMetadataCache,
      inFlight: null
    };
    throw error;
  }
}

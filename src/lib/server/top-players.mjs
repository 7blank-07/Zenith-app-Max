import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizePlayerStableRecord } from './player-seo-contract.mjs';

const TOP_PLAYERS_PATH = path.join(process.cwd(), 'src', 'data', 'top-players.json');
const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';
const DEFAULT_FILTER_PAGE_SIZE = 500;
const DEFAULT_FILTER_MAX_PAGES = 100;
const DEFAULT_FILTER_CACHE_TTL_MS = 1000 * 60 * 15;

let playerFilterMetadataCache = {
  key: '',
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

export async function readTopPlayerIds(limit = 10000) {
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

  const normalized = parsed.map((id) => String(id)).filter(Boolean);
  return normalized.slice(0, limit);
}

export async function fetchPlayersByIds(playerIds, options = {}) {
  if (!Array.isArray(playerIds) || !playerIds.length) return [];

  const rank = options.rank ?? 0;
  const chunkSize = options.chunkSize ?? 100;
  const baseUrl = (options.baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const normalizedIds = playerIds.map((id) => String(id)).filter(Boolean);
  const byId = new Map();

  for (const chunk of splitIntoChunks(normalizedIds, chunkSize)) {
    const query = new URLSearchParams({
      ids: chunk.join(','),
      rank: String(rank)
    });
    const requestUrl = `${baseUrl}/players/by-ids?${query.toString()}`;
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Failed to fetch /players/by-ids (${response.status}): ${details || response.statusText}`);
    }

    const payload = await response.json();
    const rows = ensureList(payload);

    for (const row of rows) {
      const normalized = normalizePlayerStableRecord(row, row?.player_id || row?.id);
      if (!normalized.playerId || byId.has(normalized.playerId)) continue;
      byId.set(normalized.playerId, normalized);
    }
  }

  return normalizedIds
    .map((id) => byId.get(id))
    .filter(Boolean);
}

export async function fetchAllPlayerFilterMetadata(options = {}) {
  const rank = options.rank ?? 0;
  const pageSize = options.pageSize ?? DEFAULT_FILTER_PAGE_SIZE;
  const maxPages = options.maxPages ?? DEFAULT_FILTER_MAX_PAGES;
  const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_FILTER_CACHE_TTL_MS;
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

    for (let page = 0; page < maxPages; page += 1) {
      const offset = page * pageSize;
      const query = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
        rank: String(rank),
        sort_by: 'ovr',
        order: 'desc'
      });
      const requestUrl = `${baseUrl}/players?${query.toString()}`;
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Failed to fetch /players metadata (${response.status}): ${details || response.statusText}`);
      }

      const payload = await response.json();
      const rows = ensureList(payload);
      if (!rows.length) break;

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

      if (rows.length < pageSize) break;
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

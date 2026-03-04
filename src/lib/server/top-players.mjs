import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizePlayerStableRecord } from './player-seo-contract.mjs';

const TOP_PLAYERS_PATH = path.join(process.cwd(), 'src', 'data', 'top-players.json');
const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';

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

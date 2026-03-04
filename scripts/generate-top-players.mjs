import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Usage:
//   npm run generate:top-players
//   node scripts/generate-top-players.mjs --source file --input C:\data\players.json
//   node scripts/generate-top-players.mjs --source supabase --limit 10000

const DEFAULT_LIMIT = 10000;
const DEFAULT_OUTPUT_PATH = path.join('src', 'data', 'top-players.json');
const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';
const DEFAULT_SUPABASE_TABLE = process.env.TOP_PLAYERS_TABLE || 'players';

function parseArgs(argv) {
  const config = {
    source: 'auto',
    limit: DEFAULT_LIMIT,
    input: undefined,
    output: DEFAULT_OUTPUT_PATH,
    baseUrl: DEFAULT_API_BASE_URL,
    rank: 0,
    supabaseTable: DEFAULT_SUPABASE_TABLE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const [rawKey, inlineValue] = token.split('=');
    const key = rawKey.slice(2);
    let value = inlineValue;
    if (value === undefined && argv[index + 1] && !argv[index + 1].startsWith('--')) {
      value = argv[index + 1];
      index += 1;
    }

    if (!value) continue;

    if (key === 'source') config.source = value;
    if (key === 'limit') config.limit = Number.parseInt(value, 10);
    if (key === 'input') config.input = value;
    if (key === 'output') config.output = value;
    if (key === 'base-url') config.baseUrl = value;
    if (key === 'rank') config.rank = Number.parseInt(value, 10);
    if (key === 'supabase-table') config.supabaseTable = value;
  }

  if (!Number.isFinite(config.limit) || config.limit <= 0) {
    config.limit = DEFAULT_LIMIT;
  }
  if (!Number.isFinite(config.rank) || config.rank < 0) {
    config.rank = 0;
  }

  return config;
}

function toText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

function firstDefined(values, fallback) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of ['data', 'players', 'results', 'items']) {
    if (payload[key]) return extractRows(payload[key]);
  }
  return [];
}

function normalizePlayerCandidate(record) {
  const playerId = toText(firstDefined([record.player_id, record.playerid, record.id, record.asset_id], ''));
  const ovr = toNumber(firstDefined([record.ovr, record.overall, record.rating], 0), 0);
  const isUntradable = toBoolean(firstDefined([record.is_untradable, record.untradable], false));

  return {
    playerId,
    ovr,
    isUntradable
  };
}

function rankPlayers(rawRows) {
  const candidates = rawRows
    .map(normalizePlayerCandidate)
    .filter((candidate) => candidate.playerId !== '' && candidate.ovr > 0);

  candidates.sort((a, b) => {
    if (b.ovr !== a.ovr) return b.ovr - a.ovr;
    if (a.isUntradable !== b.isUntradable) return Number(a.isUntradable) - Number(b.isUntradable);
    return a.playerId.localeCompare(b.playerId);
  });

  return candidates;
}

function parseCsv(content) {
  const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
  if (!headerLine) return [];
  const headers = headerLine.split(',').map((header) => header.trim());

  return lines.map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

async function loadPlayersFromFile(inputPath) {
  const resolved = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);
  const content = await fs.readFile(resolved, 'utf8');

  if (resolved.toLowerCase().endsWith('.csv')) {
    return parseCsv(content);
  }

  const payload = JSON.parse(content);
  const rows = extractRows(payload);
  return rows.length ? rows : Array.isArray(payload) ? payload : [];
}

async function loadPlayersFromApi({ baseUrl, limit, rank }) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const pageSize = 500;
  const pagesLimit = 100;
  const rawRowsTarget = limit + 2000;
  const rows = [];

  for (let page = 0; page < pagesLimit; page += 1) {
    if (rows.length >= rawRowsTarget) break;

    const offset = page * pageSize;
    const query = new URLSearchParams({
      limit: String(pageSize),
      offset: String(offset),
      sort_by: 'ovr',
      order: 'desc',
      rank: String(rank)
    });
    const requestUrl = `${normalizedBaseUrl}/players?${query.toString()}`;
    const response = await fetch(requestUrl, { method: 'GET', headers: { Accept: 'application/json' } });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`API request failed (${response.status}): ${details || response.statusText}`);
    }

    const payload = await response.json();
    const pageRows = extractRows(payload);
    if (!pageRows.length) break;
    rows.push(...pageRows);

    if (pageRows.length < pageSize) break;
  }

  return rows;
}

async function loadPlayersFromSupabase({ supabaseUrl, serviceKey, table, limit }) {
  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const rows = [];
  const pageSize = 1000;
  const rawRowsTarget = limit + 2000;
  let orderColumn = 'ovr';

  for (let page = 0; rows.length < rawRowsTarget; page += 1) {
    const rangeStart = page * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    let queryResult = await client
      .from(table)
      .select('player_id,id,asset_id,ovr,overall,is_untradable,untradable')
      .order(orderColumn, { ascending: false })
      .range(rangeStart, rangeEnd);

    if (queryResult.error && orderColumn === 'ovr') {
      orderColumn = 'overall';
      queryResult = await client
        .from(table)
        .select('player_id,id,asset_id,ovr,overall,is_untradable,untradable')
        .order(orderColumn, { ascending: false })
        .range(rangeStart, rangeEnd);
    }

    if (queryResult.error) {
      throw new Error(`Supabase query failed: ${queryResult.error.message}`);
    }

    const pageRows = queryResult.data || [];
    if (!pageRows.length) break;
    rows.push(...pageRows);
    if (pageRows.length < pageSize) break;
  }

  return rows;
}

async function resolveSourceRows(config) {
  const attempted = [];
  const source = config.source.toLowerCase();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  async function trySource(name, loader) {
    attempted.push(name);
    return loader();
  }

  if (source === 'file') {
    if (!config.input) {
      throw new Error('--input is required when --source file is used');
    }
    return { source: 'file', rows: await trySource('file', () => loadPlayersFromFile(config.input)) };
  }

  if (source === 'supabase') {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required for supabase source');
    }
    return {
      source: 'supabase',
      rows: await trySource('supabase', () => loadPlayersFromSupabase({
        supabaseUrl,
        serviceKey: supabaseServiceKey,
        table: config.supabaseTable,
        limit: config.limit
      }))
    };
  }

  if (source === 'api') {
    return {
      source: 'api',
      rows: await trySource('api', () => loadPlayersFromApi({
        baseUrl: config.baseUrl,
        limit: config.limit,
        rank: config.rank
      }))
    };
  }

  if (source !== 'auto') {
    throw new Error(`Unsupported source "${config.source}". Use auto, api, supabase, or file.`);
  }

  if (config.input) {
    try {
      const fileRows = await trySource('file', () => loadPlayersFromFile(config.input));
      return { source: 'file', rows: fileRows };
    } catch (error) {
      console.warn(`[generate-top-players] file source failed: ${error.message}`);
    }
  }

  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabaseRows = await trySource('supabase', () => loadPlayersFromSupabase({
        supabaseUrl,
        serviceKey: supabaseServiceKey,
        table: config.supabaseTable,
        limit: config.limit
      }));
      return { source: 'supabase', rows: supabaseRows };
    } catch (error) {
      console.warn(`[generate-top-players] supabase source failed: ${error.message}`);
    }
  }

  try {
    const apiRows = await trySource('api', () => loadPlayersFromApi({
      baseUrl: config.baseUrl,
      limit: config.limit,
      rank: config.rank
    }));
    return { source: 'api', rows: apiRows };
  } catch (error) {
    throw new Error(
      `Unable to load players from sources [${attempted.join(', ')}]: ${error.message}. ` +
      'Provide --input <file>, configure SUPABASE_SERVICE_KEY, or set --source api with a reachable API base URL.'
    );
  }
}

async function writeTopPlayers(outputPath, topPlayerIds) {
  const resolvedOutput = path.isAbsolute(outputPath)
    ? outputPath
    : path.join(process.cwd(), outputPath);
  await fs.mkdir(path.dirname(resolvedOutput), { recursive: true });
  await fs.writeFile(resolvedOutput, `${JSON.stringify(topPlayerIds, null, 2)}\n`, 'utf8');
  return resolvedOutput;
}

async function run() {
  const config = parseArgs(process.argv.slice(2));
  const sourceRows = await resolveSourceRows(config);
  const rankedCandidates = rankPlayers(sourceRows.rows);

  if (!rankedCandidates.length) {
    throw new Error(`No valid player rows were found from source "${sourceRows.source}"`);
  }

  let auctionableCandidates = 0;
  let untradableCandidates = 0;
  const seenPlayerIds = new Set();
  const topPlayerIds = [];

  for (const candidate of rankedCandidates) {
    if (candidate.isUntradable) {
      untradableCandidates += 1;
    } else {
      auctionableCandidates += 1;
    }

    if (seenPlayerIds.has(candidate.playerId)) continue;
    seenPlayerIds.add(candidate.playerId);
    topPlayerIds.push(candidate.playerId);
    if (topPlayerIds.length >= config.limit) break;
  }

  if (topPlayerIds.length < config.limit) {
    console.warn(
      `[generate-top-players] only ${topPlayerIds.length} unique IDs were available for requested limit ${config.limit}`
    );
  }

  if (!auctionableCandidates || !untradableCandidates) {
    console.warn(
      `[generate-top-players] category coverage check: auctionable=${auctionableCandidates}, untradable=${untradableCandidates}`
    );
  }

  const writtenPath = await writeTopPlayers(config.output, topPlayerIds);
  console.log(`[generate-top-players] source=${sourceRows.source}`);
  console.log(`[generate-top-players] rankedCandidates=${rankedCandidates.length}`);
  console.log(`[generate-top-players] topPlayerIds=${topPlayerIds.length}`);
  console.log(`[generate-top-players] output=${writtenPath}`);
}

run().catch((error) => {
  console.error(`[generate-top-players] failed: ${error.message}`);
  process.exitCode = 1;
});

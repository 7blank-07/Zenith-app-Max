import fs from 'node:fs/promises';
import path from 'node:path';

const TOP_PLAYERS_PATH = path.join(process.cwd(), 'src', 'data', 'top-players.json');

function parseArgs(argv) {
  const args = {
    endpoint: process.env.REVALIDATE_ENDPOINT || '',
    secret: process.env.REVALIDATE_SECRET || '',
    includeListings: true,
    dryRun: false
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

    if (key === 'endpoint' && value) args.endpoint = value;
    if (key === 'secret' && value) args.secret = value;
    if (key === 'paths' && value) args.paths = value;
    if (key === 'player-ids' && value) args.playerIds = value;
    if (key === 'from-top-file' && value) args.fromTopFile = Number.parseInt(value, 10);
    if (key === 'include-listings' && value) args.includeListings = value !== 'false';
    if (key === 'dry-run') args.dryRun = true;
  }

  if (!Number.isFinite(args.fromTopFile) || args.fromTopFile <= 0) {
    delete args.fromTopFile;
  }

  return args;
}

function splitCsv(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function readTopPlayersFromFile(limit) {
  const fileContent = await fs.readFile(TOP_PLAYERS_PATH, 'utf8');
  const parsed = JSON.parse(fileContent);
  if (!Array.isArray(parsed)) {
    throw new Error('src/data/top-players.json must contain an array of player IDs');
  }
  return parsed.slice(0, limit).map((id) => String(id));
}

async function buildPayload(args) {
  const paths = splitCsv(args.paths);
  const playerIds = splitCsv(args.playerIds);

  if (args.fromTopFile) {
    const fromTop = await readTopPlayersFromFile(args.fromTopFile);
    playerIds.push(...fromTop);
  }

  return {
    secret: args.secret,
    includeListings: args.includeListings,
    paths,
    playerIds: [...new Set(playerIds)]
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.endpoint) {
    throw new Error('Missing REVALIDATE_ENDPOINT or --endpoint');
  }
  if (!args.secret) {
    throw new Error('Missing REVALIDATE_SECRET or --secret');
  }

  const payload = await buildPayload(args);
  if (!payload.paths.length && !payload.playerIds.length && !payload.includeListings) {
    throw new Error('No paths were supplied and includeListings=false, nothing to revalidate');
  }

  if (args.dryRun) {
    console.log('[call-revalidate] dry-run payload:');
    console.log(JSON.stringify({ ...payload, secret: '***redacted***' }, null, 2));
    return;
  }

  const response = await fetch(args.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(`Revalidate request failed (${response.status}): ${JSON.stringify(responseBody)}`);
  }

  console.log('[call-revalidate] success');
  console.log(JSON.stringify(responseBody, null, 2));
}

run().catch((error) => {
  console.error(`[call-revalidate] failed: ${error.message}`);
  process.exitCode = 1;
});

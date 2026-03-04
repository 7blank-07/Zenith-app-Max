const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';
const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const PLAYER_PAGE_REVALIDATE_SECONDS = 60 * 60 * 24 * 50;

export const PLAYER_STABLE_RECORD_FIELDS = Object.freeze([
  'playerId',
  'name',
  'ovr',
  'position',
  'image',
  'summary',
  'rank',
  'isUntradable'
]);

export const PLAYER_SEO_FIELDS = Object.freeze([
  'title',
  'description',
  'canonical',
  'canonicalPath',
  'openGraph',
  'jsonLd'
]);

function firstDefined(values, fallback) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
}

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function toInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    return lowered === 'true' || lowered === '1' || lowered === 'yes';
  }
  return false;
}

function sanitizeSummary(value) {
  return toText(value).replace(/\s+/g, ' ').trim();
}

function normalizeApiPayload(payload) {
  if (Array.isArray(payload)) {
    return payload[0] || {};
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['data', 'player', 'result', 'payload']) {
      if (payload[key]) {
        return normalizeApiPayload(payload[key]);
      }
    }
    return payload;
  }

  return {};
}

export function normalizePlayerStableRecord(rawPlayer, fallbackPlayerId) {
  const source = rawPlayer && typeof rawPlayer === 'object' ? rawPlayer : {};
  const playerId = toText(
    firstDefined([source.player_id, source.playerid, source.id, fallbackPlayerId], fallbackPlayerId),
    ''
  );
  const name = toText(firstDefined([source.name, source.player_name], 'Unknown Player'));
  const ovr = toInteger(firstDefined([source.ovr, source.overall, source.rating], 0), 0);
  const position = toText(firstDefined([source.position, source.pos, source.primary_position], ''), '');
  const image = toText(firstDefined([source.image, source.image_url, source.card_image, source.player_image], ''), '');
  const summary = sanitizeSummary(firstDefined([source.summary, source.description, source.bio], ''));
  const rank = toInteger(firstDefined([source.rank], 0), 0);
  const isUntradable = toBoolean(firstDefined([source.is_untradable, source.untradable], false));

  return {
    playerId,
    name,
    ovr,
    position,
    image,
    summary,
    rank,
    isUntradable
  };
}

export function buildPlayerSeoMetadata(playerRecord, options = {}) {
  const siteName = options.siteName || 'Zenith';
  const siteUrl = options.siteUrl || DEFAULT_SITE_URL;
  const player = normalizePlayerStableRecord(playerRecord, playerRecord?.playerId || '');
  const label = player.ovr > 0 ? `${player.name} (${player.ovr} OVR)` : player.name;
  const title = `${label} | ${siteName}`;
  const fallbackDescription = `View ${player.name}${player.position ? ` (${player.position})` : ''} on ${siteName}.`;
  const description = player.summary || fallbackDescription;
  const canonicalPath = `/player/${encodeURIComponent(player.playerId)}`;
  const canonical = new URL(canonicalPath, siteUrl).toString();

  return {
    title,
    description,
    canonical,
    canonicalPath,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: player.image ? [{ url: player.image }] : undefined
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: player.name,
      description,
      url: canonical,
      image: player.image || undefined,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'OVR', value: String(player.ovr) },
        { '@type': 'PropertyValue', name: 'Position', value: player.position || 'Unknown' },
        { '@type': 'PropertyValue', name: 'Rank', value: String(player.rank) }
      ]
    }
  };
}

export async function fetchPlayerStableRecord(playerId, options = {}) {
  if (playerId === undefined || playerId === null || playerId === '') {
    throw new Error('playerId is required');
  }

  const rank = options.rank ?? 0;
  const baseUrl = (options.baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const timeoutMs = options.timeoutMs ?? 10000;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required for server data loading');
  }

  const endpoint = `${baseUrl}/players/${encodeURIComponent(playerId)}?rank=${encodeURIComponent(rank)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Player fetch failed (${response.status}): ${details || response.statusText}`);
  }

  const payload = await response.json();
  const normalizedPayload = normalizeApiPayload(payload);
  return normalizePlayerStableRecord(normalizedPayload, playerId);
}

export async function resolvePlayerSeoContract(playerId, options = {}) {
  const { metadataOptions = {}, ...fetchOptions } = options;
  const record = await fetchPlayerStableRecord(playerId, fetchOptions);
  const metadata = buildPlayerSeoMetadata(record, metadataOptions);
  return { record, metadata };
}

const EXPORT_PROXY_PATH = '/api/export-image';
const EXPORT_PROXYABLE_PROTOCOLS = new Set(['http:', 'https:']);
const EXPORT_ALLOWED_HOSTS = [
  /(^|\.)images\.zenithfcm\.com$/i,
  /(^|\.)renderz\.app$/i,
  /(^|\.)cdn\.futbin\.com$/i,
  /(^|\.)api\.qrserver\.com$/i
];

const EXPORT_FALLBACK_CARD_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><rect width="300" height="400" rx="26" fill="url(#g)"/><rect x="18" y="18" width="264" height="364" rx="20" fill="none" stroke="#64748B" stroke-opacity="0.45" stroke-width="3"/><text x="150" y="208" text-anchor="middle" fill="#CBD5E1" font-size="24" font-family="Segoe UI, Arial">ZENITH</text></svg>'
)}`;
const EXPORT_FALLBACK_PLAYER_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A5B4FC"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient></defs><rect width="200" height="300" fill="none"/><circle cx="100" cy="88" r="42" fill="url(#p)" opacity="0.92"/><rect x="48" y="136" width="104" height="122" rx="52" fill="url(#p)" opacity="0.92"/></svg>'
)}`;
const EXPORT_FALLBACK_FLAG_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16"><rect width="24" height="16" rx="2" fill="#0F172A"/><rect x="1" y="1" width="22" height="14" rx="1.5" fill="#1E293B"/><rect x="1" y="1" width="7.3" height="14" fill="#1D4ED8"/><rect x="8.3" y="1" width="7.3" height="14" fill="#E2E8F0"/><rect x="15.6" y="1" width="7.4" height="14" fill="#DC2626"/></svg>'
)}`;

const liveImageDataUrlCache = new Map();

export {
  EXPORT_FALLBACK_CARD_URL,
  EXPORT_FALLBACK_PLAYER_URL,
  EXPORT_FALLBACK_FLAG_URL
};

export function clearExportMediaCache() {
  liveImageDataUrlCache.clear();
}

export function normalizeExportAssetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://zenithfcm.com';
    const parsed = new URL(raw, baseUrl);
    if (!EXPORT_PROXYABLE_PROTOCOLS.has(parsed.protocol)) {
      return '';
    }
    if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
      return parsed.href;
    }
    const isAllowedRemoteHost = EXPORT_ALLOWED_HOSTS.some((pattern) => pattern.test(parsed.hostname));
    if (!isAllowedRemoteHost) {
      return '';
    }
    if (typeof window === 'undefined') {
      return parsed.href;
    }
    const proxyUrl = new URL(EXPORT_PROXY_PATH, window.location.origin);
    proxyUrl.searchParams.set('url', parsed.href);
    return `${proxyUrl.pathname}${proxyUrl.search}`;
  } catch (_) {
    return raw;
  }
}

export function resolvePlayerFromMap(playersById, playerId) {
  if (!playersById || typeof playersById.get !== 'function') return null;
  const normalizedPlayerId = String(playerId || '').trim();
  if (!normalizedPlayerId) return null;
  return playersById.get(normalizedPlayerId) || playersById.get(playerId) || null;
}

function extractLoadedImageAsDataUrl(imageElement) {
  if (!imageElement) return '';
  const src = imageElement.currentSrc || imageElement.getAttribute('src') || '';
  if (!src) return '';
  if (src.startsWith('data:')) return src;
  if (!imageElement.complete || imageElement.naturalWidth <= 0 || imageElement.naturalHeight <= 0) {
    return '';
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return '';
    context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.startsWith('data:image/') ? dataUrl : '';
  } catch (_) {
    return '';
  }
}

function getLiveCardElement(playerId) {
  if (typeof document === 'undefined') return null;
  const normalizedPlayerId = String(playerId || '').trim();
  if (!normalizedPlayerId) return null;
  const cards = Array.from(document.querySelectorAll('.player-preview-card[data-player-id], .bench-preview-card[data-player-id]'));
  return cards.find((card) => String(card.dataset.playerId || '') === normalizedPlayerId) || null;
}

function getFirstText(cardElement, selectors = []) {
  for (const selector of selectors) {
    const element = cardElement.querySelector(selector);
    if (!element) continue;
    const text = String(element.textContent || '').trim();
    if (text) return text;
  }
  return '';
}

function getFirstImageSource(cardElement, selectors = []) {
  for (const selector of selectors) {
    const element = cardElement.querySelector(selector);
    if (!element) continue;
    const source = normalizeExportAssetUrl(element.currentSrc || element.getAttribute('src') || '');
    if (source) return source;
  }
  return '';
}

function parseOvr(value) {
  const digits = String(value || '').replace(/[^0-9]/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLiveCardImage(playerId, selectors = []) {
  const normalizedPlayerId = String(playerId || '').trim();
  if (!normalizedPlayerId || !selectors.length) return '';
  const cacheKey = `${normalizedPlayerId}:${selectors.join('|')}`;
  if (liveImageDataUrlCache.has(cacheKey)) {
    return liveImageDataUrlCache.get(cacheKey);
  }

  const cardElement = getLiveCardElement(normalizedPlayerId);
  if (!cardElement) {
    liveImageDataUrlCache.set(cacheKey, '');
    return '';
  }

  for (const selector of selectors) {
    const imageElement = cardElement.querySelector(selector);
    if (!imageElement) continue;
    const extractedDataUrl = extractLoadedImageAsDataUrl(imageElement);
    if (extractedDataUrl) {
      liveImageDataUrlCache.set(cacheKey, extractedDataUrl);
      return extractedDataUrl;
    }
    const normalizedSource = normalizeExportAssetUrl(imageElement.currentSrc || imageElement.getAttribute('src') || '');
    if (normalizedSource) {
      liveImageDataUrlCache.set(cacheKey, normalizedSource);
      return normalizedSource;
    }
  }

  liveImageDataUrlCache.set(cacheKey, '');
  return '';
}

export function buildExportMediaMap({ starters = {}, bench = [], playersById }) {
  const assignedPlayerIds = new Set();
  Object.values(starters || {}).forEach((playerId) => {
    const normalizedPlayerId = String(playerId || '').trim();
    if (normalizedPlayerId) assignedPlayerIds.add(normalizedPlayerId);
  });
  (Array.isArray(bench) ? bench : []).forEach((playerId) => {
    const normalizedPlayerId = String(playerId || '').trim();
    if (normalizedPlayerId) assignedPlayerIds.add(normalizedPlayerId);
  });

  const mediaByPlayer = {};
  assignedPlayerIds.forEach((playerId) => {
    const player = resolvePlayerFromMap(playersById, playerId) || { playerId };
    const cardBackground =
      getLiveCardImage(playerId, ['.preview-card-bg', '.bench-card-bg']) ||
      normalizeExportAssetUrl(player?.cardBackground) ||
      EXPORT_FALLBACK_CARD_URL;
    const playerImage =
      getLiveCardImage(playerId, ['.preview-card-player-img', '.bench-card-player-img']) ||
      normalizeExportAssetUrl(player?.playerImage) ||
      normalizeExportAssetUrl(`https://cdn.futbin.com/content/fifa25/img/players/${playerId}.png`) ||
      EXPORT_FALLBACK_PLAYER_URL;
    const nationFlag =
      getLiveCardImage(playerId, ['.preview-card-flag-nation', '.bench-card-flag-nation', '.card-nation-flag']) ||
      normalizeExportAssetUrl(player?.nationFlag);
    const clubFlag =
      getLiveCardImage(playerId, ['.preview-card-flag-club', '.bench-card-flag-club', '.card-club-flag']) ||
      normalizeExportAssetUrl(player?.clubFlag);
    const leagueImage =
      getLiveCardImage(playerId, ['.preview-card-flag-league', '.bench-card-flag-league', '.card-league-flag']) ||
      normalizeExportAssetUrl(player?.leagueImage);

    mediaByPlayer[playerId] = {
      cardBackground,
      playerImage,
      nationFlag,
      clubFlag,
      leagueImage
    };
  });

  return mediaByPlayer;
}

export function buildExportFallbackPlayers({ starters = {}, bench = [], playersById }) {
  const assignedPlayerIds = new Set();
  Object.values(starters || {}).forEach((playerId) => {
    const normalizedPlayerId = String(playerId || '').trim();
    if (normalizedPlayerId) assignedPlayerIds.add(normalizedPlayerId);
  });
  (Array.isArray(bench) ? bench : []).forEach((playerId) => {
    const normalizedPlayerId = String(playerId || '').trim();
    if (normalizedPlayerId) assignedPlayerIds.add(normalizedPlayerId);
  });

  const fallbackPlayers = {};

  assignedPlayerIds.forEach((playerId) => {
    const mappedPlayer = resolvePlayerFromMap(playersById, playerId);
    if (mappedPlayer) {
      fallbackPlayers[playerId] = mappedPlayer;
      return;
    }

    const liveCardElement = getLiveCardElement(playerId);
    if (!liveCardElement) return;

    const name = getFirstText(liveCardElement, ['.preview-card-name', '.bench-card-name']) || 'Unknown';
    const position = getFirstText(liveCardElement, ['.preview-card-position', '.bench-card-position']) || 'NA';
    const ovrText = getFirstText(liveCardElement, ['.preview-card-ovr', '.bench-card-ovr']);
    const colorRatingElement = liveCardElement.querySelector('.preview-card-ovr, .bench-card-ovr');
    const colorPositionElement = liveCardElement.querySelector('.preview-card-position, .bench-card-position');
    const colorNameElement = liveCardElement.querySelector('.preview-card-name, .bench-card-name');
    const nationFlag = getFirstImageSource(liveCardElement, ['.preview-card-flag-nation', '.bench-card-flag-nation', '.card-nation-flag']);
    const clubFlag = getFirstImageSource(liveCardElement, ['.preview-card-flag-club', '.bench-card-flag-club', '.card-club-flag']);
    const leagueImage = getFirstImageSource(liveCardElement, ['.preview-card-flag-league', '.bench-card-flag-league', '.card-league-flag']);

    fallbackPlayers[playerId] = {
      playerId,
      name,
      ovr: parseOvr(ovrText),
      position,
      colorRating: colorRatingElement?.style?.color || '#FFFFFF',
      colorPosition: colorPositionElement?.style?.color || '#FFFFFF',
      colorName: colorNameElement?.style?.color || '#FFFFFF',
      nationFlag,
      clubFlag,
      leagueImage,
      isUntradable: Boolean(liveCardElement.querySelector('.card-untradable-badge'))
    };
  });

  return fallbackPlayers;
}

export function getExportLoadState({ starters = {}, bench = [], playersById }) {
  const starterIds = Object.values(starters || {})
    .map((playerId) => String(playerId || '').trim())
    .filter(Boolean);
  const benchIds = (Array.isArray(bench) ? bench : [])
    .map((playerId) => String(playerId || '').trim())
    .filter(Boolean);

  const missingStarters = starterIds.filter((playerId) => !resolvePlayerFromMap(playersById, playerId));
  const missingBench = benchIds.filter((playerId) => !resolvePlayerFromMap(playersById, playerId));

  return {
    playersLoaded: missingStarters.length === 0,
    subsLoaded: missingBench.length === 0,
    starterCount: starterIds.length,
    benchCount: benchIds.length,
    missingStarters,
    missingBench
  };
}

export async function waitForExportLoadState(args, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 2000;
  const intervalMs = Number.isFinite(options.intervalMs) ? options.intervalMs : 120;
  const start = Date.now();
  let state = getExportLoadState(args);

  while ((!state.playersLoaded || !state.subsLoaded) && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    state = getExportLoadState(args);
  }

  return state;
}


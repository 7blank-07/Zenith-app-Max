function toText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function toDigits(value) {
  return toText(value).replace(/\D+/g, '');
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function right(value, size) {
  const text = toText(value);
  if (!text) return '';
  return text.slice(-size);
}

export function slugifyPlayerName(name) {
  const normalized = toText(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return normalized || 'player';
}

export function buildPlayerSlug(playerLike) {
  const source = playerLike && typeof playerLike === 'object' ? playerLike : {};
  const playerId = toDigits(source.playerId ?? source.player_id ?? source.playerid);
  const recordId = toDigits(source.recordId ?? source.record_id ?? source.id);

  if (!playerId) return '';
  if (!recordId) return playerId;

  const playerIdSuffix = right(playerId, 4);
  const recordIdSuffix = right(recordId, 3);
  if (playerIdSuffix.length !== 4 || recordIdSuffix.length !== 3) return playerId;

  const namePart = slugifyPlayerName(source.name);
  const ovrPart = String(Math.max(0, toInteger(source.ovr, 0)));
  return `${namePart}-${ovrPart}-${playerIdSuffix}${recordIdSuffix}`;
}

export function buildPlayerPath(playerLike) {
  const slug = buildPlayerSlug(playerLike);
  if (!slug) return '/players';
  return `/player/${encodeURIComponent(slug)}`;
}

export function parsePlayerSlug(slugValue) {
  const decoded = (() => {
    const raw = toText(slugValue);
    if (!raw) return '';
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();

  if (!decoded) return null;

  const legacyDigits = toDigits(decoded);
  if (legacyDigits && /^[0-9]+$/.test(decoded)) {
    return {
      slug: decoded,
      nameSlug: '',
      ovr: null,
      playerId: legacyDigits,
      playerIdSuffix: right(legacyDigits, 4),
      recordIdSuffix: right(legacyDigits, 3),
      isLegacyId: true
    };
  }

  const match = decoded.match(/^([a-z0-9]+(?:-[a-z0-9]+)*)-(\d+)-(\d{7})$/i);
  if (!match) return null;

  const [, nameSlugRaw, ovrRaw, suffixRaw] = match;
  return {
    slug: decoded,
    nameSlug: toText(nameSlugRaw).toLowerCase(),
    ovr: toInteger(ovrRaw, 0),
    playerId: '',
    playerIdSuffix: suffixRaw.slice(0, 4),
    recordIdSuffix: suffixRaw.slice(4),
    isLegacyId: false
  };
}

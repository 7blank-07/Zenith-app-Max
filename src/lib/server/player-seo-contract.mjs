const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';
const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

const ATTRIBUTE_FIELD_GROUPS = Object.freeze([
  {
    key: 'core',
    title: 'Core Ratings',
    rows: [
      { key: 'pace', label: 'Pace' },
      { key: 'shooting', label: 'Shooting' },
      { key: 'passing', label: 'Passing' },
      { key: 'dribbling', label: 'Dribbling' },
      { key: 'defending', label: 'Defending' },
      { key: 'physical', label: 'Physical' }
    ]
  },
  {
    key: 'paceShooting',
    title: 'Pace & Shooting Breakdown',
    rows: [
      { key: 'acceleration', label: 'Acceleration' },
      { key: 'sprintSpeed', label: 'Sprint Speed' },
      { key: 'finishing', label: 'Finishing' },
      { key: 'shotPower', label: 'Shot Power' },
      { key: 'longShot', label: 'Long Shot' },
      { key: 'positioning', label: 'Positioning' },
      { key: 'volley', label: 'Volley' },
      { key: 'penalties', label: 'Penalties' }
    ]
  },
  {
    key: 'playmaking',
    title: 'Playmaking Breakdown',
    rows: [
      { key: 'shortPassing', label: 'Short Passing' },
      { key: 'longPassing', label: 'Long Passing' },
      { key: 'vision', label: 'Vision' },
      { key: 'crossing', label: 'Crossing' },
      { key: 'curve', label: 'Curve' },
      { key: 'freeKick', label: 'Free Kick' }
    ]
  },
  {
    key: 'ballControl',
    title: 'Ball Control Breakdown',
    rows: [
      { key: 'agility', label: 'Agility' },
      { key: 'balance', label: 'Balance' },
      { key: 'reactions', label: 'Reactions' },
      { key: 'ballControl', label: 'Ball Control' }
    ]
  },
  {
    key: 'defensePhysical',
    title: 'Defense & Physical Breakdown',
    rows: [
      { key: 'marking', label: 'Marking' },
      { key: 'standingTackle', label: 'Standing Tackle' },
      { key: 'slidingTackle', label: 'Sliding Tackle' },
      { key: 'awareness', label: 'Defensive Awareness' },
      { key: 'heading', label: 'Heading' },
      { key: 'strength', label: 'Strength' },
      { key: 'aggression', label: 'Aggression' },
      { key: 'jumping', label: 'Jumping' },
      { key: 'stamina', label: 'Stamina' }
    ]
  }
]);

export const PLAYER_PAGE_REVALIDATE_SECONDS = 60 * 60 * 24 * 50;

export const PLAYER_STABLE_RECORD_FIELDS = Object.freeze([
  'playerId',
  'name',
  'ovr',
  'position',
  'alternatePosition',
  'nation',
  'club',
  'league',
  'image',
  'cardBackground',
  'playerImage',
  'nationFlag',
  'clubFlag',
  'leagueImage',
  'colorRating',
  'colorPosition',
  'colorName',
  'summary',
  'rank',
  'isUntradable',
  'skillMoves',
  'weakFoot',
  'strongFoot',
  'strongFootSide',
  'workRateAttack',
  'workRateDefense',
  'heightCm',
  'weightKg',
  'traits',
  'skills',
  'attributes'
]);

export const PLAYER_SEO_FIELDS = Object.freeze([
  'title',
  'description',
  'canonical',
  'canonicalPath',
  'openGraph',
  'jsonLd'
]);

export const PLAYER_ATTRIBUTE_SECTION_DEFINITIONS = Object.freeze(ATTRIBUTE_FIELD_GROUPS);

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
  return String(value).trim();
}

function toInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function toNullableInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
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

function normalizeDelimitedList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => toText(entry)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
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

function normalizeApiListPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of ['players', 'data', 'results', 'items']) {
    if (payload[key]) return normalizeApiListPayload(payload[key]);
  }

  return [];
}

function extractAttributes(source) {
  return {
    pace: toNullableInteger(source.pace),
    shooting: toNullableInteger(source.shooting),
    passing: toNullableInteger(source.passing),
    dribbling: toNullableInteger(source.dribbling),
    defending: toNullableInteger(source.defending),
    physical: toNullableInteger(source.physical),
    acceleration: toNullableInteger(source.acceleration),
    sprintSpeed: toNullableInteger(firstDefined([source.sprint_speed, source.sprintSpeed], null)),
    finishing: toNullableInteger(source.finishing),
    shotPower: toNullableInteger(firstDefined([source.shot_power, source.shotPower], null)),
    longShot: toNullableInteger(firstDefined([source.long_shot, source.longShot], null)),
    positioning: toNullableInteger(source.positioning),
    volley: toNullableInteger(source.volley),
    penalties: toNullableInteger(source.penalties),
    shortPassing: toNullableInteger(firstDefined([source.short_passing, source.shortPassing], null)),
    longPassing: toNullableInteger(firstDefined([source.long_passing, source.longPassing], null)),
    vision: toNullableInteger(source.vision),
    crossing: toNullableInteger(source.crossing),
    curve: toNullableInteger(source.curve),
    freeKick: toNullableInteger(firstDefined([source.free_kick, source.freeKick], null)),
    agility: toNullableInteger(source.agility),
    balance: toNullableInteger(source.balance),
    reactions: toNullableInteger(source.reactions),
    ballControl: toNullableInteger(firstDefined([source.ball_control, source.ballControl], null)),
    marking: toNullableInteger(source.marking),
    standingTackle: toNullableInteger(firstDefined([source.standing_tackle, source.standingTackle], null)),
    slidingTackle: toNullableInteger(firstDefined([source.sliding_tackle, source.slidingTackle], null)),
    awareness: toNullableInteger(source.awareness),
    heading: toNullableInteger(source.heading),
    strength: toNullableInteger(source.strength),
    aggression: toNullableInteger(source.aggression),
    jumping: toNullableInteger(source.jumping),
    stamina: toNullableInteger(firstDefined([source.stamina_stat, source.stamina], null))
  };
}

function summarizeWorkRates(player) {
  const attack = toText(player.workRateAttack, '');
  const defense = toText(player.workRateDefense, '');
  if (!attack && !defense) return 'Unknown work rates';
  if (!attack) return `Defensive work rate: ${defense}`;
  if (!defense) return `Attacking work rate: ${attack}`;
  return `${attack} attack / ${defense} defense work rates`;
}

async function fetchApiJson(endpoint, options = {}) {
  const timeoutMs = options.timeoutMs ?? 10000;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required for server data loading');
  }

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
    throw new Error(`Request failed (${response.status}): ${details || response.statusText}`);
  }

  return response.json();
}

async function fetchPlayersList(filters, options = {}) {
  const baseUrl = (options.baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const rank = options.rank ?? 0;
  const limit = options.limit ?? 24;
  const query = new URLSearchParams({
    limit: String(limit),
    rank: String(rank),
    sort_by: 'ovr',
    order: 'desc'
  });

  if (filters.position) query.set('position', filters.position);
  if (filters.nation) query.set('nation', filters.nation);

  const endpoint = `${baseUrl}/players?${query.toString()}`;
  const payload = await fetchApiJson(endpoint, options);
  const rows = normalizeApiListPayload(payload);
  return rows.map((row) => normalizePlayerStableRecord(row, row?.player_id || row?.id));
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
  const alternatePosition = toText(firstDefined([source.alternate_position, source.secondary_position], ''), '');
  const nation = toText(firstDefined([source.nation_region, source.nation, source.country], ''), '');
  const club = toText(firstDefined([source.team, source.club], ''), '');
  const league = toText(firstDefined([source.league], ''), '');
  const image = toText(firstDefined([source.image, source.image_url, source.card_image, source.player_image], ''), '');
  const cardBackground = toText(firstDefined([source.card_background, source.cardbackground], ''), '');
  const playerImage = toText(firstDefined([source.player_image, source.playerimage, source.image, source.image_url], ''), '');
  const nationFlag = toText(firstDefined([source.nation_flag], ''), '');
  const clubFlag = toText(firstDefined([source.club_flag], ''), '');
  const leagueImage = toText(firstDefined([source.league_image], ''), '');
  const colorRating = toText(firstDefined([source.color_rating, source.colorrating], ''), '');
  const colorPosition = toText(firstDefined([source.color_position, source.colorposition], ''), '');
  const colorName = toText(firstDefined([source.color_name, source.colorname], ''), '');
  const summary = sanitizeSummary(firstDefined([source.summary, source.description, source.bio], ''));
  const rank = toInteger(firstDefined([source.rank], 0), 0);
  const isUntradable = toBoolean(firstDefined([source.is_untradable, source.untradable], false));
  const skillMoves = toInteger(firstDefined([source.skill_moves_stars, source.skill_moves], 0), 0);
  const weakFoot = toInteger(firstDefined([source.weak_foot_stars, source.weak_foot], 0), 0);
  const strongFoot = toInteger(firstDefined([source.strong_foot_stars], 0), 0);
  const strongFootSide = toText(firstDefined([source.strong_foot_side], ''), '');
  const workRateAttack = toText(firstDefined([source.work_rate_attack], ''), '');
  const workRateDefense = toText(firstDefined([source.work_rate_defense], ''), '');
  const heightCm = toNullableInteger(firstDefined([source.height_cm], null));
  const weightKg = toNullableInteger(firstDefined([source.weight_kg], null));
  const traitImages = normalizeDelimitedList(firstDefined([source.traits], []));
  const skillImages = normalizeDelimitedList(firstDefined([source.skills], []));
  const traits = normalizeDelimitedList(firstDefined([source.traits_name], []));
  const skills = normalizeDelimitedList(firstDefined([source.skills_name], []));
  const price = toNullableInteger(firstDefined([source.price, source.latest_price, source.market_price], null));
  const attributes = extractAttributes(source);

  return {
    playerId,
    name,
    ovr,
    position,
    alternatePosition,
    nation,
    club,
    league,
    image,
    cardBackground,
    playerImage,
    nationFlag,
    clubFlag,
    leagueImage,
    colorRating,
    colorPosition,
    colorName,
    summary,
    rank,
    isUntradable,
    skillMoves,
    weakFoot,
    strongFoot,
    strongFootSide,
    workRateAttack,
    workRateDefense,
    heightCm,
    weightKg,
    traits: traits.length ? traits : traitImages,
    skills: skills.length ? skills : skillImages,
    traitImages,
    skillImages,
    price,
    attributes
  };
}

export function buildPlayerAttributeSections(playerRecord) {
  const player = normalizePlayerStableRecord(playerRecord, playerRecord?.playerId || '');

  return ATTRIBUTE_FIELD_GROUPS
    .map((section) => ({
      key: section.key,
      title: section.title,
      rows: section.rows
        .map((row) => ({
          key: row.key,
          label: row.label,
          value: player.attributes[row.key]
        }))
        .filter((row) => row.value !== null)
    }))
    .filter((section) => section.rows.length > 0);
}

export function buildPlayerSeoDescriptionParagraphs(playerRecord) {
  const player = normalizePlayerStableRecord(playerRecord, playerRecord?.playerId || '');
  const paragraphs = [];
  const header = [
    `${player.name} is a ${player.ovr || '?'} OVR ${player.position || 'player'} card`,
    player.club ? `from ${player.club}` : '',
    player.nation ? `(${player.nation})` : ''
  ]
    .filter(Boolean)
    .join(' ');
  paragraphs.push(`${header}.`);

  const technicalSummary = [
    player.skillMoves ? `${player.skillMoves}-star skill moves` : '',
    player.weakFoot ? `${player.weakFoot}-star weak foot` : '',
    summarizeWorkRates(player)
  ]
    .filter(Boolean)
    .join(', ');
  paragraphs.push(`${technicalSummary}.`);

  const traitsSummary = player.traits.length ? player.traits.slice(0, 5).join(', ') : '';
  const skillsSummary = player.skills.length ? player.skills.slice(0, 5).join(', ') : '';
  if (traitsSummary || skillsSummary) {
    paragraphs.push(
      [
        traitsSummary ? `Traits: ${traitsSummary}` : '',
        skillsSummary ? `Skills: ${skillsSummary}` : ''
      ]
        .filter(Boolean)
        .join(' | ') + '.'
    );
  }

  return paragraphs.filter(Boolean);
}

export function buildPlayerSeoMetadata(playerRecord, options = {}) {
  const siteName = options.siteName || 'Zenith';
  const siteUrl = options.siteUrl || DEFAULT_SITE_URL;
  const player = normalizePlayerStableRecord(playerRecord, playerRecord?.playerId || '');
  const label = player.ovr > 0 ? `${player.name} (${player.ovr} OVR)` : player.name;
  const title = `${label} | ${siteName}`;
  const descriptionParagraphs = buildPlayerSeoDescriptionParagraphs(player);
  const fallbackDescription = `View ${player.name}${player.position ? ` (${player.position})` : ''} on ${siteName}.`;
  const description = player.summary || descriptionParagraphs[0] || fallbackDescription;
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
        { '@type': 'PropertyValue', name: 'Rank', value: String(player.rank) },
        { '@type': 'PropertyValue', name: 'Skill Moves', value: String(player.skillMoves || 0) },
        { '@type': 'PropertyValue', name: 'Weak Foot', value: String(player.weakFoot || 0) }
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
  const endpoint = `${baseUrl}/players/${encodeURIComponent(playerId)}?rank=${encodeURIComponent(rank)}`;
  const payload = await fetchApiJson(endpoint, options);
  const normalizedPayload = normalizeApiPayload(payload);
  return normalizePlayerStableRecord(normalizedPayload, playerId);
}

export async function fetchRelatedPlayers(playerRecord, options = {}) {
  const source = normalizePlayerStableRecord(playerRecord, playerRecord?.playerId || '');
  const limit = options.limit ?? 8;
  const queryLimit = Math.max(limit * 2, 12);
  const rank = options.rank ?? source.rank ?? 0;

  const samePositionPromise = source.position
    ? fetchPlayersList({ position: source.position }, { ...options, rank, limit: queryLimit })
    : Promise.resolve([]);
  const sameNationPromise = source.nation
    ? fetchPlayersList({ nation: source.nation }, { ...options, rank, limit: queryLimit })
    : Promise.resolve([]);

  const [samePositionPlayers, sameNationPlayers] = await Promise.all([samePositionPromise, sameNationPromise]);
  const merged = new Map();

  for (const candidate of [...samePositionPlayers, ...sameNationPlayers]) {
    if (!candidate.playerId || candidate.playerId === source.playerId) continue;
    if (merged.has(candidate.playerId)) continue;
    const relationScore = (candidate.position === source.position ? 2 : 0) + (candidate.nation === source.nation ? 1 : 0);
    merged.set(candidate.playerId, { ...candidate, relationScore });
  }

  return [...merged.values()]
    .sort((a, b) => {
      if (b.relationScore !== a.relationScore) return b.relationScore - a.relationScore;
      if ((b.ovr || 0) !== (a.ovr || 0)) return (b.ovr || 0) - (a.ovr || 0);
      if (a.name !== b.name) return a.name.localeCompare(b.name);
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, limit)
    .map(({ relationScore, ...player }) => player);
}

export async function resolvePlayerSeoContract(playerId, options = {}) {
  const { metadataOptions = {}, ...fetchOptions } = options;
  const record = await fetchPlayerStableRecord(playerId, fetchOptions);
  const metadata = buildPlayerSeoMetadata(record, metadataOptions);
  return { record, metadata };
}

export async function resolvePlayerProfileContract(playerId, options = {}) {
  const { metadataOptions = {}, relatedLimit = 8, ...fetchOptions } = options;
  const record = await fetchPlayerStableRecord(playerId, fetchOptions);

  const [metadata, relatedPlayers] = await Promise.all([
    Promise.resolve(buildPlayerSeoMetadata(record, metadataOptions)),
    fetchRelatedPlayers(record, { ...fetchOptions, rank: record.rank, limit: relatedLimit })
  ]);

  const seoParagraphs = buildPlayerSeoDescriptionParagraphs(record);
  const attributeSections = buildPlayerAttributeSections(record);

  return {
    record,
    metadata,
    seoParagraphs,
    attributeSections,
    relatedPlayers
  };
}

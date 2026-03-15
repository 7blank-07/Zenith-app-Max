import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { buildPlayerSlug, parsePlayerSlug, slugifyPlayerName } from '../player-slug.mjs';

const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';
const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';
const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';
const PLAYER_SLUG_RESOLVER_CLIENT_KEY = '__zenithPlayerSlugResolverClient';
const PLAYER_SLUG_RESOLVER_POOL_KEY = '__zenithPlayerSlugResolverPool';

const { Pool } = pg;

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
  'recordId',
  'name',
  'fullName',
  'eventName',
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
  'heightFtIn',
  'heightCm',
  'weightKg',
  'dateAdded',
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

function firstNonEmptyText(source, keys) {
  for (const key of keys) {
    const value = toText(source?.[key]);
    if (value) return value;
  }
  return '';
}

export function readPlayerColorFields(source) {
  const player = source && typeof source === 'object' ? source : {};
  return {
    colorName: firstNonEmptyText(player, ['colorName', 'color_name', 'colorname']),
    colorPosition: firstNonEmptyText(player, ['colorPosition', 'color_position', 'colorposition']),
    colorRating: firstNonEmptyText(player, ['colorRating', 'color_rating', 'colorrating'])
  };
}

export function hasPlayerColorData(source) {
  const colors = readPlayerColorFields(source);
  return !!(colors.colorName || colors.colorPosition || colors.colorRating);
}

export function mergePlayerColorData(playerRecord, colorSource) {
  const sourceRecord = playerRecord && typeof playerRecord === 'object' ? playerRecord : {};
  const fallbackColors = readPlayerColorFields(colorSource);
  if (!fallbackColors.colorName && !fallbackColors.colorPosition && !fallbackColors.colorRating) {
    return sourceRecord;
  }
  const currentColors = readPlayerColorFields(sourceRecord);
  return {
    ...sourceRecord,
    colorName: currentColors.colorName || fallbackColors.colorName,
    colorPosition: currentColors.colorPosition || fallbackColors.colorPosition,
    colorRating: currentColors.colorRating || fallbackColors.colorRating
  };
}

function countPresent(values) {
  return values.reduce((count, value) => (toText(value) ? count + 1 : count), 0);
}

function playerRecordPreferenceScore(record) {
  const source = record && typeof record === 'object' ? record : {};
  const colorCompleteness = countPresent([
    source.colorName,
    source.color_name,
    source.colorname,
    source.colorPosition,
    source.color_position,
    source.colorposition,
    source.colorRating,
    source.color_rating,
    source.colorrating
  ]);
  const visualCompleteness = countPresent([
    source.cardBackground,
    source.card_background,
    source.cardbackground,
    source.playerImage,
    source.player_image,
    source.playerimage,
    source.image,
    source.nationFlag,
    source.nation_flag,
    source.clubFlag,
    source.club_flag,
    source.leagueImage,
    source.league_image
  ]);
  const profileCompleteness = countPresent([
    source.name,
    source.eventName,
    source.event_name,
    source.position,
    source.nation,
    source.club,
    source.team,
    source.league,
    source.summary
  ]);
  return colorCompleteness * 100 + visualCompleteness * 10 + profileCompleteness;
}

export function preferPlayerStableRecord(currentRecord, candidateRecord) {
  if (!currentRecord) return candidateRecord;
  if (!candidateRecord) return currentRecord;

  const currentScore = playerRecordPreferenceScore(currentRecord);
  const candidateScore = playerRecordPreferenceScore(candidateRecord);
  if (candidateScore !== currentScore) {
    return candidateScore > currentScore ? candidateRecord : currentRecord;
  }

  const currentHasRecordId = !!toText(currentRecord.recordId || currentRecord.record_id || currentRecord.id);
  const candidateHasRecordId = !!toText(candidateRecord.recordId || candidateRecord.record_id || candidateRecord.id);
  if (candidateHasRecordId !== currentHasRecordId) {
    return candidateHasRecordId ? candidateRecord : currentRecord;
  }

  return currentRecord;
}

function rightDigits(value, size) {
  return toText(value).replace(/\D+/g, '').slice(-size);
}

function toInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function toNullableInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function formatHeightFtIn(heightCmValue) {
  const normalizedHeightCm = Number(heightCmValue);
  if (!Number.isFinite(normalizedHeightCm) || normalizedHeightCm <= 0) return '';
  const totalInches = Math.round(normalizedHeightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  if (!feet && !inches) return '';
  return `${feet}'${inches}"`;
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
    diving: toNullableInteger(source.diving),
    handling: toNullableInteger(source.handling),
    reflexes: toNullableInteger(source.reflexes),
    kicking: toNullableInteger(source.kicking),
    finishing: toNullableInteger(source.finishing),
    shotPower: toNullableInteger(firstDefined([source.shot_power, source.shotPower], null)),
    longShot: toNullableInteger(firstDefined([source.long_shot, source.longShot], null)),
    positioning: toNullableInteger(source.positioning),
    gkDiving: toNullableInteger(
      firstDefined([source.gk_diving, source.gkDiving, source['gk-diving'], source.goalkeeper_diving, source.goalkeeperDiving], null)
    ),
    gkPositioning: toNullableInteger(
      firstDefined(
        [source.gk_positioning, source.gkPositioning, source['gk-positioning'], source.goalkeeper_positioning, source.goalkeeperPositioning],
        null
      )
    ),
    gkHandling: toNullableInteger(
      firstDefined([source.gk_handling, source.gkHandling, source['gk-handling'], source.goalkeeper_handling, source.goalkeeperHandling], null)
    ),
    gkReflexes: toNullableInteger(
      firstDefined([source.gk_reflexes, source.gkReflexes, source['gk-reflexes'], source.goalkeeper_reflexes, source.goalkeeperReflexes], null)
    ),
    gkKicking: toNullableInteger(
      firstDefined([source.gk_kicking, source.gkKicking, source['gk-kicking'], source.goalkeeper_kicking, source.goalkeeperKicking], null)
    ),
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

function normalizeStatLookupKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_\-\s]/g, '');
}

function resolveStatValue(source, key, fallback = Number.NaN) {
  const attributes = source?.attributes && typeof source.attributes === 'object' ? source.attributes : {};
  const keyText = String(key || '');
  const compactKey = keyText.replace(/[_\-\s]/g, '').toLowerCase();
  const camelCaseKey = keyText.replace(/[_\-\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
  const snakeCaseKey = keyText.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
  const variants = [keyText, keyText.toLowerCase(), snakeCaseKey, camelCaseKey, compactKey];

  for (const variant of variants) {
    const attributeValue = toNullableInteger(attributes?.[variant], null);
    if (attributeValue !== null) return attributeValue;

    const directValue = toNullableInteger(source?.[variant], null);
    if (directValue !== null) return directValue;
  }

  const target = normalizeStatLookupKey(keyText);
  const attrEntries = Object.entries(attributes);
  for (const [entryKey, rawValue] of attrEntries) {
    if (normalizeStatLookupKey(entryKey) !== target) continue;
    const resolved = toNullableInteger(rawValue, null);
    if (resolved !== null) return resolved;
  }

  const sourceEntries = Object.entries(source && typeof source === 'object' ? source : {});
  for (const [entryKey, rawValue] of sourceEntries) {
    if (normalizeStatLookupKey(entryKey) !== target) continue;
    const resolved = toNullableInteger(rawValue, null);
    if (resolved !== null) return resolved;
  }

  return fallback;
}

function resolveFinalStatValue(source, ...names) {
  for (const name of names) {
    const value = resolveStatValue(source, name, Number.NaN);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function roundHalfUp(value) {
  return Math.floor(value + 0.5);
}

function calculatePace(finalStat) {
  return roundHalfUp(0.49299585008602 * finalStat('acceleration') + 0.50528383239125 * finalStat('sprint_speed') - 0.13701200270336);
}

function calculateShooting(finalStat) {
  return roundHalfUp(
    0.35066661652365 * finalStat('finishing') +
      0.20012280256486 * finalStat('long_shot', 'long_shots', 'longshots') +
      0.19946956407192 * finalStat('shot_power') +
      0.15019769557113 * finalStat('positioning') +
      0.04977322484935 * finalStat('volley', 'volleys') +
      0.04962618730771 * finalStat('penalties') -
      0.46621901229077
  );
}

function calculatePassing(finalStat) {
  return roundHalfUp(
    0.30073301682698 * finalStat('short_passing') +
      0.19979430277541 * finalStat('long_passing') +
      0.24897437527999 * finalStat('vision') +
      0.15031023108744 * finalStat('crossing') +
      0.05004649307871 * finalStat('curve') +
      0.05012756181062 * finalStat('free_kick', 'fk_accuracy') -
      0.48084074176376
  );
}

function calculateDribbling(finalStat) {
  return roundHalfUp(
    0.2504432923985 * finalStat('dribbling') +
      0.10001066600723 * finalStat('balance') +
      0.25025392646353 * finalStat('agility') +
      0.15074674532686 * finalStat('reactions') +
      0.24872793523704 * finalStat('ball_control') -
      0.48832284057254
  );
}

function calculateDefending(finalStat) {
  return roundHalfUp(
    0.2502944876732 * finalStat('marking') +
      0.20107682619015 * finalStat('standing_tackle') +
      0.19924427638513 * finalStat('sliding_tackle') +
      0.19952899013166 * finalStat('awareness', 'interceptions') +
      0.15010172584902 * finalStat('heading') -
      0.49709228500345
  );
}

function calculatePhysical(finalStat) {
  return roundHalfUp(
    0.44955969076149 * finalStat('strength') +
      0.29976663944687 * finalStat('aggression') +
      0.25058507302003 * finalStat('jumping') +
      0.00061181921524 * finalStat('stamina_stat', 'stamina') -
      0.50936016832054
  );
}

function calculateGoalkeeperPhysical(finalStat) {
  return roundHalfUp(
    0.64960512284621 * finalStat('reactions') +
      0.15093757174982 * finalStat('agility') +
      0.09981357061375 * finalStat('sprint_speed') +
      0.09995255942967 * finalStat('strength') -
      0.48764601442207
  );
}

const GK_STAT_ALIASES = Object.freeze({
  diving: Object.freeze(['gk_diving', 'gk-diving', 'gkDiving', 'goalkeeper_diving', 'goalkeeper-diving', 'goalkeeperDiving']),
  handling: Object.freeze(['gk_handling', 'gk-handling', 'gkHandling', 'goalkeeper_handling', 'goalkeeper-handling', 'goalkeeperHandling']),
  kicking: Object.freeze(['gk_kicking', 'gk-kicking', 'gkKicking', 'goalkeeper_kicking', 'goalkeeper-kicking', 'goalkeeperKicking']),
  positioning: Object.freeze([
    'gk_positioning',
    'gk-positioning',
    'gkPositioning',
    'goalkeeper_positioning',
    'goalkeeper-positioning',
    'goalkeeperPositioning'
  ]),
  reflexes: Object.freeze(['gk_reflexes', 'gk-reflexes', 'gkReflexes', 'goalkeeper_reflexes', 'goalkeeper-reflexes', 'goalkeeperReflexes'])
});

function buildLegacyStyleAttributeCategories(source, position) {
  const isGoalkeeper = toText(position, '').toUpperCase() === 'GK';
  const finalStat = (...names) => resolveFinalStatValue(source, ...names);

  if (isGoalkeeper) {
    return [
      {
        key: 'diving',
        name: 'Diving',
        mainValue: finalStat(...GK_STAT_ALIASES.diving, 'diving'),
        substats: [{ label: 'GK Diving', value: finalStat(...GK_STAT_ALIASES.diving, 'diving') }]
      },
      {
        key: 'positioning',
        name: 'Positioning',
        mainValue: finalStat(...GK_STAT_ALIASES.positioning, 'positioning'),
        substats: [{ label: 'GK Positioning', value: finalStat(...GK_STAT_ALIASES.positioning, 'positioning') }]
      },
      {
        key: 'handling',
        name: 'Handling',
        mainValue: finalStat(...GK_STAT_ALIASES.handling, 'handling'),
        substats: [{ label: 'GK Handling', value: finalStat(...GK_STAT_ALIASES.handling, 'handling') }]
      },
      {
        key: 'reflexes',
        name: 'Reflexes',
        mainValue: finalStat(...GK_STAT_ALIASES.reflexes, 'reflexes'),
        substats: [
          { label: 'GK Reflexes', value: finalStat(...GK_STAT_ALIASES.reflexes, 'reflexes') },
          { label: 'Jumping', value: finalStat('jumping') }
        ]
      },
      {
        key: 'kicking',
        name: 'Kicking',
        mainValue: finalStat(...GK_STAT_ALIASES.kicking, 'kicking'),
        substats: [
          { label: 'GK Kicking', value: finalStat(...GK_STAT_ALIASES.kicking, 'kicking') },
          { label: 'Long Passing', value: finalStat('long_passing') }
        ]
      },
      {
        key: 'physical',
        name: 'Physical',
        mainValue: calculateGoalkeeperPhysical(finalStat),
        substats: [
          { label: 'Reactions', value: finalStat('reactions') },
          { label: 'Agility', value: finalStat('agility') },
          { label: 'Sprint Speed', value: finalStat('sprint_speed') },
          { label: 'Strength', value: finalStat('strength') }
        ]
      }
    ];
  }

  return [
    {
      key: 'pace',
      name: 'Pace',
      mainValue: calculatePace(finalStat),
      substats: [
        { label: 'Acceleration', value: finalStat('acceleration') },
        { label: 'Sprint Speed', value: finalStat('sprint_speed') }
      ]
    },
    {
      key: 'shooting',
      name: 'Shooting',
      mainValue: calculateShooting(finalStat),
      substats: [
        { label: 'Finishing', value: finalStat('finishing') },
        { label: 'Long Shot', value: finalStat('long_shot', 'long_shots', 'longshots') },
        { label: 'Shot Power', value: finalStat('shot_power') },
        { label: 'Positioning', value: finalStat('positioning') },
        { label: 'Volley', value: finalStat('volley', 'volleys') },
        { label: 'Penalties', value: finalStat('penalties') }
      ]
    },
    {
      key: 'passing',
      name: 'Passing',
      mainValue: calculatePassing(finalStat),
      substats: [
        { label: 'Short Passing', value: finalStat('short_passing') },
        { label: 'Long Passing', value: finalStat('long_passing') },
        { label: 'Vision', value: finalStat('vision') },
        { label: 'Crossing', value: finalStat('crossing') },
        { label: 'Curve', value: finalStat('curve') },
        { label: 'Free Kick', value: finalStat('free_kick', 'fk_accuracy') }
      ]
    },
    {
      key: 'dribbling',
      name: 'Dribbling',
      mainValue: calculateDribbling(finalStat),
      substats: [
        { label: 'Dribbling', value: finalStat('dribbling') },
        { label: 'Balance', value: finalStat('balance') },
        { label: 'Agility', value: finalStat('agility') },
        { label: 'Reactions', value: finalStat('reactions') },
        { label: 'Ball Control', value: finalStat('ball_control') }
      ]
    },
    {
      key: 'defending',
      name: 'Defending',
      mainValue: calculateDefending(finalStat),
      substats: [
        { label: 'Marking', value: finalStat('marking') },
        { label: 'Standing Tackle', value: finalStat('standing_tackle') },
        { label: 'Sliding Tackle', value: finalStat('sliding_tackle') },
        { label: 'Awareness', value: finalStat('awareness', 'interceptions') },
        { label: 'Heading', value: finalStat('heading') }
      ]
    },
    {
      key: 'physical',
      name: 'Physical',
      mainValue: calculatePhysical(finalStat),
      substats: [
        { label: 'Strength', value: finalStat('strength') },
        { label: 'Aggression', value: finalStat('aggression') },
        { label: 'Jumping', value: finalStat('jumping') },
        { label: 'Stamina', value: finalStat('stamina_stat', 'stamina') }
      ]
    }
  ];
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
  const recordId = toText(firstDefined([source.id, source.player_stats_id, source.record_id], ''), '');
  const name = toText(firstDefined([source.name, source.player_name], 'Unknown Player'));
  const fullName = toText(firstDefined([source.full_name, source.fullname, source.fullName, source.player_full_name, source.name], ''), '');
  const eventName = toText(firstDefined([source.event_name, source.event, source.program_name, source.eventName], ''), '');
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
  const workRateAttack = toText(
    firstDefined(
      [
        source.work_rate_attack,
        source.work_rate_attacking,
        source.attack_work_rate,
        source.attacking_work_rate,
        source.attackingworkrate,
        source.workrate_attack,
        source.workrateattacking,
        source.workrateattack,
        source.offensive_work_rate,
        source.offensiveworkrate,
        source.attackworkrate
      ],
      ''
    ),
    ''
  );
  const workRateDefense = toText(
    firstDefined(
      [
        source.work_rate_defense,
        source.work_rate_defensive,
        source.defense_work_rate,
        source.defensive_work_rate,
        source.defensiveworkrate,
        source.workrate_defense,
        source.workratedefensive,
        source.workratedefense,
        source.defensive_workrate,
        source.defendworkrate
      ],
      ''
    ),
    ''
  );
  const heightCm = toNullableInteger(firstDefined([source.height_cm, source.heightCm], null));
  const heightFtIn = toText(
    firstDefined([source.height_ft_in, source.height_ftin, source.height_feet_inches, source.heightFtIn], ''),
    ''
  );
  const weightKg = toNullableInteger(firstDefined([source.weight_kg], null));
  const dateAdded = toText(firstDefined([source.date_added, source.created_at, source.added_at, source.dateAdded], ''), '');
  const traitImages = normalizeDelimitedList(firstDefined([source.traits], []));
  const skillImages = normalizeDelimitedList(firstDefined([source.skills], []));
  const traits = normalizeDelimitedList(firstDefined([source.traits_name], []));
  const skills = normalizeDelimitedList(firstDefined([source.skills_name], []));
  const price = toNullableInteger(firstDefined([source.price, source.latest_price, source.market_price], null));
  const attributes = extractAttributes(source);

  return {
    playerId,
    recordId,
    name,
    fullName: fullName || name,
    eventName,
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
    heightFtIn: heightFtIn || formatHeightFtIn(heightCm),
    heightCm,
    weightKg,
    dateAdded,
    traits: traits.length ? traits : traitImages,
    skills: skills.length ? skills : skillImages,
    traitImages,
    skillImages,
    price,
    attributes
  };
}

export function buildPlayerAttributeSections(playerRecord) {
  const source = playerRecord && typeof playerRecord === 'object' ? playerRecord : {};
  const playerId = source?.playerId || source?.player_id || source?.id || '';
  const player = normalizePlayerStableRecord(source, playerId);
  const mergedAttributes = {
    ...(player?.attributes && typeof player.attributes === 'object' ? player.attributes : {}),
    ...(source?.attributes && typeof source.attributes === 'object' ? source.attributes : {})
  };
  const statSource = { ...source, attributes: mergedAttributes };
  const sections = buildLegacyStyleAttributeCategories(statSource, player.position || source.position);

  return sections.map((section) => ({
    key: section.key,
    title: section.name,
    mainValue: section.mainValue,
    rows: section.substats.map((row, index) => ({
      key: `${section.key}-${index}`,
      label: row.label,
      value: row.value
    }))
  }));
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
  const canonicalSlug = buildPlayerSlug(player);
  const canonicalPath = `/player/${encodeURIComponent(canonicalSlug || player.playerId)}`;
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
  const record = normalizePlayerStableRecord(normalizedPayload, playerId);
  if (hasPlayerColorData(record) || rank !== 0 || options.colorFallbackRanks === 0) {
    return record;
  }

  const maxFallbackRank = Number.isFinite(Number(options.colorFallbackRanks))
    ? Math.max(1, Math.floor(Number(options.colorFallbackRanks)))
    : 5;

  for (let fallbackRank = 1; fallbackRank <= maxFallbackRank; fallbackRank += 1) {
    try {
      const fallbackEndpoint = `${baseUrl}/players/${encodeURIComponent(playerId)}?rank=${encodeURIComponent(fallbackRank)}`;
      const fallbackPayload = await fetchApiJson(fallbackEndpoint, options);
      const normalizedFallbackPayload = normalizeApiPayload(fallbackPayload);
      const fallbackRecord = normalizePlayerStableRecord(normalizedFallbackPayload, playerId);
      if (!hasPlayerColorData(fallbackRecord)) continue;
      return mergePlayerColorData(record, fallbackRecord);
    } catch (error) {
      console.warn('[player-seo-contract] Failed color fallback rank fetch:', {
        playerId: String(playerId),
        fallbackRank,
        reason: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return record;
}

function getPlayerSlugResolverClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase configuration is required for player slug resolution');
  }

  if (!globalThis[PLAYER_SLUG_RESOLVER_CLIENT_KEY]) {
    globalThis[PLAYER_SLUG_RESOLVER_CLIENT_KEY] = createClient(url, key, {
      auth: { persistSession: false }
    });
  }

  return globalThis[PLAYER_SLUG_RESOLVER_CLIENT_KEY];
}

function getPlayerSlugResolverPool() {
  const connectionString = toText(process.env.DATABASE_URL);
  if (!connectionString) return null;

  if (!globalThis[PLAYER_SLUG_RESOLVER_POOL_KEY]) {
    globalThis[PLAYER_SLUG_RESOLVER_POOL_KEY] = new Pool({
      connectionString,
      max: 4,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000
    });
  }

  return globalThis[PLAYER_SLUG_RESOLVER_POOL_KEY];
}

async function queryPlayerSlugCandidates(parsedSlug) {
  const pool = getPlayerSlugResolverPool();
  if (!pool) return null;

  const query = await pool.query(
    `
      SELECT
        player_id::text AS player_id,
        id::text AS id,
        name,
        ovr
      FROM player_stats
      WHERE RIGHT(player_id::text, 4) = $1
        AND RIGHT(id::text, 3) = $2
      LIMIT 20
    `,
    [parsedSlug.playerIdSuffix, parsedSlug.recordIdSuffix]
  );

  return Array.isArray(query.rows) ? query.rows : [];
}

function resolveBestPlayerSlugMatch(rows, parsedSlug) {
  const normalizedRows = rows.map((row) => ({
    playerId: toText(row?.player_id),
    recordId: toText(row?.id),
    name: toText(row?.name),
    ovr: toInteger(row?.ovr, 0)
  }));

  const strictMatch = normalizedRows.find(
    (row) => slugifyPlayerName(row.name) === parsedSlug.nameSlug && row.ovr === parsedSlug.ovr
  );
  if (strictMatch) return strictMatch;

  const ovrMatch = normalizedRows.find((row) => row.ovr === parsedSlug.ovr);
  if (ovrMatch) return ovrMatch;

  return normalizedRows[0] || null;
}

export async function resolvePlayerIdentifiersFromSlug(slugValue) {
  const parsedSlug = parsePlayerSlug(slugValue);
  if (!parsedSlug) {
    throw new Error('Invalid player slug');
  }

  if (parsedSlug.isLegacyId) {
    return {
      playerId: parsedSlug.playerId,
      recordId: ''
    };
  }

  let sourceRows = null;
  try {
    sourceRows = await queryPlayerSlugCandidates(parsedSlug);
  } catch (error) {
    console.warn('[player-slug] SQL lookup unavailable; falling back to Supabase REST lookup', {
      code: error?.code || null,
      message: error instanceof Error ? error.message : String(error)
    });
  }

  if (!sourceRows) {
    const client = getPlayerSlugResolverClient();
    const lookup = await client
      .from('player_stats')
      .select('player_id, id, name, ovr')
      .like('player_id', `%${parsedSlug.playerIdSuffix}`)
      .like('id', `%${parsedSlug.recordIdSuffix}`)
      .limit(20);

    if (lookup.error) {
      throw new Error(`Player slug lookup failed: ${lookup.error.message}`);
    }

    sourceRows = lookup.data || [];
  }

  const candidates = sourceRows.filter(
    (row) => rightDigits(row?.player_id, 4) === parsedSlug.playerIdSuffix && rightDigits(row?.id, 3) === parsedSlug.recordIdSuffix
  );
  if (!candidates.length) {
    throw new Error('Player slug could not be resolved');
  }

  const resolved = resolveBestPlayerSlugMatch(candidates, parsedSlug);
  if (!resolved?.playerId) {
    throw new Error('Player slug could not be resolved');
  }

  return {
    playerId: resolved.playerId,
    recordId: resolved.recordId
  };
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

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeSearchText } from './search-normalization';

const TOOL_ALIASES = Object.freeze({
  squadbuilder: 'squadbuilder',
  'squad-builder': 'squadbuilder',
  compare: 'compare',
  shardcalculator: 'shardcalculator',
  'shard-calculator': 'shardcalculator',
  profit: 'shardcalculator',
  'profit-calculator': 'shardcalculator'
});

const SHARD_COSTS = Object.freeze({
  105: 5,
  106: 10,
  107: 10,
  108: 10,
  109: 30,
  110: 60,
  111: 120,
  112: 180,
  113: 250
});

const SHARD_OVRS = Object.freeze([105, 106, 107, 108, 109, 110, 111, 112, 113]);

const SQUAD_FORMATIONS = Object.freeze({
  '4-3-3': [
    { id: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'LB', label: 'LB', x: 16, y: 70 },
    { id: 'LCB', label: 'CB', x: 36, y: 74 },
    { id: 'RCB', label: 'CB', x: 64, y: 74 },
    { id: 'RB', label: 'RB', x: 84, y: 70 },
    { id: 'LCM', label: 'CM', x: 34, y: 52 },
    { id: 'CM', label: 'CM', x: 50, y: 48 },
    { id: 'RCM', label: 'CM', x: 66, y: 52 },
    { id: 'LW', label: 'LW', x: 22, y: 28 },
    { id: 'ST', label: 'ST', x: 50, y: 20 },
    { id: 'RW', label: 'RW', x: 78, y: 28 }
  ],
  '4-4-2': [
    { id: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'LB', label: 'LB', x: 16, y: 70 },
    { id: 'LCB', label: 'CB', x: 36, y: 74 },
    { id: 'RCB', label: 'CB', x: 64, y: 74 },
    { id: 'RB', label: 'RB', x: 84, y: 70 },
    { id: 'LM', label: 'LM', x: 18, y: 48 },
    { id: 'LCM', label: 'CM', x: 40, y: 52 },
    { id: 'RCM', label: 'CM', x: 60, y: 52 },
    { id: 'RM', label: 'RM', x: 82, y: 48 },
    { id: 'LST', label: 'ST', x: 42, y: 24 },
    { id: 'RST', label: 'ST', x: 58, y: 24 }
  ],
  '3-5-2': [
    { id: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'LCB', label: 'CB', x: 30, y: 72 },
    { id: 'CB', label: 'CB', x: 50, y: 76 },
    { id: 'RCB', label: 'CB', x: 70, y: 72 },
    { id: 'LM', label: 'LM', x: 14, y: 52 },
    { id: 'LCM', label: 'CM', x: 36, y: 56 },
    { id: 'CAM', label: 'CAM', x: 50, y: 46 },
    { id: 'RCM', label: 'CM', x: 64, y: 56 },
    { id: 'RM', label: 'RM', x: 86, y: 52 },
    { id: 'LST', label: 'ST', x: 42, y: 24 },
    { id: 'RST', label: 'ST', x: 58, y: 24 }
  ],
  '4-2-3-1': [
    { id: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'LB', label: 'LB', x: 16, y: 70 },
    { id: 'LCB', label: 'CB', x: 36, y: 74 },
    { id: 'RCB', label: 'CB', x: 64, y: 74 },
    { id: 'RB', label: 'RB', x: 84, y: 70 },
    { id: 'LCDM', label: 'CDM', x: 42, y: 58 },
    { id: 'RCDM', label: 'CDM', x: 58, y: 58 },
    { id: 'LAM', label: 'CAM', x: 25, y: 40 },
    { id: 'CAM', label: 'CAM', x: 50, y: 36 },
    { id: 'RAM', label: 'CAM', x: 75, y: 40 },
    { id: 'ST', label: 'ST', x: 50, y: 20 }
  ],
  '4-5-1': [
    { id: 'GK', label: 'GK', x: 52, y: 86 },
    { id: 'LB', label: 'LB', x: 14, y: 69 },
    { id: 'LCB', label: 'CB', x: 36, y: 73 },
    { id: 'RCB', label: 'CB', x: 68, y: 73 },
    { id: 'RB', label: 'RB', x: 90, y: 69 },
    { id: 'LM', label: 'LM', x: 17, y: 49 },
    { id: 'LAM', label: 'CAM', x: 34, y: 39 },
    { id: 'CM', label: 'CM', x: 52, y: 53 },
    { id: 'RAM', label: 'CAM', x: 70, y: 39 },
    { id: 'RM', label: 'RM', x: 87, y: 49 },
    { id: 'ST', label: 'ST', x: 52, y: 39 }
  ],
  '4-5-1-FLAT': [
    { id: 'GK', label: 'GK', x: 51, y: 85 },
    { id: 'LB', label: 'LB', x: 13, y: 69 },
    { id: 'LCB', label: 'CB', x: 33, y: 71 },
    { id: 'RCB', label: 'CB', x: 69, y: 71 },
    { id: 'RB', label: 'RB', x: 89, y: 69 },
    { id: 'LM', label: 'LM', x: 16, y: 47 },
    { id: 'LCM', label: 'CM', x: 35, y: 49 },
    { id: 'CM', label: 'CM', x: 51, y: 51 },
    { id: 'RCM', label: 'CM', x: 67, y: 49 },
    { id: 'RM', label: 'RM', x: 86, y: 47 },
    { id: 'ST', label: 'ST', x: 51, y: 23 }
  ],
  '5-2-1-2': [
    { id: 'GK', label: 'GK', x: 52, y: 86 },
    { id: 'LWB', label: 'LWB', x: 16, y: 69 },
    { id: 'LCB', label: 'CB', x: 36, y: 73 },
    { id: 'CB', label: 'CB', x: 52, y: 73 },
    { id: 'RCB', label: 'CB', x: 68, y: 73 },
    { id: 'RWB', label: 'RWB', x: 88, y: 69 },
    { id: 'LCM', label: 'CM', x: 34, y: 51 },
    { id: 'RCM', label: 'CM', x: 70, y: 51 },
    { id: 'CAM', label: 'CAM', x: 52, y: 35 },
    { id: 'LS', label: 'ST', x: 42, y: 19 },
    { id: 'RS', label: 'ST', x: 62, y: 19 }
  ],
  '5-2-2-1': [
    { id: 'GK', label: 'GK', x: 52, y: 85 },
    { id: 'LWB', label: 'LWB', x: 13, y: 65 },
    { id: 'LCB', label: 'CB', x: 32, y: 71 },
    { id: 'CB', label: 'CB', x: 52, y: 71 },
    { id: 'RCB', label: 'CB', x: 72, y: 71 },
    { id: 'RWB', label: 'RWB', x: 92, y: 65 },
    { id: 'LCM', label: 'CM', x: 40, y: 49 },
    { id: 'RCM', label: 'CM', x: 64, y: 49 },
    { id: 'LW', label: 'LW', x: 32, y: 29 },
    { id: 'RW', label: 'RW', x: 72, y: 29 },
    { id: 'ST', label: 'ST', x: 52, y: 19 }
  ],
  '5-3-2': [
    { id: 'GK', label: 'GK', x: 52, y: 87 },
    { id: 'LWB', label: 'LWB', x: 14, y: 65 },
    { id: 'LCB', label: 'CB', x: 36, y: 69 },
    { id: 'CB', label: 'CB', x: 52, y: 69 },
    { id: 'RCB', label: 'CB', x: 68, y: 69 },
    { id: 'RWB', label: 'RWB', x: 90, y: 65 },
    { id: 'LCM', label: 'CM', x: 26, y: 45 },
    { id: 'CM', label: 'CM', x: 52, y: 45 },
    { id: 'RCM', label: 'CM', x: 78, y: 45 },
    { id: 'LS', label: 'ST', x: 40, y: 21 },
    { id: 'RS', label: 'ST', x: 64, y: 21 }
  ],
  '5-4-1': [
    { id: 'GK', label: 'GK', x: 52, y: 86 },
    { id: 'LWB', label: 'LWB', x: 12, y: 64 },
    { id: 'LCB', label: 'CB', x: 30, y: 70 },
    { id: 'CB', label: 'CB', x: 52, y: 72 },
    { id: 'RCB', label: 'CB', x: 74, y: 70 },
    { id: 'RWB', label: 'RWB', x: 92, y: 64 },
    { id: 'LM', label: 'LM', x: 22, y: 43 },
    { id: 'LCM', label: 'CM', x: 40, y: 50 },
    { id: 'RCM', label: 'CM', x: 64, y: 50 },
    { id: 'RM', label: 'RM', x: 82, y: 43 },
    { id: 'ST', label: 'ST', x: 52, y: 21 }
  ],
  '4-4-1-1-FLAT': [
    { id: 'GK', label: 'GK', x: 52, y: 85 },
    { id: 'LB', label: 'LB', x: 16, y: 67 },
    { id: 'LCB', label: 'CB', x: 37, y: 71 },
    { id: 'RCB', label: 'CB', x: 67, y: 71 },
    { id: 'RB', label: 'RB', x: 88, y: 67 },
    { id: 'LM', label: 'LM', x: 22, y: 39 },
    { id: 'LCM', label: 'CM', x: 40, y: 51 },
    { id: 'RCM', label: 'CM', x: 62, y: 49 },
    { id: 'RM', label: 'RM', x: 82, y: 39 },
    { id: 'CF', label: 'CF', x: 52, y: 39 },
    { id: 'ST', label: 'ST', x: 52, y: 23 }
  ]
});

const BASIC_COMPARE_STATS = Object.freeze([
  { key: 'pace', label: 'Pace' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'defending', label: 'Defending' },
  { key: 'physical', label: 'Physical' }
]);

const ADVANCED_COMPARE_STATS = Object.freeze([
  { key: 'acceleration', label: 'Acceleration' },
  { key: 'sprintSpeed', label: 'Sprint Speed' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'shotPower', label: 'Shot Power' },
  { key: 'longShot', label: 'Long Shot' },
  { key: 'vision', label: 'Vision' },
  { key: 'crossing', label: 'Crossing' },
  { key: 'shortPassing', label: 'Short Passing' },
  { key: 'longPassing', label: 'Long Passing' },
  { key: 'agility', label: 'Agility' },
  { key: 'balance', label: 'Balance' },
  { key: 'reactions', label: 'Reactions' },
  { key: 'ballControl', label: 'Ball Control' },
  { key: 'marking', label: 'Marking' },
  { key: 'standingTackle', label: 'Standing Tackle' },
  { key: 'slidingTackle', label: 'Sliding Tackle' },
  { key: 'heading', label: 'Heading' },
  { key: 'strength', label: 'Strength' },
  { key: 'stamina', label: 'Stamina' }
]);

const COMPARE_SKILL_OPTIONS = Object.freeze(['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical']);

const FIELD_THEMES = Object.freeze({
  'stadium-blue': {
    id: 'stadium-blue',
    name: 'FC Stadium',
    background: 'url(/assets/images/background/squad_builder_1.webp) center/cover no-repeat',
    className: ''
  },
  'camp-nou': {
    id: 'camp-nou',
    name: 'Camp Nou',
    background: 'url(/assets/images/background/squad_builder_2.webp) center/cover no-repeat',
    className: ''
  },
  'old-trafford': {
    id: 'old-trafford',
    name: 'Old Trafford',
    background: 'url(/assets/images/background/squad_builder_3.webp) center/cover no-repeat',
    className: 'theme-old-trafford'
  },
  'santiago-bernabeu': {
    id: 'santiago-bernabeu',
    name: 'Santiago Bernabeu',
    background: 'url(/assets/images/background/squad_builder_4.webp) center/cover no-repeat',
    className: 'theme-santiago-bernabeu'
  },
  anfield: {
    id: 'anfield',
    name: 'Anfield',
    background: 'url(/assets/images/background/squad_builder_5.webp) center/cover no-repeat',
    className: 'theme-anfield'
  }
});

const POSITION_PENALTIES = Object.freeze({
  GK: Object.freeze({
    gk: 0,
    lb: -18,
    cb: -18,
    rb: -18,
    lwb: -18,
    rwb: -18,
    cdm: -18,
    cm: -18,
    cam: -18,
    lm: -18,
    rm: -18,
    lw: -18,
    rw: -18,
    cf: -18,
    st: -18
  }),
  ST: Object.freeze({
    st: 0,
    rw: -6,
    lw: -6,
    cf: 0,
    cm: -18,
    rm: -18,
    lm: -18,
    cdm: -18,
    cb: -18,
    lb: -18,
    rb: -18,
    lwb: -18,
    rwb: -18,
    cam: -9,
    gk: -18
  }),
  LW: Object.freeze({
    lw: 0,
    st: -6,
    cf: -6,
    lwb: -6,
    rw: -4,
    lm: -4,
    rm: -18,
    cm: -18,
    cdm: -18,
    cb: -18,
    rb: -18,
    rwb: -18,
    cam: -18,
    lb: -9,
    gk: -18
  }),
  RW: Object.freeze({
    rw: 0,
    lw: -4,
    rm: -4,
    st: -6,
    cf: -6,
    rwb: -6,
    lm: -18,
    cm: -18,
    cdm: -18,
    lb: -18,
    cb: -18,
    lwb: -18,
    cam: -18,
    rb: -9,
    gk: -18
  }),
  CAM: Object.freeze({
    cam: 0,
    cf: 0,
    cm: -4,
    lm: -6,
    rm: -6,
    st: -9,
    cdm: -9,
    lw: -18,
    rw: -18,
    lb: -18,
    cb: -18,
    rb: -18,
    lwb: -18,
    rwb: -18,
    gk: -18
  }),
  CM: Object.freeze({
    cm: 0,
    cdm: -4,
    cam: -4,
    lm: -4,
    rm: -4,
    cf: -9,
    lb: -9,
    cb: -9,
    rb: -9,
    lwb: -9,
    rwb: -9,
    lw: -18,
    st: -18,
    rw: -18,
    gk: -18
  }),
  CDM: Object.freeze({
    cdm: 0,
    cm: -4,
    cb: -4,
    lm: -6,
    rm: -6,
    lb: -6,
    rb: -6,
    lwb: -6,
    rwb: -6,
    cam: -9,
    lw: -18,
    st: -18,
    rw: -18,
    cf: -18,
    gk: -18
  }),
  LM: Object.freeze({
    lm: 0,
    rm: -4,
    lw: -4,
    lwb: -4,
    cdm: -6,
    lb: -6,
    cam: -6,
    cm: -6,
    cb: -9,
    rb: -9,
    rwb: -9,
    st: -18,
    rw: -18,
    cf: -18,
    gk: -18
  }),
  RM: Object.freeze({
    rm: 0,
    rw: -4,
    rwb: -4,
    cam: -5,
    cm: -5,
    cdm: -5,
    rb: -5,
    lb: -7,
    cb: -7,
    lwb: -8,
    cf: -8,
    st: -17,
    lw: -18,
    lm: -17,
    gk: -18
  }),
  LB: Object.freeze({
    lb: 0,
    lwb: 0,
    cb: -4,
    rb: -4,
    rwb: -4,
    cdm: -6,
    lm: -6,
    lw: -9,
    cm: -9,
    cam: -9,
    rm: -9,
    st: -18,
    rw: -18,
    cf: -18,
    gk: -18
  }),
  CB: Object.freeze({
    cb: 0,
    lb: -4,
    rb: -4,
    cdm: -4,
    cm: -9,
    lm: -9,
    rm: -9,
    lwb: -9,
    rwb: -9,
    lw: -18,
    st: -18,
    rw: -18,
    cam: -18,
    cf: -18,
    gk: -18
  }),
  RB: Object.freeze({
    rb: 0,
    rwb: 0,
    lb: -4,
    cb: -4,
    lwb: -4,
    cdm: -6,
    rm: -6,
    rw: -9,
    cm: -9,
    lm: -9,
    lw: -18,
    st: -18,
    cf: -18,
    cam: -18,
    gk: -18
  }),
  LWB: Object.freeze({
    lwb: 0,
    lb: 0,
    rb: -3,
    rwb: -3,
    lm: -3,
    lw: -5,
    cdm: -5,
    cm: -7,
    cb: -7,
    rm: -7,
    st: -15,
    cf: -15,
    cam: -15,
    rw: -15,
    gk: -18
  }),
  RWB: Object.freeze({
    rwb: 0,
    rb: 0,
    lb: -3,
    lwb: -3,
    rm: -5,
    cdm: -5,
    rw: -5,
    lm: -7,
    cm: -7,
    cb: -7,
    lw: -15,
    st: -15,
    cf: -15,
    cam: -15,
    gk: -18
  }),
  CF: Object.freeze({
    cf: 0,
    cam: -4,
    st: -4,
    cm: -4,
    lm: -4,
    rm: -4,
    lw: -6,
    rw: -6,
    cdm: -15,
    lb: -15,
    cb: -15,
    rb: -15,
    lwb: -15,
    rwb: -15,
    gk: -18
  })
});

const RANK_SPRITES = Object.freeze({
  1: '/assets/images/ranks/green_rank_enhanced_main.webp',
  2: '/assets/images/ranks/blue_rank_enhanced_main.webp',
  3: '/assets/images/ranks/purple_rank_enhanced_main.webp',
  4: '/assets/images/ranks/red_rank_enhanced_main.webp',
  5: '/assets/images/ranks/gold_rank_enhanced_main.webp'
});

function normalizeTool(value) {
  const normalized = String(value || '').toLowerCase().trim();
  return TOOL_ALIASES[normalized] || 'none';
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toText(value) {
  return normalizeSearchText(value);
}

function getPlayerId(player) {
  return String(player?.playerId || player?.player_id || player?.playerid || player?.id || '').trim();
}

function getPlayerType(player) {
  return player?.leagueImage ? 'normal' : 'hero';
}

function getPlayerStat(player, key) {
  const attrValue = toNumber(player?.attributes?.[key], Number.NaN);
  if (Number.isFinite(attrValue)) return attrValue;
  return toNumber(player?.[key], 0);
}

function formatCoins(value) {
  const safe = toNumber(value, 0);
  if (!safe) return '0';
  if (safe >= 1000000000) return `${(safe / 1000000000).toFixed(2)}B`;
  if (safe >= 1000000) return `${(safe / 1000000).toFixed(1)}M`;
  if (safe >= 1000) return `${(safe / 1000).toFixed(0)}K`;
  return String(Math.round(safe));
}

function getValueClass(value, min, max) {
  if (max === min) return 'neutral';
  if (value === max) return 'green';
  if (value === min) return 'red';
  return 'yellow';
}

function normalizePlayer(player, index) {
  const playerId = getPlayerId(player);
  return {
    playerId: playerId || `player-${index}`,
    name: String(player?.name || 'Unknown'),
    ovr: toNumber(player?.ovr, 0),
    position: String(player?.position || ''),
    alternatePosition: String(player?.alternatePosition || player?.alternate_position || ''),
    nation: String(player?.nation || ''),
    club: String(player?.club || ''),
    league: String(player?.league || ''),
    cardBackground: String(player?.cardBackground || ''),
    playerImage: String(player?.playerImage || ''),
    nationFlag: String(player?.nationFlag || ''),
    clubFlag: String(player?.clubFlag || ''),
    leagueImage: String(player?.leagueImage || ''),
    colorRating: String(player?.colorRating || '#FFB86B'),
    colorPosition: String(player?.colorPosition || '#FFFFFF'),
    colorName: String(player?.colorName || '#FFFFFF'),
    price: Math.max(0, toNumber(player?.price, 0)),
    isUntradable: !!player?.isUntradable,
    attributes: player?.attributes && typeof player.attributes === 'object' ? player.attributes : {}
  };
}

function parseAlternatePositions(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').toUpperCase().trim()).filter(Boolean);
  }
  return String(value || '')
    .split(/[|,/]/)
    .map((entry) => entry.toUpperCase().trim())
    .filter(Boolean);
}

function getPositionAdjustedOvr(player, slotLabel) {
  const baseOvr = toNumber(player?.ovr, 0);
  const playerPos = String(player?.position || '').toUpperCase().trim();
  const slotPosLabel = String(slotLabel || '').toUpperCase().trim();
  const slotPosKey = slotPosLabel.toLowerCase();
  if (!playerPos || !slotPosKey) return baseOvr;
  const alternatePositions = parseAlternatePositions(player?.alternatePosition);
  if (alternatePositions.includes(slotPosLabel)) return baseOvr;
  const penalty = POSITION_PENALTIES[playerPos]?.[slotPosKey] ?? -18;
  return Math.max(0, baseOvr + penalty);
}

export default function ToolsInteractions({ players = [], initialTool = '' }) {
  const normalizedPlayers = useMemo(() => players.map(normalizePlayer), [players]);
  const playersById = useMemo(() => {
    const map = new Map();
    normalizedPlayers.forEach((player) => {
      map.set(player.playerId, player);
    });
    return map;
  }, [normalizedPlayers]);

  const [activeTool, setActiveTool] = useState(() => normalizeTool(initialTool));

  const [squadName, setSquadName] = useState('My Squad');
  const [formationId, setFormationId] = useState('4-3-3');
  const [selectedSlotId, setSelectedSlotId] = useState('ST');
  const [squadSearchQuery, setSquadSearchQuery] = useState('');
  const [squadFilterOpen, setSquadFilterOpen] = useState(false);
  const [squadFilters, setSquadFilters] = useState({
    position: '',
    league: '',
    club: '',
    nation: '',
    minOvr: 0,
    maxOvr: 150,
    auctionableOnly: false
  });
  const [squadFilterDraft, setSquadFilterDraft] = useState({
    position: '',
    league: '',
    club: '',
    nation: '',
    minOvr: 0,
    maxOvr: 150,
    auctionableOnly: false
  });
  const [fieldThemeId, setFieldThemeId] = useState('camp-nou');
  const [fieldThemeDraft, setFieldThemeDraft] = useState('camp-nou');
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [starters, setStarters] = useState({});
  const [bench, setBench] = useState(Array.from({ length: 7 }, () => ''));

  const [comparePlayers, setComparePlayers] = useState([]);
  const [compareView, setCompareView] = useState('basic');
  const [compareSearchOpen, setCompareSearchOpen] = useState(false);
  const [compareSearchQuery, setCompareSearchQuery] = useState('');
  const [compareCustomizations, setCompareCustomizations] = useState({});
  const [compareConfigPlayerId, setCompareConfigPlayerId] = useState(null);
  const [compareConfigDraft, setCompareConfigDraft] = useState({
    rank: 0,
    trainingLevel: 0,
    selectedSkills: []
  });

  const [shardMode, setShardMode] = useState('counter');
  const [shardCounts, setShardCounts] = useState({
    105: 0,
    106: 0,
    107: 0,
    108: 0,
    109: 0,
    110: 0,
    111: 0,
    112: 0,
    113: 0
  });
  const [shardRequired, setShardRequired] = useState(0);
  const [shardPlayerOvr, setShardPlayerOvr] = useState(105);
  const dragPayloadRef = useRef(null);
  const [draggingKey, setDraggingKey] = useState('');
  const [dragOverSlotId, setDragOverSlotId] = useState('');
  const [dragOverBenchIndex, setDragOverBenchIndex] = useState(-1);

  const formationSlots = SQUAD_FORMATIONS[formationId] || SQUAD_FORMATIONS['4-3-3'];

  useEffect(() => {
    try {
      const savedSquad = window.localStorage.getItem('toolsSquadState');
      if (savedSquad) {
        const parsed = JSON.parse(savedSquad);
        if (parsed?.squadName) setSquadName(String(parsed.squadName));
        if (parsed?.formationId && SQUAD_FORMATIONS[parsed.formationId]) setFormationId(parsed.formationId);
        if (parsed?.starters && typeof parsed.starters === 'object') setStarters(parsed.starters);
        if (Array.isArray(parsed?.bench)) {
          setBench(parsed.bench.slice(0, 7).concat(Array.from({ length: Math.max(0, 7 - parsed.bench.length) }, () => '')));
        }
      }
    } catch (error) {
      console.error('[tools] Failed to load saved squad state:', error);
    }

    try {
      const savedShardMode = window.localStorage.getItem('shardCalcMode');
      if (savedShardMode === 'counter' || savedShardMode === 'cost') {
        setShardMode(savedShardMode);
      }
      const savedShardState = window.localStorage.getItem('shardCalcState');
      if (savedShardState) {
        const parsed = JSON.parse(savedShardState);
        if (parsed?.counterShards && typeof parsed.counterShards === 'object') {
          setShardCounts((current) => {
            const next = { ...current };
            SHARD_OVRS.forEach((ovr) => {
              next[ovr] = Math.max(0, toNumber(parsed.counterShards[ovr], 0));
            });
            return next;
          });
        }
      }
    } catch (error) {
      console.error('[tools] Failed to load saved shard state:', error);
    }

    try {
      const savedTheme = window.localStorage.getItem('selectedFieldTheme') || 'camp-nou';
      if (FIELD_THEMES[savedTheme]) {
        setFieldThemeId(savedTheme);
        setFieldThemeDraft(savedTheme);
      }
    } catch (error) {
      console.error('[tools] Failed to load saved field theme:', error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'toolsSquadState',
        JSON.stringify({
          squadName,
          formationId,
          starters,
          bench
        })
      );
    } catch (error) {
      console.error('[tools] Failed to persist squad state:', error);
    }
  }, [squadName, formationId, starters, bench]);

  useEffect(() => {
    try {
      window.localStorage.setItem('shardCalcMode', shardMode);
      window.localStorage.setItem(
        'shardCalcState',
        JSON.stringify({
          mode: shardMode,
          counterShards: shardCounts,
          shardCosts: SHARD_COSTS
        })
      );
    } catch (error) {
      console.error('[tools] Failed to persist shard state:', error);
    }
  }, [shardMode, shardCounts]);

  useEffect(() => {
    try {
      window.localStorage.setItem('selectedFieldTheme', fieldThemeId);
    } catch (error) {
      console.error('[tools] Failed to persist selected field theme:', error);
    }
  }, [fieldThemeId]);

  useEffect(() => {
    if (activeTool !== 'compare') {
      setCompareSearchOpen(false);
      setCompareSearchQuery('');
      setCompareConfigPlayerId(null);
    }
    if (activeTool !== 'squadbuilder') {
      setSquadFilterOpen(false);
      setThemeSelectorOpen(false);
    }
  }, [activeTool]);

  useEffect(() => {
    const lockBody = activeTool === 'squadbuilder' || activeTool === 'compare' || compareSearchOpen;
    if (lockBody) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTool, compareSearchOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (activeTool === 'none') {
      url.searchParams.delete('tool');
    } else if (activeTool === 'shardcalculator') {
      url.searchParams.set('tool', 'shard-calculator');
    } else {
      url.searchParams.set('tool', activeTool);
    }
    const nextPath = `${url.pathname}${url.search}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath !== currentPath) {
      window.history.replaceState(null, '', nextPath);
    }
  }, [activeTool]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (compareConfigPlayerId) {
        setCompareConfigPlayerId(null);
        return;
      }
      if (themeSelectorOpen) {
        setThemeSelectorOpen(false);
        return;
      }
      if (squadFilterOpen) {
        setSquadFilterOpen(false);
        return;
      }
      if (compareSearchOpen) {
        setCompareSearchOpen(false);
        return;
      }
      if (activeTool !== 'none') {
        setActiveTool('none');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, compareConfigPlayerId, compareSearchOpen, squadFilterOpen, themeSelectorOpen]);

  useEffect(() => {
    const availableSlots = new Set((SQUAD_FORMATIONS[formationId] || []).map((slot) => slot.id));
    setStarters((current) => {
      const next = {};
      let changed = false;
      Object.entries(current).forEach(([slotId, playerId]) => {
        if (availableSlots.has(slotId)) {
          next[slotId] = playerId;
        } else {
          changed = true;
        }
      });
      return changed ? next : current;
    });

    if (!availableSlots.has(selectedSlotId)) {
      setSelectedSlotId((SQUAD_FORMATIONS[formationId] || [])[0]?.id || 'GK');
    }
  }, [formationId, selectedSlotId]);

  const assignedPlayerIds = useMemo(() => {
    const set = new Set();
    Object.values(starters).forEach((playerId) => {
      if (playerId) set.add(playerId);
    });
    bench.forEach((playerId) => {
      if (playerId) set.add(playerId);
    });
    return set;
  }, [starters, bench]);

  const squadPlayers = useMemo(
    () =>
      [...Object.values(starters), ...bench]
        .filter(Boolean)
        .map((playerId) => playersById.get(playerId))
        .filter(Boolean),
    [bench, playersById, starters]
  );

  const starterAdjustedOvrBySlot = useMemo(() => {
    const adjustedBySlot = {};
    formationSlots.forEach((slot) => {
      const playerId = starters[slot.id];
      if (!playerId) return;
      const player = playersById.get(playerId);
      if (!player) return;
      adjustedBySlot[slot.id] = getPositionAdjustedOvr(player, slot.label);
    });
    return adjustedBySlot;
  }, [formationSlots, playersById, starters]);

  const squadOvr = useMemo(() => {
    const starterTotal = formationSlots.reduce((sum, slot) => {
      const adjustedOvr = toNumber(starterAdjustedOvrBySlot[slot.id], 0);
      return sum + adjustedOvr;
    }, 0);
    const benchPlayers = bench
      .map((playerId) => playersById.get(playerId))
      .filter(Boolean);
    const benchTotal = benchPlayers.reduce((sum, player) => sum + toNumber(player.ovr, 0), 0);
    const denominator = formationSlots.length + benchPlayers.length;
    if (!denominator || starterTotal + benchTotal <= 0) return 0;
    return Math.ceil((starterTotal + benchTotal) / denominator);
  }, [bench, formationSlots, playersById, starterAdjustedOvrBySlot]);

  const squadValue = useMemo(() => {
    if (!squadPlayers.length) return 0;
    return squadPlayers.reduce((sum, player) => {
      const marketPrice = Math.max(0, toNumber(player.price, 0));
      if (marketPrice > 0) return sum + marketPrice;
      return sum + Math.max(0, toNumber(player.ovr, 0) * 1000000);
    }, 0);
  }, [squadPlayers]);

  const squadFilterOptions = useMemo(() => {
    const uniqueSorted = (values) => [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return {
      positions: uniqueSorted(normalizedPlayers.map((player) => player.position)),
      leagues: uniqueSorted(normalizedPlayers.map((player) => player.league)),
      clubs: uniqueSorted(normalizedPlayers.map((player) => player.club)),
      nations: uniqueSorted(normalizedPlayers.map((player) => player.nation))
    };
  }, [normalizedPlayers]);

  const squadPickerPlayers = useMemo(() => {
    const query = toText(squadSearchQuery);
    return normalizedPlayers
      .filter((player) => {
        if (assignedPlayerIds.has(player.playerId)) return false;
        if (squadFilters.position && toText(player.position) !== toText(squadFilters.position)) return false;
        if (squadFilters.league && toText(player.league) !== toText(squadFilters.league)) return false;
        if (squadFilters.club && toText(player.club) !== toText(squadFilters.club)) return false;
        if (squadFilters.nation && toText(player.nation) !== toText(squadFilters.nation)) return false;
        const playerOvr = toNumber(player.ovr, 0);
        if (playerOvr < toNumber(squadFilters.minOvr, 0) || playerOvr > toNumber(squadFilters.maxOvr, 150)) return false;
        if (squadFilters.auctionableOnly && (!Number.isFinite(toNumber(player.price, Number.NaN)) || toNumber(player.price, 0) <= 0)) return false;
        if (!query) return true;
        const searchable = toText(`${player.name} ${player.position} ${player.club} ${player.league} ${player.nation}`);
        return searchable.includes(query);
      })
      .slice(0, 140);
  }, [assignedPlayerIds, normalizedPlayers, squadFilters, squadSearchQuery]);

  const comparePositionMode = useMemo(() => {
    if (!comparePlayers.length) return null;
    return comparePlayers[0].position === 'GK' ? 'gk' : 'outfield';
  }, [comparePlayers]);

  const compareStatsConfig = compareView === 'basic' ? BASIC_COMPARE_STATS : ADVANCED_COMPARE_STATS;

  const compareRows = useMemo(() => {
    return compareStatsConfig.map((stat) => {
      const values = comparePlayers.map((player) => getPlayerStat(player, stat.key));
      const max = values.length ? Math.max(...values) : 0;
      const min = values.length ? Math.min(...values) : 0;
      const classes = values.map((value) => getValueClass(value, min, max));
      return {
        key: stat.key,
        label: stat.label,
        values,
        classes
      };
    });
  }, [comparePlayers, compareStatsConfig]);

  const compareTotals = useMemo(() => {
    if (!comparePlayers.length) return [];
    const totals = comparePlayers.map((player) =>
      compareStatsConfig.reduce((sum, stat) => sum + getPlayerStat(player, stat.key), 0)
    );
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    const classes = totals.map((value) => getValueClass(value, min, max));
    return totals.map((value, index) => ({ value, className: classes[index] }));
  }, [comparePlayers, compareStatsConfig]);

  const compareSearchResults = useMemo(() => {
    const query = toText(compareSearchQuery);
    if (query.length < 2) return [];
    return normalizedPlayers
      .filter((player) => {
        if (comparePlayers.some((selected) => selected.playerId === player.playerId)) return false;
        if (comparePositionMode === 'gk' && player.position !== 'GK') return false;
        if (comparePositionMode === 'outfield' && player.position === 'GK') return false;
        const searchable = toText(`${player.name} ${player.position} ${player.club} ${player.league} ${player.nation}`);
        return searchable.includes(query);
      })
      .slice(0, 40);
  }, [comparePlayers, comparePositionMode, compareSearchQuery, normalizedPlayers]);

  const shardCountTotal = useMemo(
    () => SHARD_OVRS.reduce((sum, ovr) => sum + toNumber(shardCounts[ovr], 0) * SHARD_COSTS[ovr], 0),
    [shardCounts]
  );

  const shardPlayerTotal = useMemo(
    () => SHARD_OVRS.reduce((sum, ovr) => sum + toNumber(shardCounts[ovr], 0), 0),
    [shardCounts]
  );

  const shardPlayersNeeded = useMemo(() => {
    const shardCost = SHARD_COSTS[shardPlayerOvr] || 5;
    const required = Math.max(0, toNumber(shardRequired, 0));
    return Math.ceil(required / shardCost);
  }, [shardPlayerOvr, shardRequired]);

  const shardTotalCost = useMemo(() => shardPlayersNeeded * 1000000, [shardPlayersNeeded]);

  const assignPlayerToSelectedSlot = (playerId) => {
    if (!playerId) return;
    const slotId = selectedSlotId || formationSlots[0]?.id;
    if (!slotId) return;
    if (assignedPlayerIds.has(playerId)) return;
    setStarters((current) => ({
      ...current,
      [slotId]: playerId
    }));
  };

  const removeStarter = (slotId) => {
    setStarters((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
  };

  const removeBenchPlayer = (benchIndex) => {
    setBench((current) => {
      const next = [...current];
      next[benchIndex] = '';
      return next;
    });
  };

  const clearSquad = () => {
    setStarters({});
    setBench(Array.from({ length: 7 }, () => ''));
    setSelectedSlotId((SQUAD_FORMATIONS[formationId] || [])[0]?.id || 'GK');
  };

  const clearDragState = () => {
    dragPayloadRef.current = null;
    setDraggingKey('');
    setDragOverSlotId('');
    setDragOverBenchIndex(-1);
  };

  const movePlayer = (payload, destination) => {
    const movingPlayerId = payload?.playerId;
    if (!movingPlayerId || !destination) return;

    if (payload.source === 'slot' && destination.type === 'slot' && payload.slotId === destination.slotId) return;
    if (payload.source === 'bench' && destination.type === 'bench' && payload.benchIndex === destination.benchIndex) return;
    if (payload.source === 'picker' && assignedPlayerIds.has(movingPlayerId)) return;

    const nextStarters = { ...starters };
    const nextBench = [...bench];

    if (payload.source === 'slot' && payload.slotId) {
      if (nextStarters[payload.slotId] !== movingPlayerId) return;
      delete nextStarters[payload.slotId];
    }
    if (payload.source === 'bench' && Number.isInteger(payload.benchIndex)) {
      if (nextBench[payload.benchIndex] !== movingPlayerId) return;
      nextBench[payload.benchIndex] = '';
    }

    if (destination.type === 'slot') {
      const displaced = nextStarters[destination.slotId] || '';
      nextStarters[destination.slotId] = movingPlayerId;

      if (displaced && displaced !== movingPlayerId) {
        if (payload.source === 'slot' && payload.slotId) {
          nextStarters[payload.slotId] = displaced;
        } else if (payload.source === 'bench' && Number.isInteger(payload.benchIndex)) {
          nextBench[payload.benchIndex] = displaced;
        } else {
          const firstEmptyBench = nextBench.findIndex((entry) => !entry);
          if (firstEmptyBench >= 0) nextBench[firstEmptyBench] = displaced;
        }
      }
    }

    if (destination.type === 'bench') {
      const displaced = nextBench[destination.benchIndex] || '';
      nextBench[destination.benchIndex] = movingPlayerId;

      if (displaced && displaced !== movingPlayerId) {
        if (payload.source === 'slot' && payload.slotId) {
          nextStarters[payload.slotId] = displaced;
        } else if (payload.source === 'bench' && Number.isInteger(payload.benchIndex)) {
          nextBench[payload.benchIndex] = displaced;
        } else {
          const preferredSlot = selectedSlotId && !nextStarters[selectedSlotId] ? selectedSlotId : formationSlots.find((slot) => !nextStarters[slot.id])?.id;
          if (preferredSlot) {
            nextStarters[preferredSlot] = displaced;
          }
        }
      }
    }

    setStarters(nextStarters);
    setBench(nextBench);
  };

  const handleDragStart = (event, payload, sourceKey) => {
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', payload?.playerId || '');
    }
    dragPayloadRef.current = payload;
    setDraggingKey(sourceKey || '');
  };

  const handleDragEnd = () => {
    clearDragState();
  };

  const handleSlotDragOver = (event, slotId) => {
    if (!dragPayloadRef.current || !slotId) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    setDragOverSlotId(slotId);
    setDragOverBenchIndex(-1);
  };

  const handleBenchDragOver = (event, benchIndex) => {
    if (!dragPayloadRef.current || !Number.isInteger(benchIndex)) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    setDragOverBenchIndex(benchIndex);
    setDragOverSlotId('');
  };

  const handleSlotDragLeave = (slotId) => {
    setDragOverSlotId((current) => (current === slotId ? '' : current));
  };

  const handleBenchDragLeave = (benchIndex) => {
    setDragOverBenchIndex((current) => (current === benchIndex ? -1 : current));
  };

  const handleDropOnSlot = (event, slotId) => {
    event.preventDefault();
    const payload = dragPayloadRef.current;
    if (!slotId || !payload) {
      clearDragState();
      return;
    }
    movePlayer(payload, { type: 'slot', slotId });
    clearDragState();
  };

  const handleDropOnBench = (event, benchIndex) => {
    event.preventDefault();
    const payload = dragPayloadRef.current;
    if (!Number.isInteger(benchIndex) || !payload) {
      clearDragState();
      return;
    }
    movePlayer(payload, { type: 'bench', benchIndex });
    clearDragState();
  };

  const openSquadFilterPanel = () => {
    setSquadFilterDraft(squadFilters);
    setSquadFilterOpen(true);
  };

  const applySquadFilterPanel = () => {
    const normalizedDraft = {
      ...squadFilterDraft,
      minOvr: Math.max(0, toNumber(squadFilterDraft.minOvr, 0)),
      maxOvr: Math.max(0, toNumber(squadFilterDraft.maxOvr, 150))
    };
    if (normalizedDraft.minOvr > normalizedDraft.maxOvr) {
      normalizedDraft.maxOvr = normalizedDraft.minOvr;
    }
    setSquadFilters(normalizedDraft);
    setSquadFilterOpen(false);
  };

  const resetSquadFilterPanel = () => {
    const resetFilters = {
      position: '',
      league: '',
      club: '',
      nation: '',
      minOvr: 0,
      maxOvr: 150,
      auctionableOnly: false
    };
    setSquadFilterDraft(resetFilters);
    setSquadFilters(resetFilters);
    setSquadFilterOpen(false);
  };

  const openThemeSelector = () => {
    setFieldThemeDraft(fieldThemeId);
    setThemeSelectorOpen(true);
  };

  const applyThemeSelection = () => {
    if (FIELD_THEMES[fieldThemeDraft]) {
      setFieldThemeId(fieldThemeDraft);
    }
    setThemeSelectorOpen(false);
  };

  const openCompareSearch = () => {
    if (comparePlayers.length >= 5) return;
    setCompareSearchQuery('');
    setCompareSearchOpen(true);
  };

  const addComparePlayer = (playerId) => {
    const player = playersById.get(playerId);
    if (!player) return;
    if (comparePlayers.some((entry) => entry.playerId === player.playerId)) return;
    if (comparePlayers.length >= 5) return;

    if (comparePositionMode === 'gk' && player.position !== 'GK') return;
    if (comparePositionMode === 'outfield' && player.position === 'GK') return;

    setComparePlayers((current) => [...current, player]);
    setCompareSearchOpen(false);
    setCompareSearchQuery('');
  };

  const removeComparePlayer = (playerId) => {
    setComparePlayers((current) => current.filter((player) => player.playerId !== playerId));
    setCompareCustomizations((current) => {
      const next = { ...current };
      delete next[playerId];
      return next;
    });
    if (compareConfigPlayerId === playerId) {
      setCompareConfigPlayerId(null);
    }
  };

  const resetComparePlayers = () => {
    setComparePlayers([]);
    setCompareView('basic');
    setCompareSearchOpen(false);
    setCompareSearchQuery('');
    setCompareCustomizations({});
    setCompareConfigPlayerId(null);
  };

  const openCompareConfigModal = (playerId) => {
    if (!playerId) return;
    const existing = compareCustomizations[playerId] || {
      rank: 0,
      trainingLevel: 0,
      selectedSkills: []
    };
    setCompareConfigDraft({
      rank: toNumber(existing.rank, 0),
      trainingLevel: toNumber(existing.trainingLevel, 0),
      selectedSkills: Array.isArray(existing.selectedSkills) ? existing.selectedSkills : []
    });
    setCompareConfigPlayerId(playerId);
  };

  const applyCompareConfigModal = () => {
    if (!compareConfigPlayerId) return;
    setCompareCustomizations((current) => ({
      ...current,
      [compareConfigPlayerId]: {
        rank: toNumber(compareConfigDraft.rank, 0),
        trainingLevel: toNumber(compareConfigDraft.trainingLevel, 0),
        selectedSkills: Array.isArray(compareConfigDraft.selectedSkills) ? compareConfigDraft.selectedSkills : []
      }
    }));
    setCompareConfigPlayerId(null);
  };

  const resetCompareConfigModal = () => {
    setCompareConfigDraft({
      rank: 0,
      trainingLevel: 0,
      selectedSkills: []
    });
  };

  const updateShardCount = (ovr, delta) => {
    setShardCounts((current) => {
      const next = { ...current };
      next[ovr] = Math.max(0, toNumber(next[ovr], 0) + delta);
      return next;
    });
  };

  const resetShardCounter = () => {
    setShardCounts({
      105: 0,
      106: 0,
      107: 0,
      108: 0,
      109: 0,
      110: 0,
      111: 0,
      112: 0,
      113: 0
    });
  };

  const resetShardCost = () => {
    setShardRequired(0);
    setShardPlayerOvr(105);
  };

  const openTool = (toolName) => setActiveTool(normalizeTool(toolName));
  const closeOpenTool = () => setActiveTool('none');

  const compareSubtitle =
    comparePlayers.length === 0
      ? 'Add at least 2 players to see comparison'
      : comparePlayers.length === 1
        ? 'Add one more player to enable comparison'
        : `Comparing ${comparePlayers.length} players`;

  const compareConfigPlayer = compareConfigPlayerId ? playersById.get(compareConfigPlayerId) : null;
  const compareConfigPoints = Math.max(0, toNumber(compareConfigDraft.rank, 0));
  const activeFieldTheme = FIELD_THEMES[fieldThemeId] || FIELD_THEMES['camp-nou'];
  const fieldThemeClassName = `theme-${activeFieldTheme.id}`;

  return (
    <>
      <div id="tools-view" className="view active">
        <div className="tools-modal-content" style={{ width: 'min(1200px, 96vw)', margin: '18px auto', maxHeight: 'none' }}>
          <div className="tools-modal-header">
            <h2>Tools & Features</h2>
            <button className="tools-modal-close" onClick={() => setActiveTool('none')} type="button" aria-label="Clear active tool">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="tools-grid">
            <button className="tool-card" onClick={() => openTool('squadbuilder')} type="button">
              <div className="tool-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="7" r="4" />
                  <path d="M3 20c0-1.5 3-2.5 6-2.5s6 1 6 2.5" />
                  <circle cx="17" cy="7" r="4" />
                  <path d="M15 20c0-1.5 2-2.5 4-2.5s4 1 4 2.5" />
                </svg>
              </div>
              <h3>Squad Builder</h3>
              <p>Create and organize your dream squad</p>
              <span className="tool-badge pro">New</span>
            </button>

            <button className="tool-card" onClick={() => openTool('compare')} type="button">
              <div className="tool-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" />
                  <line x1="12" y1="12" x2="20" y2="7.5" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <line x1="12" y1="12" x2="4" y2="7.5" />
                </svg>
              </div>
              <h3>Compare Players</h3>
              <p>Head-to-head stat comparison</p>
            </button>

            <button className="tool-card" onClick={() => openTool('shard-calculator')} type="button">
              <div className="tool-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="15" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Profit Calculator</h3>
              <p>Count shards and calculate required cost</p>
            </button>
          </div>
        </div>

        <div id="shard-calculator-view" className="view active" style={{ display: activeTool === 'shardcalculator' ? 'block' : 'none' }}>
          <div className="shard-tabs-container">
            <button
              className={`shard-tab-btn ${shardMode === 'counter' ? 'active' : ''}`}
              data-mode="counter"
              onClick={() => setShardMode('counter')}
              type="button"
            >
              💎 Shard Counter
            </button>
            <button
              className={`shard-tab-btn ${shardMode === 'cost' ? 'active' : ''}`}
              data-mode="cost"
              onClick={() => setShardMode('cost')}
              type="button"
            >
              🧮 Shard Cost
            </button>
          </div>

          <div id="shard-counter-section" className="shard-section" style={{ display: shardMode === 'counter' ? 'block' : 'none' }}>
            <div className="shard-counter-card">
              <div className="shard-counter-header">
                <h2>💎 SHARD COUNTER CALCULATOR</h2>
                <p>Count total number of shards and tokens in your account.</p>
              </div>

              <div className="shard-counter-stats">
                <div className="stat-item">
                  <span className="stat-label">Shard Count:</span>
                  <span className="stat-value" id="shard-count-display">
                    {shardCountTotal}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Players Added:</span>
                  <span className="stat-value" id="player-count-display">
                    {shardPlayerTotal}
                  </span>
                </div>
              </div>

              <div className="shard-levels-grid">
                {SHARD_OVRS.map((ovr) => (
                  <div key={ovr} className="shard-level-item">
                    <div className="level-title">
                      OVR {ovr} ({SHARD_COSTS[ovr]} shards)
                    </div>
                    <div className="level-counter">
                      <button className="counter-btn minus" onClick={() => updateShardCount(ovr, -1)} type="button">
                        −
                      </button>
                      <span className="counter-value" id={`counter-${ovr}`}>
                        {toNumber(shardCounts[ovr], 0)}
                      </span>
                      <button className="counter-btn plus" onClick={() => updateShardCount(ovr, 1)} type="button">
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="shard-reset-btn" onClick={resetShardCounter} type="button">
                  🔄 Reset Counter
                </button>
                <button className="shard-reset-btn" onClick={closeOpenTool} type="button">
                  ← Back to Tools
                </button>
              </div>
            </div>
          </div>

          <div id="shard-cost-section" className="shard-section" style={{ display: shardMode === 'cost' ? 'block' : 'none' }}>
            <div className="shard-cost-card">
              <span className="update-indicator">Live</span>
              <div className="shard-cost-header">
                <h2>🧮 SHARD COST CALCULATOR</h2>
              </div>

              <div className="shard-cost-form">
                <label htmlFor="shard-required-input">Enter Shards Required</label>
                <div className="shard-input-wrapper">
                  <button className="input-btn minus" onClick={() => setShardRequired((value) => Math.max(0, value - 10))} type="button">
                    −
                  </button>
                  <input
                    type="text"
                    id="shard-required-input"
                    value={String(Math.max(0, toNumber(shardRequired, 0)))}
                    onChange={(event) => setShardRequired(Math.max(0, toNumber(event.target.value.replace(/[^0-9]/g, ''), 0)))}
                    placeholder="10"
                  />
                  <button className="input-btn plus" onClick={() => setShardRequired((value) => value + 10)} type="button">
                    +
                  </button>
                </div>

                <div className="shard-preset-btns">
                  {[100, 200, 300, 600, 700, 750, 800, 850, 900, 1000, 1500].map((value) => (
                    <button key={value} onClick={() => setShardRequired(value)} type="button">
                      {value === 1000 ? '1k' : value === 1500 ? '1.5k' : value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shard-cost-form">
                <label htmlFor="shard-player-ovr">Select Player OVR</label>
                <select id="shard-player-ovr" value={shardPlayerOvr} onChange={(event) => setShardPlayerOvr(toNumber(event.target.value, 105))}>
                  {SHARD_OVRS.map((ovr) => (
                    <option key={ovr} value={ovr}>
                      OVR {ovr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="shard-cost-results">
                <div className="result-item players">
                  <div className="result-icon">👥</div>
                  <div className="result-info">
                    <span className="result-value" id="shard-cost-players-result">
                      {shardPlayersNeeded}
                    </span>
                    <span className="result-label">Players to Purchase</span>
                  </div>
                </div>

                <div className="result-item cost">
                  <div className="result-icon">💰</div>
                  <div className="result-info">
                    <span className="result-value" id="shard-cost-total-result">
                      {formatCoins(shardTotalCost)}
                    </span>
                    <span className="result-label">Total Cost</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="shard-reset-btn" onClick={resetShardCost} type="button">
                  🔄 RESET COST
                </button>
                <button className="shard-reset-btn" onClick={closeOpenTool} type="button">
                  ← Back to Tools
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="squad-builder-modal" className="squad-modal-overlay" style={{ display: activeTool === 'squadbuilder' ? 'flex' : 'none' }}>
        <div className="squad-modal">
          <div className="squad-header">
            <div className="squad-header-left">
              <h2>Squad Builder</h2>
              <input
                id="squad-name-input"
                className="squad-input"
                placeholder="Squad Name"
                value={squadName}
                onChange={(event) => setSquadName(event.target.value)}
              />
              <button id="squad-theme-btn" className="squad-theme-btn" title="Change Field Theme" onClick={openThemeSelector} type="button">
                🎨
              </button>
            </div>

            <div className="squad-header-center">
              <div className="squad-stat">
                <span className="squad-stat-label">OVR</span>
                <span id="squad-ovr" className="squad-stat-value">
                  {squadOvr}
                </span>
              </div>
              <div className="squad-stat">
                <span className="squad-stat-label">VALUE</span>
                <span id="squad-value" className="squad-stat-value">
                  {formatCoins(squadValue)}
                </span>
              </div>
            </div>

            <div className="squad-header-right">
              <select
                id="formation-select"
                className="squad-select"
                value={formationId}
                onChange={(event) => setFormationId(event.target.value)}
              >
                {Object.keys(SQUAD_FORMATIONS).map((formation) => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))}
              </select>
              <button className="squad-btn" onClick={clearSquad} type="button">
                Reset
              </button>
              <button
                id="squad-theme-btn-mobile-tablet"
                className="squad-theme-btn squad-theme-btn-mobile-tablet"
                title="Change Field Theme"
                onClick={openThemeSelector}
                type="button"
              >
                🎨
              </button>
              <button className="squad-close" onClick={closeOpenTool} type="button" aria-label="Close Squad Builder">
                ✕
              </button>
            </div>
          </div>

          <div className="squad-body">
            <div
              id="squad-filter-panel"
              className={`squad-filter-panel ${squadFilterOpen ? 'active' : ''}`}
              style={{ display: squadFilterOpen ? 'block' : 'none' }}
            >
              <div className="squad-filter-header">
                <h3>Filter Players</h3>
                <button id="close-filter-panel" className="close-filter-btn" onClick={() => setSquadFilterOpen(false)} type="button">
                  ✕
                </button>
              </div>
              <div className="filter-grid">
                <div className="filter-item">
                  <label htmlFor="filter-position">Position</label>
                  <select
                    id="filter-position"
                    className="filter-select"
                    value={squadFilterDraft.position}
                    onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, position: event.target.value }))}
                  >
                    <option value="">All Positions</option>
                    {squadFilterOptions.positions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-item">
                  <label htmlFor="filter-league">League</label>
                  <select
                    id="filter-league"
                    className="filter-select"
                    value={squadFilterDraft.league}
                    onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, league: event.target.value }))}
                  >
                    <option value="">All Leagues</option>
                    {squadFilterOptions.leagues.map((league) => (
                      <option key={league} value={league}>
                        {league}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-item">
                  <label htmlFor="filter-nationality">Nationality</label>
                  <select
                    id="filter-nationality"
                    className="filter-select"
                    value={squadFilterDraft.nation}
                    onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, nation: event.target.value }))}
                  >
                    <option value="">All Nationalities</option>
                    {squadFilterOptions.nations.map((nation) => (
                      <option key={nation} value={nation}>
                        {nation}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-item">
                  <label htmlFor="filter-club">Club</label>
                  <select
                    id="filter-club"
                    className="filter-select"
                    value={squadFilterDraft.club}
                    onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, club: event.target.value }))}
                  >
                    <option value="">All Clubs</option>
                    {squadFilterOptions.clubs.map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-item">
                  <label htmlFor="filter-min-ovr">Min OVR</label>
                  <input
                    id="filter-min-ovr"
                    className="filter-select"
                    type="number"
                    min="0"
                    max="150"
                    value={squadFilterDraft.minOvr}
                    onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, minOvr: toNumber(event.target.value, 0) }))}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="filter-max-ovr">Max OVR</label>
                  <input
                    id="filter-max-ovr"
                    className="filter-select"
                    type="number"
                    min="0"
                    max="150"
                    value={squadFilterDraft.maxOvr}
                    onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, maxOvr: toNumber(event.target.value, 150) }))}
                  />
                </div>
                <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    id="filter-auctionable-only"
                    type="checkbox"
                    checked={!!squadFilterDraft.auctionableOnly}
                    onChange={(event) =>
                      setSquadFilterDraft((prev) => ({ ...prev, auctionableOnly: event.target.checked }))
                    }
                  />
                  <label htmlFor="filter-auctionable-only">Auctionable only</label>
                </div>
                <div className="filter-actions">
                  <button className="apply-filter-btn" onClick={applySquadFilterPanel} type="button">
                    Apply Filters
                  </button>
                  <button className="clear-filter-btn" onClick={resetSquadFilterPanel} type="button">
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className={`squad-field-container ${fieldThemeClassName}`} style={{ background: activeFieldTheme.background }}>
              <div id="squad-field" className="squad-field">
                {formationSlots.map((slot) => {
                  const playerId = starters[slot.id] || '';
                  const player = playerId ? playersById.get(playerId) : null;
                  const variant = player ? getPlayerType(player) : 'hero';
                  const adjustedOvr = player ? toNumber(starterAdjustedOvrBySlot[slot.id], 0) : 0;
                  const dragKey = player ? `slot-${slot.id}` : '';
                  return (
                    <div
                      key={`${formationId}-${slot.id}`}
                      className={`squad-slot ${dragOverSlotId === slot.id ? 'drag-over' : ''}`}
                      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                      data-slot-id={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      onDragOver={(event) => handleSlotDragOver(event, slot.id)}
                      onDragLeave={() => handleSlotDragLeave(slot.id)}
                      onDrop={(event) => handleDropOnSlot(event, slot.id)}
                    >
                      <div className="position-dot">
                        <span className="position-label">{slot.label}</span>
                      </div>

                      {!!player && (
                        <div
                          className={`player-preview-card ${draggingKey === dragKey ? 'dragging' : ''}`}
                          data-player-id={player.playerId}
                          draggable
                          onDragStart={(event) => handleDragStart(event, { source: 'slot', playerId: player.playerId, slotId: slot.id }, dragKey)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="preview-card-inner">
                            <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card" className="preview-card-bg" />
                            {!!player.playerImage && (
                              <img src={player.playerImage} alt={player.name} className="preview-card-player-img" />
                            )}
                            <div className="preview-card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
                              {adjustedOvr > 0 ? adjustedOvr : 'NA'}
                            </div>
                            <div className="preview-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                              {player.position || 'NA'}
                            </div>
                            <div className="preview-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                              {player.name}
                            </div>
                            {!!player.nationFlag && (
                              <img
                                src={player.nationFlag}
                                alt="Nation"
                                className={`card-nation-flag ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                              />
                            )}
                            {!!player.clubFlag && (
                              <img
                                src={player.clubFlag}
                                alt="Club"
                                className={`card-club-flag ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                              />
                            )}
                            {variant === 'normal' && !!player.leagueImage && (
                              <img src={player.leagueImage} alt="League" className="card-league-flag normal-league-flag" />
                            )}
                            {player.isUntradable && (
                              <div className="card-untradable-badge with-remove">
                                <img src="/assets/images/untradable_img.png" alt="Untradable" />
                              </div>
                            )}
                            <button
                              className="preview-card-remove"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeStarter(slot.id);
                              }}
                              type="button"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div id="squad-bench" className="squad-bench">
                {bench.map((playerId, index) => {
                  const player = playerId ? playersById.get(playerId) : null;
                  const variant = player ? getPlayerType(player) : 'hero';
                  const dragKey = player ? `bench-${index}` : '';
                  return (
                    <div
                      key={`bench-${index}`}
                      className={`bench-cell ${player ? 'filled' : ''} ${dragOverBenchIndex === index ? 'drag-over' : ''}`}
                      data-bench-index={index}
                      onDragOver={(event) => handleBenchDragOver(event, index)}
                      onDragLeave={() => handleBenchDragLeave(index)}
                      onDrop={(event) => handleDropOnBench(event, index)}
                    >
                      <div className="bench-empty-slot">
                        <span className="bench-slot-label">BENCH {index + 1}</span>
                      </div>
                      {!!player && (
                        <div
                          className={`bench-preview-card ${draggingKey === dragKey ? 'dragging' : ''}`}
                          data-player-id={player.playerId}
                          draggable
                          onDragStart={(event) => handleDragStart(event, { source: 'bench', playerId: player.playerId, benchIndex: index }, dragKey)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="bench-card-inner">
                            <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card" className="bench-card-bg" />
                            {!!player.playerImage && (
                              <img src={player.playerImage} alt={player.name} className="bench-card-player-img" />
                            )}
                            <div className="bench-card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
                              {player.ovr > 0 ? player.ovr : 'NA'}
                            </div>
                            <div className="bench-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                              {player.position || 'NA'}
                            </div>
                            <div className="bench-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                              {player.name}
                            </div>
                            {!!player.nationFlag && (
                              <img
                                src={player.nationFlag}
                                alt="Nation"
                                className={`bench-card-flag-nation ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                              />
                            )}
                            {!!player.clubFlag && (
                              <img
                                src={player.clubFlag}
                                alt="Club"
                                className={`bench-card-flag-club ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                              />
                            )}
                            {player.isUntradable && (
                              <div className="card-untradable-badge" style={{ right: '18px', pointerEvents: 'none' }}>
                                <img src="/assets/images/untradable_img.png" alt="Untradable" />
                              </div>
                            )}
                            <button className="bench-card-remove" onClick={() => removeBenchPlayer(index)} type="button">
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="squad-picker">
              <div className="squad-picker-toolbar">
                <button className="squad-filter-btn" onClick={openSquadFilterPanel} type="button">
                  Filters
                </button>
                <input
                  type="text"
                  id="squad-picker-search"
                  className="squad-picker-search"
                  value={squadSearchQuery}
                  onChange={(event) => setSquadSearchQuery(event.target.value)}
                  placeholder="Search players..."
                />
                <button className="icon-btn" onClick={() => setSquadSearchQuery('')} type="button" aria-label="Clear search">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="squad-hint">
                {selectedSlotId ? `Selected slot: ${selectedSlotId}` : 'Select a slot to assign players'}
              </div>

              <div className="squad-player-list">
                {squadPickerPlayers.map((player) => {
                  const variant = getPlayerType(player);
                  const dragKey = `picker-${player.playerId}`;
                  return (
                    <div
                      key={player.playerId}
                      className={`picker-row ${draggingKey === dragKey ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(event) => handleDragStart(event, { source: 'picker', playerId: player.playerId }, dragKey)}
                      onDragEnd={handleDragEnd}
                      onClick={() => assignPlayerToSelectedSlot(player.playerId)}
                    >
                      <div className="picker-card-mini">
                        <img src={player.cardBackground || 'https://via.placeholder.com/120x160'} alt="Card" className="picker-card-bg" />
                        {!!player.playerImage && <img src={player.playerImage} alt={player.name} className="picker-card-player-img" />}
                        <div className="picker-card-ovr" style={{ color: player.colorRating || '#FFB86B' }}>
                          {player.ovr > 0 ? player.ovr : 'N/A'}
                        </div>
                        <div className="picker-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                          {player.position || 'N/A'}
                        </div>
                        <div className="picker-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                          {player.name}
                        </div>
                        {!!player.nationFlag && (
                          <img
                            src={player.nationFlag}
                            alt="Nation"
                            className={`picker-squad-card-flag-nation ${variant === 'normal' ? 'normal-squad-nation-flag' : 'hero-icon-squad-nation-flag'}`}
                          />
                        )}
                        {!!player.clubFlag && (
                          <img
                            src={player.clubFlag}
                            alt="Club"
                            className={`picker-squad-card-flag-club ${variant === 'normal' ? 'normal-squad-club-flag' : 'hero-icon-squad-club-flag'}`}
                          />
                        )}
                        {variant === 'normal' && !!player.leagueImage && (
                          <img src={player.leagueImage} alt="League" className="picker-squad-card-flag-league normal-squad-league-flag" />
                        )}
                        {player.isUntradable && (
                          <div className="card-untradable-badge" style={{ pointerEvents: 'none' }}>
                            <img src="/assets/images/untradable_img.png" alt="Untradable" />
                          </div>
                        )}
                      </div>

                      <div className="picker-main">
                        <div className="picker-name">{player.name}</div>
                        <div className="picker-meta">
                          {player.position || 'N/A'} • {player.club || 'Unknown'}
                        </div>
                      </div>

                      <div className="picker-ovr-right">{player.ovr > 0 ? player.ovr : 'N/A'}</div>
                    </div>
                  );
                })}
                {!squadPickerPlayers.length && <p style={{ color: '#98A0A6', textAlign: 'center' }}>No available players match the current search.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="theme-selector-overlay"
        className="theme-selector-overlay"
        style={{ display: themeSelectorOpen ? 'flex' : 'none' }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setThemeSelectorOpen(false);
          }
        }}
      >
        <div className="theme-selector-content" onClick={(event) => event.stopPropagation()}>
          <div className="theme-selector-header">
            <h3>Select Field Theme</h3>
            <button id="close-theme-selector" className="theme-close-btn" onClick={() => setThemeSelectorOpen(false)} type="button">
              ✕
            </button>
          </div>
          <div id="theme-gallery" className="theme-gallery">
            {Object.values(FIELD_THEMES).map((theme) => (
              <div
                key={theme.id}
                className={`theme-option ${fieldThemeDraft === theme.id ? 'active' : ''}`}
                data-theme-id={theme.id}
                role="button"
                tabIndex={0}
                onClick={() => setFieldThemeDraft(theme.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setFieldThemeDraft(theme.id);
                  }
                }}
              >
                <div className="theme-option-preview" style={{ background: theme.background, backgroundAttachment: 'fixed' }}>
                  <div className="theme-option-name">{theme.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="theme-selector-footer">
            <button id="apply-theme-btn" className="apply-theme-btn" onClick={applyThemeSelection} type="button">
              Apply Theme
            </button>
          </div>
        </div>
      </div>

      <div id="compare-players-modal" className="compare-modal-overlay" style={{ display: activeTool === 'compare' ? 'flex' : 'none' }}>
        <div className="compare-modal">
          <div className="compare-header">
            <div className="compare-header-left">
              <h2>⚡ Compare Players</h2>
              <span id="compare-count-badge" className="compare-count-badge">
                {comparePlayers.length}/5
              </span>
            </div>
            <button className="compare-close-btn" onClick={closeOpenTool} type="button">
              ✕
            </button>
          </div>

          <div className="compare-body">
            <div className="compare-stats-column">
              <div className="compare-view-toggle">
                <button
                  id="basic-stats-btn"
                  className={`compare-stats-btn ${compareView === 'basic' ? 'active' : ''}`}
                  onClick={() => setCompareView('basic')}
                  type="button"
                >
                  📊 Basic Stats
                </button>
                <button
                  id="advanced-stats-btn"
                  className={`compare-stats-btn ${compareView === 'advanced' ? 'active' : ''}`}
                  onClick={() => setCompareView('advanced')}
                  type="button"
                >
                  🔧 Advanced Stats
                </button>
              </div>

              <div className="compare-stats-section">
                <div className="compare-stats-header">
                  <h3 id="compare-stats-view-title">{compareView === 'basic' ? 'Major Stats Comparison' : 'Advanced Stats Breakdown'}</h3>
                  <p id="compare-stats-subtitle" className="compare-stats-subtitle">
                    {compareSubtitle}
                  </p>
                </div>

                <div id="compare-stats-grid" className="compare-stats-grid">
                  {compareRows.map((row) => (
                    <div key={row.key} className="stat-row" data-stat-field={row.key}>
                      <div className="stat-name-cell">{row.label}</div>
                      {comparePlayers.map((player, index) => (
                        <div key={`${player.playerId}-${row.key}`} className="stat-value-cell" data-player-id={player.playerId}>
                          <span className={`stat-value ${row.classes[index]}`}>{row.values[index]}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {comparePlayers.length >= 2 && (
                    <div className="stat-row total-row" data-total-row="true">
                      <div className="stat-name-cell">🏆 TOTAL STATS</div>
                      {compareTotals.map((entry, index) => (
                        <div key={`total-${comparePlayers[index]?.playerId || index}`} className="stat-value-cell total-cell">
                          <span className={`total-stats-value ${entry.className}`}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="compare-cards-column">
              <div className="compare-cards-container">
                <div id="compare-cards-grid" className="compare-cards-grid">
                  {comparePlayers.map((player) => {
                    const variant = getPlayerType(player);
                    return (
                      <div key={player.playerId} className="compare-player-card filled-state new-card" data-player-id={player.playerId}>
                        <button className="player-remove-btn" onClick={() => removeComparePlayer(player.playerId)} type="button">
                          ×
                        </button>

                        <div className="compare-card-container">
                          <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card Background" className="compare-card-bg" />
                          {!!player.playerImage && <img src={player.playerImage} alt={player.name} className="compare-player-image" />}
                          <div className="compare-card-ovr" style={{ color: player.colorRating || '#FFB86B' }}>
                            {player.ovr > 0 ? player.ovr : 'NA'}
                          </div>
                          <div className="compare-card-pos" style={{ color: player.colorPosition || '#FFFFFF' }}>
                            {player.position || 'NA'}
                          </div>
                          <div className="compare-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                            {player.name}
                          </div>

                          {!!player.nationFlag && (
                            <img
                              src={player.nationFlag}
                              alt="Nation"
                              className={`compare-nation-flag ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                            />
                          )}
                          {!!player.clubFlag && (
                            <img
                              src={player.clubFlag}
                              alt="Club"
                              className={`compare-club-flag ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                            />
                          )}
                          {variant === 'normal' && !!player.leagueImage && (
                            <img src={player.leagueImage} alt="League" className="compare-league-flag normal-league-flag" />
                          )}

                          {player.isUntradable && (
                            <div className="card-untradable-badge" style={{ right: '40px', pointerEvents: 'none' }}>
                              <img src="/assets/images/untradable_img.png" alt="Untradable" />
                            </div>
                          )}
                        </div>

                        <p className="compare-team-text">{player.club || 'N/A'}</p>
                      </div>
                    );
                  })}

                  {comparePlayers.length < 5 && (
                    <div className="compare-player-card empty-state" onClick={openCompareSearch} role="button" tabIndex={0}>
                      <div className="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                      <p className="empty-text">Add Player {comparePlayers.length + 1}</p>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn--outline btn--sm" onClick={openCompareSearch} type="button" disabled={comparePlayers.length >= 5}>
                    Add Player
                  </button>
                  <button className="btn btn--outline btn--sm" onClick={resetComparePlayers} type="button">
                    Reset
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div id="compare-search-modal" className="compare-search-overlay" style={{ display: compareSearchOpen ? 'flex' : 'none' }}>
        <div className="compare-search-modal">
          <div className="compare-search-header">
            <h3>🔍 Search Players</h3>
            <button className="compare-search-close" onClick={() => setCompareSearchOpen(false)} type="button">
              ✕
            </button>
          </div>

          <div className="compare-search-body">
            <input
              type="text"
              id="compare-search-input"
              className="compare-search-input"
              value={compareSearchQuery}
              onChange={(event) => setCompareSearchQuery(event.target.value)}
              placeholder="Search player name..."
              autoComplete="off"
            />

            <div id="compare-search-results" className="compare-search-results">
              {toText(compareSearchQuery).length < 2 && (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>
                  Type at least 2 characters...
                </p>
              )}

              {toText(compareSearchQuery).length >= 2 && !compareSearchResults.length && (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>No players found.</p>
              )}

              {compareSearchResults.map((player) => {
                const variant = getPlayerType(player);
                return (
                  <div key={player.playerId} className="compare-search-result-item" onClick={() => addComparePlayer(player.playerId)} role="button" tabIndex={0}>
                    <div className="compare-search-result-image">
                      <div className="picker-card-mini">
                        <img src={player.cardBackground || 'https://via.placeholder.com/120x160'} alt="Card" className="picker-card-bg" />
                        {!!player.playerImage && <img src={player.playerImage} alt={player.name} className="picker-card-player-img" />}
                        <div className="picker-card-ovr" style={{ color: player.colorRating || '#FFB86B' }}>
                          {player.ovr > 0 ? player.ovr : 'NA'}
                        </div>
                        <div className="picker-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                          {player.position || 'NA'}
                        </div>
                        <div className="picker-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                          {player.name}
                        </div>
                        {!!player.nationFlag && (
                          <img
                            src={player.nationFlag}
                            alt="Nation"
                            className={`picker-card-flag-nation ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                          />
                        )}
                        {!!player.clubFlag && (
                          <img
                            src={player.clubFlag}
                            alt="Club"
                            className={`picker-card-flag-club ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                          />
                        )}
                        {variant === 'normal' && !!player.leagueImage && (
                          <img src={player.leagueImage} alt="League" className="picker-card-flag-league-compare normal-league-flag-compare" />
                        )}
                        {player.isUntradable && (
                          <div className="card-untradable-badge" style={{ pointerEvents: 'none' }}>
                            <img src="/assets/images/untradable_img.png" alt="Untradable" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="compare-search-result-info">
                      <h4>{player.name}</h4>
                      <p>
                        {player.position || 'NA'} • {player.club || 'N/A'}
                      </p>
                    </div>
                    <div className="compare-search-result-ovr">{player.ovr > 0 ? player.ovr : 'NA'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

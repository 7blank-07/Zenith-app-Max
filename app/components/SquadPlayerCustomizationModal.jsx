'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AnimatedRankIcon from './AnimatedRankIcon.client';
import { fetchApiJson as fetchPlayerApiJson } from './player-skill-stats-utils';
import { RANK_SPRITES } from './player-detail-utils';
import { RANK_SIMPLE_ICON_URLS, UNTRADABLE_BADGE_IMAGE_URL } from './static-image-urls';

const RANK_OPTIONS = Object.freeze([
  { rank: 1, label: 'Green', icon: RANK_SIMPLE_ICON_URLS[1] },
  { rank: 2, label: 'Blue', icon: RANK_SIMPLE_ICON_URLS[2] },
  { rank: 3, label: 'Purple', icon: RANK_SIMPLE_ICON_URLS[3] },
  { rank: 4, label: 'Red', icon: RANK_SIMPLE_ICON_URLS[4] },
  { rank: 5, label: 'Orange', icon: RANK_SIMPLE_ICON_URLS[5] }
]);

const TRAINING_LEVEL_OPTIONS = Object.freeze([
  0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
]);

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSelectedSkills(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((entry) => String(entry || '').trim())
    .filter((entry) => {
      if (!entry) return false;
      if (seen.has(entry)) return false;
      seen.add(entry);
      return true;
    });
}

function getSkillId(skill) {
  return String(skill?.skill_id ?? skill?.skillId ?? '').trim();
}

function getSkillName(skill) {
  return String(skill?.skill_name ?? skill?.skillName ?? '').trim();
}

function getSkillImage(skill) {
  return String(skill?.skill_image ?? skill?.skillImage ?? '').trim();
}

function aggregateSkillBoostsByLevel(skillLevelsById, skillBoostCatalogById) {
  if (!skillLevelsById || typeof skillLevelsById !== 'object') return {};
  if (!skillBoostCatalogById || typeof skillBoostCatalogById !== 'object') return {};
  const totals = {};
  Object.entries(skillLevelsById).forEach(([skillId, levelValue]) => {
    const selectedLevel = toNumber(levelValue, 0);
    if (selectedLevel <= 0) return;
    const skillBoostRows = skillBoostCatalogById[skillId];
    if (!Array.isArray(skillBoostRows) || skillBoostRows.length === 0) return;
    const matchingLevel = skillBoostRows.find(
      (entry) => toNumber(entry?.level_number ?? entry?.levelNumber, 0) === selectedLevel
    );
    if (!matchingLevel) return;
    Object.entries(matchingLevel).forEach(([key, rawValue]) => {
      if (!key.startsWith('boost_')) return;
      const boostValue = toNumber(rawValue, 0);
      if (boostValue === 0) return;
      const statKey = key.slice('boost_'.length);
      totals[statKey] = (totals[statKey] || 0) + boostValue;
    });
  });
  return totals;
}

function normalizeSkillAllocationMap(value) {
  if (!value || typeof value !== 'object') return {};
  const normalized = {};
  Object.entries(value).forEach(([skillId, level]) => {
    const normalizedSkillId = String(skillId || '').trim();
    if (!normalizedSkillId) return;
    const normalizedLevel = Math.max(0, toNumber(level, 0));
    if (normalizedLevel > 0) {
      normalized[normalizedSkillId] = normalizedLevel;
    }
  });
  return normalized;
}

function buildSelectedSkillNames(skills, skillLevelsById) {
  if (!Array.isArray(skills) || !skills.length) return [];
  const levels = skillLevelsById && typeof skillLevelsById === 'object' ? skillLevelsById : {};
  const selected = [];
  const seen = new Set();
  skills.forEach((skill) => {
    const skillId = getSkillId(skill);
    if (!skillId || toNumber(levels[skillId], 0) <= 0) return;
    const skillName = getSkillName(skill);
    if (!skillName || seen.has(skillName)) return;
    seen.add(skillName);
    selected.push(skillName);
  });
  return selected;
}

function calculateSkillMaxLevels(skills, skillBoostCatalogById = {}) {
  if (!Array.isArray(skills) || !skills.length) return {};
  const maxLevels = {};
  const normalizedBoostCatalog = skillBoostCatalogById && typeof skillBoostCatalogById === 'object' ? skillBoostCatalogById : {};
  skills.forEach((skill) => {
    const skillId = getSkillId(skill);
    if (!skillId) return;
    const boostRows = Array.isArray(normalizedBoostCatalog[skillId]) ? normalizedBoostCatalog[skillId] : [];
    const maxBoostLevel = boostRows.reduce((maxLevel, row) => {
      const levelNumber = Math.max(0, toNumber(row?.level_number ?? row?.levelNumber, 0));
      return Math.max(maxLevel, levelNumber);
    }, 0);
    maxLevels[skillId] = Math.max(1, maxBoostLevel);
  });
  skills.forEach((skill) => {
    const requiredSkillName = String(skill?.unlock_requirement_skillname || '').trim();
    const requiredLevel = Math.max(1, toNumber(skill?.unlock_requirement_level, 1));
    if (!requiredSkillName) return;
    const prerequisite = skills.find((candidate) => getSkillName(candidate).toUpperCase() === requiredSkillName.toUpperCase());
    const prerequisiteId = getSkillId(prerequisite);
    if (!prerequisiteId) return;
    maxLevels[prerequisiteId] = Math.max(toNumber(maxLevels[prerequisiteId], 1), requiredLevel);
  });
  return maxLevels;
}

function checkSkillUnlocked(skill, skillLevelsById, allSkills) {
  const requirementType = String(skill?.unlock_requirement_type || '').trim().toLowerCase();
  const requiredSkillName = String(skill?.unlock_requirement_skillname || '').trim();
  const requiredLevel = Math.max(1, toNumber(skill?.unlock_requirement_level, 1));
  if (!requiredSkillName || requirementType !== 'skill_level') return true;

  const normalizedLevels = skillLevelsById && typeof skillLevelsById === 'object' ? skillLevelsById : {};
  const prerequisiteSkillId = toNumber(skill?.prerequisite_skill_id, 0);
  if (prerequisiteSkillId > 0) {
    return toNumber(normalizedLevels[String(prerequisiteSkillId)], 0) >= requiredLevel;
  }

  const prerequisiteSkill = (allSkills || []).find(
    (candidate) => getSkillName(candidate).toUpperCase() === requiredSkillName.toUpperCase()
  );
  const prerequisiteId = getSkillId(prerequisiteSkill);
  if (!prerequisiteId) return false;
  return toNumber(normalizedLevels[prerequisiteId], 0) >= requiredLevel;
}

function getSkillUnlockMessage(skill) {
  const explicitText = String(skill?.unlock_requirement_text || '').trim();
  if (explicitText) return explicitText;
  const requiredSkillName = String(skill?.unlock_requirement_skillname || '').trim();
  const requiredLevel = Math.max(1, toNumber(skill?.unlock_requirement_level, 1));
  if (requiredSkillName) {
    return `Requires ${requiredSkillName} Level ${requiredLevel}`;
  }
  return 'Skill locked';
}

function pruneLockedSkillLevels(levels, skills) {
  if (!levels || typeof levels !== 'object') return {};
  const nextLevels = { ...levels };
  let hasChanges = true;
  while (hasChanges) {
    hasChanges = false;
    skills.forEach((skill) => {
      const skillId = getSkillId(skill);
      if (!skillId || toNumber(nextLevels[skillId], 0) <= 0) return;
      if (!checkSkillUnlocked(skill, nextLevels, skills)) {
        delete nextLevels[skillId];
        hasChanges = true;
      }
    });
  }
  return nextLevels;
}

function resolveCurrentUserId() {
  if (typeof window === 'undefined') return '';
  const key = 'zenith_user_id';
  try {
    const existing = String(window.localStorage.getItem(key) || '').trim();
    if (existing) return existing;
    const generated = String(Date.now());
    window.localStorage.setItem(key, generated);
    return generated;
  } catch (error) {
    console.error('[squad-customization] Failed to resolve user id:', error);
    return '';
  }
}

function getPlayerType(player) {
  return player?.leagueImage ? 'normal' : 'hero';
}

function resolveBaseOvr(player) {
  const normalizedRank = clamp(toNumber(player?.rank, 0), 0, 5);
  const normalizedTraining = clamp(toNumber(player?.trainingLevel ?? player?.training_level, 0), 0, 30);
  const fallbackBase = Math.max(0, toNumber(player?.ovr, 0) - normalizedRank - Math.floor(normalizedTraining / 5));
  return Math.max(0, toNumber(player?.baseOvr ?? player?.base_ovr, fallbackBase));
}

function getStatValue(player, key, fallback = 0) {
  const attributes = player?.attributes && typeof player.attributes === 'object' ? player.attributes : {};
  const keyText = String(key || '');
  const compactKey = String(key || '')
    .replace(/[_\-\s]/g, '')
    .toLowerCase();
  const camelCaseKey = String(key || '').replace(/[_\-\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
  const snakeCase = keyText.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
  const variants = [keyText, keyText.toLowerCase(), snakeCase, camelCaseKey, compactKey];
  for (const variant of variants) {
    const attrValue = toNumber(attributes?.[variant], Number.NaN);
    if (Number.isFinite(attrValue)) return Math.max(0, Math.round(attrValue));
    const directValue = toNumber(player?.[variant], Number.NaN);
    if (Number.isFinite(directValue)) return Math.max(0, Math.round(directValue));
  }
  return fallback;
}

function normalizeStatKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_\-\s]/g, '');
}

function getBoostValue(boosts, ...names) {
  if (!boosts || typeof boosts !== 'object') return 0;
  const entries = Object.entries(boosts).map(([boostKey, rawValue]) => {
    const normalizedKey = String(boostKey || '').replace(/^boost_/i, '');
    return [normalizedKey, rawValue];
  });
  for (const name of names) {
    const normalizedName = normalizeStatKey(name);
    const match = entries.find(([boostKey]) => normalizeStatKey(boostKey) === normalizedName);
    if (match) {
      return toNumber(match[1], 0);
    }
  }
  return 0;
}

function getFinalStatValue(player, trainingBoosts, skillBoosts, ...names) {
  let baseStat = Number.NaN;
  for (const name of names) {
    const value = getStatValue(player, name, Number.NaN);
    if (Number.isFinite(value)) {
      baseStat = value;
      break;
    }
  }
  const safeBaseStat = Number.isFinite(baseStat) ? baseStat : 0;
  const trainingBoost = getBoostValue(trainingBoosts, ...names);
  const skillBoost = getBoostValue(skillBoosts, ...names);
  return Math.max(0, Math.round(safeBaseStat + trainingBoost + skillBoost));
}

function roundHalfUp(value) {
  return Math.floor(value + 0.5);
}

function calculatePace(finalStat) {
  return roundHalfUp(
    0.49299585008602 * finalStat('acceleration') + 0.50528383239125 * finalStat('sprint_speed') - 0.13701200270336
  );
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

function buildLegacyStatsModel(player, options = {}) {
  const isGoalkeeper = String(player?.position || '').toUpperCase() === 'GK';
  const trainingBoosts = options.trainingBoosts ?? player?.training_boosts ?? player?.trainingBoosts ?? null;
  const skillBoosts = options.skillBoosts ?? player?.skill_boosts ?? player?.skillBoosts ?? null;
  const finalStat = (...names) => getFinalStatValue(player, trainingBoosts, skillBoosts, ...names);

  if (isGoalkeeper) {
    return {
      title: 'Goalkeeper Statistics',
      categories: [
        {
          key: 'diving',
          name: 'Diving',
          mainValue: finalStat('diving', ...GK_STAT_ALIASES.diving),
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
          mainValue: finalStat('handling', ...GK_STAT_ALIASES.handling),
          substats: [{ label: 'GK Handling', value: finalStat(...GK_STAT_ALIASES.handling, 'handling') }]
        },
        {
          key: 'reflexes',
          name: 'Reflexes',
          mainValue: finalStat('reflexes', ...GK_STAT_ALIASES.reflexes),
          substats: [
            { label: 'GK Reflexes', value: finalStat(...GK_STAT_ALIASES.reflexes, 'reflexes') },
            { label: 'Jumping', value: finalStat('jumping') }
          ]
        },
        {
          key: 'kicking',
          name: 'Kicking',
          mainValue: finalStat('kicking', ...GK_STAT_ALIASES.kicking),
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
      ]
    };
  }

  return {
    title: 'Player Statistics',
    categories: [
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
    ]
  };
}

function getStatAccentColor(value) {
  const numericValue = toNumber(value, 0);
  if (numericValue >= 90) return '#3BD671';
  if (numericValue >= 80) return '#00C2A8';
  if (numericValue >= 70) return '#FFB86B';
  if (numericValue >= 55) return '#E76A6A';
  return '#B33939';
}

export default function SquadPlayerCustomizationModal({ player, onClose, onUpdatePlayer }) {
  const dialogRef = useRef(null);
  const skillRequestSequenceRef = useRef(0);
  const lastSyncedCustomizationRef = useRef('');
  const [selectedRank, setSelectedRank] = useState(0);
  const [trainingLevel, setTrainingLevel] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillPointBudget, setSkillPointBudget] = useState(0);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillLevelsById, setSkillLevelsById] = useState({});
  const [skillsLoadMessage, setSkillsLoadMessage] = useState('Loading skills...');
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillBoostCatalogById, setSkillBoostCatalogById] = useState({});
  const [computedSkillBoosts, setComputedSkillBoosts] = useState({});
  const [computedTrainingBoosts, setComputedTrainingBoosts] = useState(null);
  const [activeSkillDetail, setActiveSkillDetail] = useState(null);
  const [skillBoostLevels, setSkillBoostLevels] = useState([]);
  const [skillModalLoading, setSkillModalLoading] = useState(false);
  const [skillModalError, setSkillModalError] = useState('');
  const [statsViewOpen, setStatsViewOpen] = useState(false);

  const cardVariant = useMemo(() => getPlayerType(player), [player]);
  const baseOvr = useMemo(() => resolveBaseOvr(player), [player]);
  const availableSkillPoints = Math.max(0, skillPointBudget);
  const skillPointsSpent = useMemo(
    () => Object.values(skillLevelsById).reduce((sum, level) => sum + Math.max(0, toNumber(level, 0)), 0),
    [skillLevelsById]
  );
  const skillPointsRemaining = Math.max(0, availableSkillPoints - skillPointsSpent);
  const skillMaxLevels = useMemo(
    () => calculateSkillMaxLevels(availableSkills, skillBoostCatalogById),
    [availableSkills, skillBoostCatalogById]
  );
  const selectedSkillsByAllocation = useMemo(
    () => buildSelectedSkillNames(availableSkills, skillLevelsById),
    [availableSkills, skillLevelsById]
  );
  const trainingBonus = Math.floor(Math.max(0, trainingLevel) / 5);
  const projectedOvr = baseOvr > 0 ? baseOvr + selectedRank + trainingBonus : baseOvr;
  const effectiveSkillBoosts = useMemo(() => {
    if (availableSkills.length > 0) {
      return computedSkillBoosts;
    }
    return player?.skill_boosts || player?.skillBoosts || null;
  }, [availableSkills.length, computedSkillBoosts, player]);
  const effectiveTrainingBoosts = useMemo(() => {
    if (computedTrainingBoosts && typeof computedTrainingBoosts === 'object') {
      return computedTrainingBoosts;
    }
    return player?.training_boosts || player?.trainingBoosts || null;
  }, [computedTrainingBoosts, player]);
  const statsModel = useMemo(
    () => buildLegacyStatsModel(player, { trainingBoosts: effectiveTrainingBoosts, skillBoosts: effectiveSkillBoosts }),
    [effectiveSkillBoosts, effectiveTrainingBoosts, player]
  );

  useEffect(() => {
    const currentSelection = normalizeSelectedSkills(selectedSkills);
    const nextSelection = normalizeSelectedSkills(selectedSkillsByAllocation);
    if (currentSelection.join('|') === nextSelection.join('|')) return;
    setSelectedSkills(nextSelection);
  }, [selectedSkills, selectedSkillsByAllocation]);

  useEffect(() => {
    if (!player) return;
    lastSyncedCustomizationRef.current = '';
    const initialRank = clamp(toNumber(player.rank, 0), 0, 5);
    const initialTrainingLevel = clamp(toNumber(player.trainingLevel ?? player.training_level, 0), 0, 30);
    const initialSkills = normalizeSelectedSkills(player.selectedSkills);
    const initialSkillAllocations = normalizeSkillAllocationMap(player.skillAllocations ?? player.skill_allocations);
    setSelectedRank(initialRank);
    setTrainingLevel(initialTrainingLevel);
    setSelectedSkills(initialSkills);
    setSkillPointBudget(initialRank);
    setAvailableSkills([]);
    setSkillLevelsById(initialSkillAllocations);
    setSkillsLoadMessage('Loading skills...');
    setSkillsLoading(true);
    setSkillBoostCatalogById({});
    setComputedSkillBoosts({});
    setComputedTrainingBoosts(player?.training_boosts || player?.trainingBoosts || null);
    setActiveSkillDetail(null);
    setSkillBoostLevels([]);
    setSkillModalError('');
    setSkillModalLoading(false);
    setStatsViewOpen(false);
  }, [player?.playerId]);

  useEffect(() => {
    const normalizedPlayerId = String(player?.playerId || '').trim();
    if (!normalizedPlayerId) return undefined;

    let isActive = true;
    const controller = new AbortController();
    setSkillsLoading(true);
    setSkillsLoadMessage('Loading skills...');

    const loadSkills = async () => {
      try {
        const userId = resolveCurrentUserId();
        const detailsRequest = fetchPlayerApiJson(`/players/${encodeURIComponent(normalizedPlayerId)}?rank=${encodeURIComponent(selectedRank)}`, controller.signal);
        const allocationsRequest = userId
          ? fetchPlayerApiJson(
              `/skills/allocations/${encodeURIComponent(userId)}/${encodeURIComponent(normalizedPlayerId)}?rank=${encodeURIComponent(selectedRank)}`,
              controller.signal
            ).catch((error) => {
              if (error?.name === 'AbortError') throw error;
              console.error('[squad-customization] Failed to load skill allocations:', error);
              return { allocations: [] };
            })
          : Promise.resolve({ allocations: [] });

        const [detailsPayload, allocationsPayload] = await Promise.all([detailsRequest, allocationsRequest]);
        if (!isActive) return;

        const fetchedSkills = Array.isArray(detailsPayload?.skills) ? detailsPayload.skills : [];
        const fetchedBudget = Math.max(0, toNumber(detailsPayload?.available_skill_points, selectedRank));
        const persistedAllocations = normalizeSkillAllocationMap(player?.skillAllocations ?? player?.skill_allocations);

        const serverLevels = {};
        const rawAllocations = Array.isArray(allocationsPayload?.allocations) ? allocationsPayload.allocations : [];
        rawAllocations.forEach((allocation) => {
          const skillId = String(allocation?.skill_id ?? allocation?.skillId ?? '').trim();
          const skillLevel = Math.max(0, toNumber(allocation?.skill_level ?? allocation?.skillLevel, 0));
          if (!skillId || skillLevel <= 0) return;
          serverLevels[skillId] = skillLevel;
        });

        let nextLevels = Object.keys(persistedAllocations).length ? persistedAllocations : serverLevels;
        if (!Object.keys(nextLevels).length) {
          const fallbackSelectedSkills = normalizeSelectedSkills(player?.selectedSkills);
          const fallbackLevels = {};
          fetchedSkills.forEach((skill) => {
            const skillId = getSkillId(skill);
            const skillName = getSkillName(skill);
            if (!skillId || !skillName) return;
            if (fallbackSelectedSkills.includes(skillName)) {
              fallbackLevels[skillId] = 1;
            }
          });
          nextLevels = fallbackLevels;
        }

        let nextPrunedLevels = pruneLockedSkillLevels(nextLevels, fetchedSkills);
        let spentPoints = Object.values(nextPrunedLevels).reduce((sum, level) => sum + Math.max(0, toNumber(level, 0)), 0);
        if (spentPoints > fetchedBudget) {
          const constrained = { ...nextPrunedLevels };
          for (const skill of fetchedSkills) {
            if (spentPoints <= fetchedBudget) break;
            const skillId = getSkillId(skill);
            const currentLevel = Math.max(0, toNumber(constrained[skillId], 0));
            if (!skillId || currentLevel <= 0) continue;
            const removable = Math.min(currentLevel, spentPoints - fetchedBudget);
            const nextLevel = currentLevel - removable;
            if (nextLevel > 0) constrained[skillId] = nextLevel;
            else delete constrained[skillId];
            spentPoints -= removable;
          }
          nextPrunedLevels = pruneLockedSkillLevels(constrained, fetchedSkills);
        }

        const nextSelectedSkills = buildSelectedSkillNames(fetchedSkills, nextPrunedLevels);
        setAvailableSkills(fetchedSkills);
        setSkillPointBudget(fetchedBudget);
        setSkillLevelsById(nextPrunedLevels);
        setSelectedSkills(nextSelectedSkills);
        setSkillsLoadMessage(fetchedSkills.length ? '' : 'No skills available');
        setSkillsLoading(false);
      } catch (error) {
        if (!isActive || error?.name === 'AbortError') return;
        console.error('[squad-customization] Failed to load player skills:', error);
        setAvailableSkills([]);
        setSkillLevelsById({});
        setSelectedSkills([]);
        setSkillPointBudget(Math.max(0, selectedRank));
        setSkillsLoadMessage('Failed to load skills');
        setSkillsLoading(false);
      }
    };

    loadSkills();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [player?.playerId, selectedRank]);

  useEffect(() => {
    const availableSkillIds = (availableSkills || [])
      .map((skill) => getSkillId(skill))
      .map((skillId) => String(skillId || '').trim())
      .filter(Boolean);
    if (!availableSkillIds.length) return undefined;
    const missingSkillIds = availableSkillIds.filter((skillId) => !Array.isArray(skillBoostCatalogById[skillId]));
    if (!missingSkillIds.length) return undefined;

    let isActive = true;
    const controller = new AbortController();

    const loadMissingSkillBoostCatalog = async () => {
      try {
        const results = await Promise.all(
          missingSkillIds.map(async (skillId) => {
            try {
              const payload = await fetchPlayerApiJson(`/skill-boosts/${encodeURIComponent(skillId)}`, controller.signal);
              return [skillId, Array.isArray(payload?.boosts) ? payload.boosts : []];
            } catch (error) {
              if (error?.name === 'AbortError') throw error;
              console.error(`[squad-customization] Failed to load boosts for skill ${skillId}:`, error);
              return [skillId, []];
            }
          })
        );
        if (!isActive) return;
        setSkillBoostCatalogById((current) => {
          const next = { ...current };
          results.forEach(([skillId, boosts]) => {
            next[skillId] = boosts;
          });
          return next;
        });
      } catch (error) {
        if (!isActive || error?.name === 'AbortError') return;
        console.error('[squad-customization] Failed to load missing skill boosts:', error);
      }
    };

    loadMissingSkillBoostCatalog();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [availableSkills, skillBoostCatalogById]);

  useEffect(() => {
    const aggregatedBoosts = aggregateSkillBoostsByLevel(skillLevelsById, skillBoostCatalogById);
    setComputedSkillBoosts((current) => {
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(aggregatedBoosts);
      if (currentKeys.length === nextKeys.length) {
        const unchanged = nextKeys.every((key) => toNumber(current[key], 0) === toNumber(aggregatedBoosts[key], 0));
        if (unchanged) return current;
      }
      return aggregatedBoosts;
    });
  }, [skillLevelsById, skillBoostCatalogById]);

  useEffect(() => {
    const normalizedPosition = String(player?.position || '').trim();
    const normalizedTrainingLevel = clamp(toNumber(trainingLevel, 0), 0, 30);
    if (!normalizedPosition || normalizedTrainingLevel <= 0) {
      setComputedTrainingBoosts(null);
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();
    const loadTrainingBoosts = async () => {
      try {
        const payload = await fetchPlayerApiJson(
          `/training/boosts?position=${encodeURIComponent(normalizedPosition)}&level=${encodeURIComponent(normalizedTrainingLevel)}`,
          controller.signal
        );
        if (!isActive) return;
        const nextBoosts = payload?.boosts && typeof payload.boosts === 'object' ? payload.boosts : null;
        setComputedTrainingBoosts(nextBoosts);
      } catch (error) {
        if (!isActive || error?.name === 'AbortError') return;
        console.error('[squad-customization] Failed to load training boosts:', error);
        setComputedTrainingBoosts(null);
      }
    };

    loadTrainingBoosts();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [player?.position, trainingLevel]);

  useEffect(() => {
    if (!player) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';

    const getFocusableElements = () => {
      if (!dialogRef.current) return [];
      const selectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',');
      return Array.from(dialogRef.current.querySelectorAll(selectors)).filter((element) => {
        if (!(element instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    };

    const focusFirstElement = () => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (activeSkillDetail) {
          skillRequestSequenceRef.current += 1;
          setActiveSkillDetail(null);
          setSkillBoostLevels([]);
          setSkillModalError('');
          setSkillModalLoading(false);
          return;
        }
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const frameId = window.requestAnimationFrame(focusFirstElement);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [activeSkillDetail, onClose, player, statsViewOpen]);

  const emitUpdate = (nextState) => {
    if (!player?.playerId || typeof onUpdatePlayer !== 'function') return;
    const nextRank = clamp(toNumber(nextState.rank, 0), 0, 5);
    const nextTrainingLevel = clamp(toNumber(nextState.trainingLevel, 0), 0, 30);
    const nextTrainingBonus = Math.floor(Math.max(0, nextTrainingLevel) / 5);
    const nextSkills = normalizeSelectedSkills(nextState.selectedSkills).slice(0, nextRank);
    const nextSkillAllocations = normalizeSkillAllocationMap(
      nextState.skillAllocations ?? skillLevelsById ?? player?.skillAllocations ?? player?.skill_allocations
    );
    const nextProjectedOvr = baseOvr > 0 ? baseOvr + nextRank + nextTrainingBonus : baseOvr;
    onUpdatePlayer({
      playerId: player.playerId,
      rank: nextRank,
      trainingLevel: nextTrainingLevel,
      selectedSkills: nextSkills,
      skillAllocations: nextSkillAllocations,
      skill_allocations: nextSkillAllocations,
      trainingBoosts: effectiveTrainingBoosts,
      training_boosts: effectiveTrainingBoosts,
      skillBoosts: effectiveSkillBoosts,
      skill_boosts: effectiveSkillBoosts,
      trainingBonus: nextTrainingBonus,
      baseOvr,
      boostedOvr: nextProjectedOvr,
      ovr: nextProjectedOvr
    });
  };

  useEffect(() => {
    if (!player?.playerId || typeof onUpdatePlayer !== 'function') return;
    const nextSkillAllocations = normalizeSkillAllocationMap(skillLevelsById);
    const nextSelectedSkills = normalizeSelectedSkills(selectedSkillsByAllocation.length ? selectedSkillsByAllocation : selectedSkills).slice(0, selectedRank);
    const signature = JSON.stringify({
      playerId: player.playerId,
      rank: selectedRank,
      trainingLevel,
      selectedSkills: nextSelectedSkills,
      skillAllocations: nextSkillAllocations,
      trainingBoosts: effectiveTrainingBoosts,
      skillBoosts: effectiveSkillBoosts,
      baseOvr
    });
    if (lastSyncedCustomizationRef.current === signature) return;
    lastSyncedCustomizationRef.current = signature;
    emitUpdate({
      rank: selectedRank,
      trainingLevel,
      selectedSkills: nextSelectedSkills,
      skillAllocations: nextSkillAllocations
    });
  }, [
    baseOvr,
    effectiveSkillBoosts,
    effectiveTrainingBoosts,
    onUpdatePlayer,
    player?.playerId,
    selectedRank,
    selectedSkills,
    selectedSkillsByAllocation,
    skillLevelsById,
    trainingLevel
  ]);

  const handleRankSelect = (nextRank) => {
    const normalizedRank = clamp(toNumber(nextRank, 0), 0, 5);
    const resetSkills = [];
    // Persist rank immediately so closing the modal right after click can't drop the update.
    lastSyncedCustomizationRef.current = '';
    emitUpdate({
      rank: normalizedRank,
      trainingLevel,
      selectedSkills: resetSkills,
      skillAllocations: {}
    });
    setSelectedRank(normalizedRank);
    setSelectedSkills(resetSkills);
    setSkillLevelsById({});
    setAvailableSkills([]);
    setSkillPointBudget(normalizedRank);
    setSkillsLoadMessage('Loading skills...');
    setSkillsLoading(true);
    setSkillBoostCatalogById({});
    setComputedSkillBoosts({});
    setActiveSkillDetail(null);
    setSkillBoostLevels([]);
    setSkillModalError('');
    setSkillModalLoading(false);
  };

  const handleTrainingChange = (event) => {
    const nextTrainingLevel = clamp(toNumber(event.target.value, 0), 0, 30);
    setTrainingLevel(nextTrainingLevel);
  };

  const handleResetRank = () => {
    lastSyncedCustomizationRef.current = '';
    emitUpdate({
      rank: 0,
      trainingLevel: 0,
      selectedSkills: [],
      skillAllocations: {}
    });
    setSelectedRank(0);
    setTrainingLevel(0);
    setSelectedSkills([]);
    setAvailableSkills([]);
    setSkillLevelsById({});
    setSkillPointBudget(0);
    setSkillsLoading(true);
    setSkillsLoadMessage('Loading skills...');
    setSkillBoostCatalogById({});
    setComputedSkillBoosts({});
    setActiveSkillDetail(null);
    setSkillBoostLevels([]);
    setSkillModalError('');
    setSkillModalLoading(false);
  };

  const handleResetSkills = () => {
    setSelectedSkills([]);
    setSkillLevelsById({});
    setActiveSkillDetail(null);
    setSkillBoostLevels([]);
    setSkillModalError('');
    setSkillModalLoading(false);
  };

  const closeSkillDetailModal = useCallback(() => {
    skillRequestSequenceRef.current += 1;
    setActiveSkillDetail(null);
    setSkillBoostLevels([]);
    setSkillModalError('');
    setSkillModalLoading(false);
  }, []);

  const handleSkillCardOpen = async (skill) => {
    if (!skill) return;
    const skillId = getSkillId(skill);
    if (!skillId) return;

    const requestId = skillRequestSequenceRef.current + 1;
    skillRequestSequenceRef.current = requestId;
    setActiveSkillDetail(skill);
    setSkillBoostLevels([]);
    setSkillModalError('');
    setSkillModalLoading(true);

    try {
      const payload = await fetchPlayerApiJson(`/skill-boosts/${encodeURIComponent(skillId)}`);
      if (requestId !== skillRequestSequenceRef.current) return;
      const boosts = Array.isArray(payload?.boosts) ? payload.boosts : [];
      setSkillBoostLevels(boosts);
      setSkillBoostCatalogById((current) => ({
        ...current,
        [skillId]: boosts
      }));
      setSkillModalLoading(false);
    } catch (error) {
      if (requestId !== skillRequestSequenceRef.current || error?.name === 'AbortError') return;
      console.error('[squad-customization] Failed to load skill boosts:', error);
      setSkillBoostLevels([]);
      setSkillModalError('Failed to load skill details');
      setSkillModalLoading(false);
    }
  };

  const handleSkillLevelSelect = (targetLevel) => {
    if (!activeSkillDetail) return;
    const activeSkillId = getSkillId(activeSkillDetail);
    if (!activeSkillId) return;

    const currentLevel = Math.max(0, toNumber(skillLevelsById[activeSkillId], 0));
    const maxLevel = Math.max(1, toNumber(skillMaxLevels[activeSkillId], 1));
    const normalizedTargetLevel = clamp(toNumber(targetLevel, 0), 0, maxLevel);
    const nextLevel = normalizedTargetLevel === currentLevel ? 0 : normalizedTargetLevel;
    const unlocked = checkSkillUnlocked(activeSkillDetail, skillLevelsById, availableSkills);
    if (!unlocked && nextLevel > 0) return;

    const pointsDelta = nextLevel - currentLevel;
    if (pointsDelta > skillPointsRemaining) return;

    const provisionalLevels = { ...skillLevelsById };
    if (nextLevel > 0) provisionalLevels[activeSkillId] = nextLevel;
    else delete provisionalLevels[activeSkillId];

    const nextLevels = pruneLockedSkillLevels(provisionalLevels, availableSkills);
    const nextSelectedSkills = buildSelectedSkillNames(availableSkills, nextLevels);
    setSkillLevelsById(nextLevels);
    setSelectedSkills(nextSelectedSkills);
  };

  const handleRemovePlayer = () => {
    onUpdatePlayer?.({
      playerId: player?.playerId,
      removePlayer: true
    });
  };

  if (!player) return null;

  const activeSkillId = getSkillId(activeSkillDetail);
  const activeSkillName = getSkillName(activeSkillDetail) || 'Skill';
  const activeSkillCurrentLevel = Math.max(0, toNumber(skillLevelsById[activeSkillId], 0));
  const activeSkillMaxLevel = Math.max(1, toNumber(skillMaxLevels[activeSkillId], 1));
  const activeSkillUnlocked = activeSkillDetail ? checkSkillUnlocked(activeSkillDetail, skillLevelsById, availableSkills) : true;
  const activeSkillUnlockMessage = activeSkillDetail ? getSkillUnlockMessage(activeSkillDetail) : 'Skill locked';
  const availablePointsForActiveSkill = Math.max(0, skillPointsRemaining + activeSkillCurrentLevel);
  return (
    <div
      id="squad-player-customization-modal"
      className={`modal squad-player-customization-modal is-visible${statsViewOpen ? ' stats-mode' : ''}`}
      style={{ display: 'flex' }}
    >
      <div className="modal-overlay" onClick={onClose} />

      <div
        className="modal-content squad-customization-content"
        role="dialog"
        aria-modal="true"
        aria-label="Squad player customization"
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close customization modal">
            ×
          </button>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              id="squad-reset-rank-btn"
              className="btn-reset-rank"
              onClick={handleResetRank}
              type="button"
              style={{
                backgroundColor: '#FF6B6B',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Reset Rank
            </button>
            <button
              id="squad-stats-btn"
              className="btn-stats-view"
              onClick={() => setStatsViewOpen(true)}
              type="button"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#E6EEF2',
                padding: '8px 16px',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Stats
            </button>
          </div>
        </div>

        <div id="squad-stats-view" className="squad-stats-view" style={{ display: statsViewOpen ? 'block' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              className="btn-stats-back"
              onClick={() => setStatsViewOpen(false)}
              type="button"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#E6EEF2',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ← Back
            </button>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#E6EEF2', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {statsModel.title}
            </div>
            <div style={{ width: '60px' }} />
          </div>
          <div id="squad-stats-content" className="squad-stats-content">
            <section className="player-stats-section" style={{ maxWidth: '100%', margin: '0 auto', padding: 0 }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--color-text-primary, #E6EEF2)',
                  margin: '0 0 14px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {statsModel.title}
              </h2>
              <div className="stats-grid-container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
                  {statsModel.categories.map((category) => (
                    <article
                      key={category.key}
                      style={{
                        background: 'var(--color-graphite-800, #14181C)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderLeft: '4px solid #00C2A8',
                        borderRadius: '12px',
                        padding: '18px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                          paddingBottom: '10px',
                          borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-primary, #E6EEF2)', textTransform: 'uppercase' }}>
                          {category.name}
                        </h3>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: getStatAccentColor(category.mainValue), lineHeight: 1 }}>
                          {category.mainValue}
                        </div>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {category.substats.map((row, index) => (
                            <tr key={`${category.key}-${row.label}-${index}`}>
                              <th
                                scope="row"
                                style={{
                                  textAlign: 'left',
                                  padding: '6px 0',
                                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                                  color: 'var(--color-text-muted, #98A0A6)',
                                  fontWeight: 600,
                                  width: '70%'
                                }}
                              >
                                {row.label}
                              </th>
                              <td
                                style={{
                                  textAlign: 'right',
                                  padding: '6px 0',
                                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                                  color: getStatAccentColor(row.value),
                                  fontWeight: 800
                                }}
                              >
                                {row.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div id="squad-custom-player-card" className="squad-custom-player-card">
          <div className="squad-custom-mini-card">
            <img src={player.cardBackground || 'https://via.placeholder.com/180x240'} alt="Card Background" className="squad-custom-card-bg" />
            {!!player.playerImage && <img src={player.playerImage} alt={player.name} className="squad-custom-card-player-img" />}
            <div className="squad-custom-card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
              {projectedOvr > 0 ? projectedOvr : 'N/A'}
            </div>
            <div className="squad-custom-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
              {player.position || 'N/A'}
            </div>
            <div className="squad-custom-card-flags">
              {!!player.nationFlag && (
                <img
                  src={player.nationFlag}
                  alt="Nation"
                  className={`squad-modal-custom-card-flag ${cardVariant === 'normal' ? 'normal-modal-nation-flag' : 'hero-icon-modal-nation-flag'}`}
                />
              )}
              {!!player.clubFlag && (
                <img
                  src={player.clubFlag}
                  alt="Club"
                  className={`squad-modal-custom-card-club ${cardVariant === 'normal' ? 'normal-modal-club-flag' : 'hero-icon-modal-club-flag'}`}
                />
              )}
              {cardVariant === 'normal' && !!player.leagueImage && (
                <img src={player.leagueImage} alt="League" className="squad-modal-custom-card-league normal-modal-league-flag" />
              )}
            </div>
            <div className="squad-custom-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
              {player.name}
            </div>
            {selectedRank > 0 && RANK_SPRITES[selectedRank] ? (
              <AnimatedRankIcon
                className="rank-diamond-overlay rank-overlay--squad-customization rank-overlay--animated"
                rank={selectedRank}
                spriteUrl={RANK_SPRITES[selectedRank]}
                size={34}
              />
            ) : null}
            {player.isUntradable && (
              <div className="card-untradable-badge" style={{ pointerEvents: 'none' }}>
                <img src={UNTRADABLE_BADGE_IMAGE_URL} alt="Untradable" />
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#E6EEF2', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>
            Select Rank
          </h3>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              id="squad-reset-rank-inline-btn"
              className="btn-reset-rank"
              onClick={handleResetRank}
              type="button"
              style={{
                background: 'transparent',
                color: '#98A0A6',
                padding: '4px 0',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              Reset Rank
            </button>
          </div>
          <div id="squad-rank-boxes" className="squad-rank-boxes-grid">
            {RANK_OPTIONS.map((option) => {
              const selected = selectedRank === option.rank;
              return (
                <div
                  key={option.rank}
                  className={`squad-rank-box ${selected ? 'selected' : ''}`}
                  data-rank={option.rank}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRankSelect(option.rank)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleRankSelect(option.rank);
                    }
                  }}
                >
                  <img src={option.icon} alt={`${option.label} Rank`} className="rank-icon" />
                  <div className="rank-label">{option.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#E6EEF2', textTransform: 'uppercase', letterSpacing: '0.3px' }} htmlFor="squad-training-level">
              Training Level
            </label>
            <div style={{ backgroundColor: 'rgba(0,194,168,0.15)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#00C2A8' }}>
              <span id="squad-skill-points-display">
                {availableSkillPoints} Point{availableSkillPoints !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <select
            id="squad-training-level"
            value={trainingLevel}
            onChange={handleTrainingChange}
            style={{
              width: '100%',
              backgroundColor: '#14181C',
              border: '2px solid rgba(0,194,168,0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#E6EEF2',
              fontFamily: 'inherit',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage:
                "url(\"data:image/svg+xml;charset=UTF-8,%3csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2300C2A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              paddingRight: '40px'
            }}
          >
            {TRAINING_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level === 30 ? 'Training Level 30 (MAX)' : `Training Level ${level}`}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="reset-skills-btn" type="button" onClick={handleResetSkills}>
              Reset Skills
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E6EEF2', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.3px' }}>
            Skill Points
          </h3>
          <div
            id="squad-custom-skills"
            className="skills-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '12px'
            }}
          >
            {skillsLoading && <p style={{ color: '#98A0A6', textAlign: 'center', gridColumn: '1 / -1' }}>Loading skills...</p>}
            {!skillsLoading && !!skillsLoadMessage && !availableSkills.length && (
              <p style={{ color: '#98A0A6', textAlign: 'center', gridColumn: '1 / -1' }}>{skillsLoadMessage}</p>
            )}
            {!skillsLoading &&
              availableSkills.map((skill) => {
                const skillId = getSkillId(skill);
                const skillName = getSkillName(skill) || 'Skill';
                const skillImage = getSkillImage(skill) || '/assets/images/zenith_logo_main.png';
                const currentLevel = Math.max(0, toNumber(skillLevelsById[skillId], 0));
                const maxLevel = Math.max(1, toNumber(skillMaxLevels[skillId], 1));
                const unlocked = checkSkillUnlocked(skill, skillLevelsById, availableSkills);
                return (
                  <div
                    key={skillId || skillName}
                    className={`skill-card ${unlocked ? '' : 'locked'}`}
                    role="button"
                    tabIndex={0}
                    title={skillName}
                    onClick={() => handleSkillCardOpen(skill)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSkillCardOpen(skill);
                      }
                    }}
                  >
                    <div className="skill-card-inner">
                      <div className="skill-icon">
                        <img
                          src={skillImage}
                          alt={skillName}
                          onError={(event) => {
                            event.currentTarget.src = '/assets/images/zenith_logo_main.png';
                          }}
                        />
                        {!unlocked && <div className="lock-overlay">🔒</div>}
                      </div>
                      <div className="skill-name">{skillName}</div>
                      <div className="skill-level">
                        Level: <span className="level-number">{currentLevel}</span>/{maxLevel}
                      </div>
                      {!unlocked ? (
                        <div className="unlock-requirement">
                          <small>{getSkillUnlockMessage(skill)}</small>
                        </div>
                      ) : (
                        <div className="skill-actions">
                          {currentLevel >= maxLevel && <div className="max-level-badge">MAX LEVEL</div>}
                          {currentLevel < maxLevel && skillPointsRemaining === 0 && (
                            <small style={{ color: '#FF6B6B' }}>No points remaining</small>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '28px' }}>
          <button
            id="squad-remove-btn"
            onClick={handleRemovePlayer}
            type="button"
            style={{
              backgroundColor: '#FF6B6B',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span>Remove</span>
          </button>
          <button
            id="squad-apply-btn"
            onClick={onClose}
            type="button"
            style={{
              backgroundColor: '#3BD671',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span>Apply</span>
          </button>
        </div>
      </div>

      {activeSkillDetail && (
        <div id="skill-detail-modal" className="skill-detail-modal" onClick={closeSkillDetailModal}>
          <div className="skill-modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={closeSkillDetailModal} aria-label="Close skill detail modal">
              ×
            </button>
            <h2>{activeSkillName}</h2>
            {!activeSkillUnlocked && (
              <div style={{ marginTop: '8px', color: '#FFB86B', fontWeight: 600 }}>{activeSkillUnlockMessage}</div>
            )}
            <div className="points-info">
              <div className="current-level-badge">Current Level: {activeSkillCurrentLevel}</div>
              <div className="points-remaining-badge">
                {availablePointsForActiveSkill} point{availablePointsForActiveSkill !== 1 ? 's' : ''} available
              </div>
            </div>
            <div className="boosts-container">
              {skillModalLoading && <p style={{ color: '#98A0A6' }}>Loading skill details...</p>}
              {!skillModalLoading && !!skillModalError && <p style={{ color: '#FF6B6B' }}>{skillModalError}</p>}
              {!skillModalLoading && !skillModalError && !skillBoostLevels.length && <p style={{ color: '#98A0A6' }}>No boost data available</p>}
              {!skillModalLoading &&
                !skillModalError &&
                skillBoostLevels.map((boost) => {
                  const levelNumber = Math.max(0, toNumber(boost?.level_number ?? boost?.levelNumber, 0));
                  if (!levelNumber) return null;
                  const isSelected = activeSkillCurrentLevel === levelNumber;
                  const pointsNeeded = levelNumber - activeSkillCurrentLevel;
                  const canAfford = pointsNeeded <= availablePointsForActiveSkill;
                  const isDisabled = !isSelected && (!activeSkillUnlocked || !canAfford);
                  const isPartiallyUnlocked = activeSkillCurrentLevel > levelNumber && !isSelected;
                  return (
                    <div
                      key={`${activeSkillId}-${levelNumber}`}
                      className={`boost-level-section ${isSelected ? 'selected' : ''} ${isPartiallyUnlocked ? 'unlocked' : ''} ${
                        isDisabled ? 'disabled' : ''
                      }`}
                      onClick={() => {
                        if (isDisabled) return;
                        handleSkillLevelSelect(levelNumber);
                      }}
                      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                    >
                      <div className={`level-checkbox ${isSelected ? 'checked' : ''} ${isPartiallyUnlocked ? 'partial' : ''} ${isDisabled ? 'disabled' : ''}`}>
                        {isSelected ? '✓' : isPartiallyUnlocked ? '○' : ''}
                      </div>
                      <h4>Level {levelNumber}</h4>
                      {isDisabled && pointsNeeded > 0 && (
                        <div className="insufficient-points">Need {pointsNeeded} more point{pointsNeeded !== 1 ? 's' : ''}</div>
                      )}
                      <div className="boost-stats">
                        {Object.entries(boost).map(([key, value]) => {
                          if (!key.startsWith('boost_')) return null;
                          const numericValue = toNumber(value, 0);
                          if (!numericValue) return null;
                          const statName = key.replace('boost_', '').replace(/_/g, ' ').toUpperCase();
                          return (
                            <div key={`${activeSkillId}-${levelNumber}-${key}`} className="boost-stat">
                              +{numericValue} {statName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
            <button className="modal-action-btn" type="button" onClick={closeSkillDetailModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const API_BASE_URL = 'https://zenithfcm.com/api';
export const PLAYER_SKILL_BOOSTS_EVENT = 'player-detail-skill-boosts';
export const PLAYER_TRAINING_BOOSTS_EVENT = 'player-detail-training-boosts';

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

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getSkillId(skill) {
  return String(skill?.skill_id ?? skill?.skillId ?? '').trim();
}

export function getSkillName(skill) {
  return String(skill?.skill_name ?? skill?.skillName ?? '').trim();
}

export function getSkillImage(skill) {
  return String(skill?.skill_image ?? skill?.skillImage ?? '').trim();
}

export function resolvePlayerDetailApiRequest(endpoint) {
  const endpointText = String(endpoint || '').trim();
  const absoluteEndpoint = /^https?:\/\//i.test(endpointText);
  const normalizedEndpoint = absoluteEndpoint
    ? endpointText
    : endpointText.startsWith('/')
      ? endpointText
      : `/${endpointText}`;

  if (absoluteEndpoint) {
    return {
      url: normalizedEndpoint,
      transform: (payload) => payload
    };
  }

  const skillBoostMatch = normalizedEndpoint.match(/^\/skill-boosts\/([^/?#]+)/);
  if (skillBoostMatch) {
    return {
      url: `/api/skill-boosts/${skillBoostMatch[1]}`,
      transform: (payload) => payload
    };
  }

  if (normalizedEndpoint.startsWith('/training/boosts')) {
    return {
      url: `/api${normalizedEndpoint}`,
      transform: (payload) => payload
    };
  }

  const playerMatch = normalizedEndpoint.match(/^\/players\/([^/?#]+)(\?.*)?$/);
  if (playerMatch) {
    const playerId = playerMatch[1];
    const query = new URLSearchParams(playerMatch[2] || '');
    return {
      url: `/api/players/${playerId}${query.toString() ? `?${query.toString()}` : ''}`,
      transform: (payload) => payload
    };
  }

  return {
    url: `${API_BASE_URL}${normalizedEndpoint}`,
    transform: (payload) => payload
  };
}

export async function fetchApiJson(endpoint, signal) {
  const request = resolvePlayerDetailApiRequest(endpoint);
  const response = await fetch(request.url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to fetch ${endpoint} (${response.status}): ${details || response.statusText}`);
  }
  const payload = await response.json();
  return request.transform(payload);
}

export async function fetchTrainingBoosts(position, trainingLevel, signal) {
  const normalizedPosition = String(position || '').trim();
  const normalizedLevel = clamp(toNumber(trainingLevel, 0), 0, 30);
  if (!normalizedPosition || normalizedLevel <= 0) return {};
  const query = `/training/boosts?position=${encodeURIComponent(normalizedPosition)}&level=${encodeURIComponent(normalizedLevel)}`;
  const payload = await fetchApiJson(query, signal);
  const boosts = payload?.boosts;
  return boosts && typeof boosts === 'object' ? boosts : {};
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

function getStatValue(player, key, fallback = Number.NaN) {
  const attributes = player?.attributes && typeof player.attributes === 'object' ? player.attributes : {};
  const keyText = String(key || '');
  const compactKey = keyText.replace(/[_\-\s]/g, '').toLowerCase();
  const camelCaseKey = keyText.replace(/[_\-\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
  const snakeCaseKey = keyText.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
  const variants = [keyText, keyText.toLowerCase(), snakeCaseKey, camelCaseKey, compactKey];

  for (const variant of variants) {
    const attrValue = toNumber(attributes?.[variant], Number.NaN);
    if (Number.isFinite(attrValue)) return Math.max(0, Math.round(attrValue));
    const directValue = toNumber(player?.[variant], Number.NaN);
    if (Number.isFinite(directValue)) return Math.max(0, Math.round(directValue));
  }

  const target = normalizeStatKey(keyText);
  const attributeEntries = Object.entries(attributes);
  for (const [entryKey, rawValue] of attributeEntries) {
    if (normalizeStatKey(entryKey) !== target) continue;
    const resolved = toNumber(rawValue, Number.NaN);
    if (Number.isFinite(resolved)) return Math.max(0, Math.round(resolved));
  }

  const directEntries = Object.entries(player && typeof player === 'object' ? player : {});
  for (const [entryKey, rawValue] of directEntries) {
    if (normalizeStatKey(entryKey) !== target) continue;
    const resolved = toNumber(rawValue, Number.NaN);
    if (Number.isFinite(resolved)) return Math.max(0, Math.round(resolved));
  }

  return fallback;
}

function getFinalStatValue(player, trainingBoosts, skillBoosts, ...names) {
  let baseValue = Number.NaN;
  for (const name of names) {
    const resolved = getStatValue(player, name, Number.NaN);
    if (Number.isFinite(resolved)) {
      baseValue = resolved;
      break;
    }
  }
  const safeBase = Number.isFinite(baseValue) ? baseValue : 0;
  const trainingBoost = getBoostValue(trainingBoosts, ...names);
  const skillBoost = getBoostValue(skillBoosts, ...names);
  return Math.max(0, Math.round(safeBase + trainingBoost + skillBoost));
}

export function resolveLegacyStatValue(player, ...names) {
  const trainingBoosts = player?.training_boosts ?? player?.trainingBoosts ?? null;
  const skillBoosts = player?.skill_boosts ?? player?.skillBoosts ?? null;
  return getFinalStatValue(player, trainingBoosts, skillBoosts, ...names);
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

export function buildLegacyStatsModel(player, options = {}) {
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

export function aggregateSkillBoostsByLevel(skillLevelsById, skillBoostCatalogById) {
  if (!skillLevelsById || typeof skillLevelsById !== 'object') return {};
  if (!skillBoostCatalogById || typeof skillBoostCatalogById !== 'object') return {};
  const totals = {};
  Object.entries(skillLevelsById).forEach(([skillId, levelValue]) => {
    const selectedLevel = toNumber(levelValue, 0);
    if (selectedLevel <= 0) return;
    const skillBoostRows = skillBoostCatalogById[skillId];
    if (!Array.isArray(skillBoostRows) || !skillBoostRows.length) return;
    const matchingLevel = skillBoostRows.find(
      (entry) => toNumber(entry?.level_number ?? entry?.levelNumber, 0) === selectedLevel
    );
    if (!matchingLevel) return;
    Object.entries(matchingLevel).forEach(([key, rawValue]) => {
      if (!key.startsWith('boost_')) return;
      const boostValue = toNumber(rawValue, 0);
      if (!boostValue) return;
      const statKey = key.slice('boost_'.length);
      totals[statKey] = (totals[statKey] || 0) + boostValue;
    });
  });
  return totals;
}

export function calculateSkillMaxLevels(skills) {
  if (!Array.isArray(skills) || !skills.length) return {};
  const maxLevels = {};
  skills.forEach((skill) => {
    const skillId = getSkillId(skill);
    if (!skillId) return;
    maxLevels[skillId] = 1;
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

export function checkSkillUnlocked(skill, skillLevelsById, allSkills) {
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

export function getSkillUnlockMessage(skill) {
  const explicitText = String(skill?.unlock_requirement_text || '').trim();
  if (explicitText) return explicitText;
  const requiredSkillName = String(skill?.unlock_requirement_skillname || '').trim();
  const requiredLevel = Math.max(1, toNumber(skill?.unlock_requirement_level, 1));
  if (requiredSkillName) {
    return `Requires ${requiredSkillName} Level ${requiredLevel}`;
  }
  return 'Skill locked';
}

export function pruneLockedSkillLevels(levels, skills) {
  if (!levels || typeof levels !== 'object') return {};
  const nextLevels = { ...levels };
  let changed = true;
  while (changed) {
    changed = false;
    skills.forEach((skill) => {
      const skillId = getSkillId(skill);
      if (!skillId || toNumber(nextLevels[skillId], 0) <= 0) return;
      if (!checkSkillUnlocked(skill, nextLevels, skills)) {
        delete nextLevels[skillId];
        changed = true;
      }
    });
  }
  return nextLevels;
}

export function getStatAccentColor(value) {
  const numericValue = toNumber(value, 0);
  if (numericValue >= 90) return '#3BD671';
  if (numericValue >= 80) return '#00C2A8';
  if (numericValue >= 70) return '#FFB86B';
  if (numericValue >= 55) return '#E76A6A';
  return '#B33939';
}


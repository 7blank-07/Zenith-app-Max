import pg from 'pg';
import { parsePlayerSlug } from '../player-slug.mjs';

const { Pool } = pg;
const PLAYER_SKILL_DATA_POOL_KEY = '__zenithPlayerSkillDataPool';

function toText(value) {
  return String(value ?? '').trim();
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getPlayerSkillDataPool() {
  const connectionString = toText(process.env.DATABASE_URL);
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for player skill data routes.');
  }

  if (!globalThis[PLAYER_SKILL_DATA_POOL_KEY]) {
    globalThis[PLAYER_SKILL_DATA_POOL_KEY] = new Pool({
      connectionString,
      max: 4,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000
    });
  }

  return globalThis[PLAYER_SKILL_DATA_POOL_KEY];
}

export async function fetchPlayerAvailableSkills(playerId, options = {}) {
  const pool = getPlayerSkillDataPool();
  const normalizedPlayerId = toText(playerId);
  const normalizedRank = Math.max(0, toInteger(options.rank, 0));

  const parsed = parsePlayerSlug(normalizedPlayerId);
  let queryPlayerId = normalizedPlayerId;
  let isVisionPlayer = false;

  if (parsed && !parsed.isLegacyId && parsed.uuid) {
    queryPlayerId = parsed.uuid;
    isVisionPlayer = true;
  } else if (parsed && parsed.isLegacyId) {
    queryPlayerId = parsed.playerId;
  } else if (/^[0-9a-f]{32}$/i.test(normalizedPlayerId) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedPlayerId)) {
    queryPlayerId = normalizedPlayerId.replace(/-/g, '').toLowerCase();
    isVisionPlayer = true;
  }

  if (isVisionPlayer) {
    const rawUuid = queryPlayerId.replace(/-/g, '').toLowerCase();
    const visionResult = await pool.query(
      `
        SELECT
          'vision_' || id::text AS skill_id,
          skill_name,
          image_url AS skill_image,
          false AS is_locked,
          'skill_level' AS unlock_requirement_type,
          level_1_requirements AS unlock_requirement_skillname,
          1 AS unlock_requirement_level,
          '' AS unlock_requirement_text,
          NULL AS prerequisite_skill_id,
          NULL AS prerequisite_level
        FROM vision_player_skills
        WHERE player_id::text = $1 OR player_id::text = $2
        ORDER BY skill_number ASC
      `,
      [rawUuid, queryPlayerId]
    );

    if (visionResult.rows && visionResult.rows.length > 0) {
      return {
        skills: visionResult.rows,
        available_skill_points: normalizedRank
      };
    }
  }

  const result = await pool.query(
    `
      SELECT
        pas.skill_id::text AS skill_id,
        sc.skill_name,
        sc.skill_image,
        pas.is_locked,
        pas.unlock_requirement_type,
        pas.unlock_requirement_skillname,
        pas.unlock_requirement_level,
        pas.unlock_requirement_text,
        pas.prerequisite_skill_id,
        pas.prerequisite_level
      FROM player_available_skills pas
      LEFT JOIN skills_catalog sc ON pas.skill_id = sc.skill_id
      WHERE pas.player_id::text = $1 AND pas.rank = $2 AND pas.training_level = 0
      ORDER BY pas.skill_id
    `,
    [queryPlayerId, normalizedRank]
  );

  return {
    skills: Array.isArray(result.rows) ? result.rows : [],
    available_skill_points: normalizedRank
  };
}

export async function fetchSkillBoostLevels(skillId) {
  const pool = getPlayerSkillDataPool();
  const normalizedSkillId = toText(skillId);

  if (normalizedSkillId.startsWith('vision_')) {
    const dbId = normalizedSkillId.replace('vision_', '');
    const visionResult = await pool.query(
      `
        SELECT level_1_boosts, level_2_boosts, level_3_boosts
        FROM vision_player_skills
        WHERE id = $1
      `,
      [toInteger(dbId, 0)]
    );

    const row = visionResult.rows?.[0];
    if (!row) {
      return { skill_id: normalizedSkillId, boosts: [] };
    }

    const boosts = [];
    const processBoostLevel = (levelNumber, boostObj) => {
      if (!boostObj || typeof boostObj !== 'object') return;
      const boostEntry = { level_number: levelNumber, positions: null };
      
      Object.entries(boostObj).forEach(([key, value]) => {
        if (key.toLowerCase() === 'positions') {
          boostEntry.positions = Array.isArray(value) ? value.join(', ') : value;
        } else {
          const formattedKey = 'boost_' + key.toLowerCase().replace(/[\s-]/g, '_');
          const parsed = Number.parseInt(String(value).replace(/[^\d.-]/g, ''), 10);
          if (Number.isFinite(parsed)) {
            boostEntry[formattedKey] = parsed;
          }
        }
      });
      if (Object.keys(boostEntry).length > 2 || boostEntry.positions) {
        boosts.push(boostEntry);
      }
    };

    processBoostLevel(1, row.level_1_boosts);
    processBoostLevel(2, row.level_2_boosts);
    processBoostLevel(3, row.level_3_boosts);

    return {
      skill_id: normalizedSkillId,
      boosts
    };
  }

  const result = await pool.query(
    `
      SELECT DISTINCT ON (level_number)
        level_number, positions,
        boost_pace, boost_shooting, boost_passing, boost_dribbling,
        boost_defending, boost_physical, boost_acceleration, boost_sprint_speed,
        boost_finishing, boost_shot_power, boost_long_shot, boost_positioning,
        boost_volley, boost_penalties, boost_short_passing, boost_long_passing,
        boost_crossing, boost_curve, boost_free_kick, boost_vision,
        boost_ball_control, boost_agility, boost_reactions, boost_balance,
        boost_composure, boost_interceptions, boost_heading, boost_marking,
        boost_standing_tackle, boost_sliding_tackle, boost_awareness,
        boost_jumping, boost_stamina, boost_strength, boost_aggression,
        boost_gk_diving, boost_gk_handling, boost_gk_kicking,
        boost_gk_positioning, boost_gk_reflexes, boost_long_shot_accuracy,
        boost_free_kick_accuracy
      FROM skill_level_boosts
      WHERE skill_id::text = $1
      ORDER BY level_number ASC
    `,
    [normalizedSkillId]
  );

  return {
    skill_id: normalizedSkillId,
    boosts: Array.isArray(result.rows) ? result.rows : []
  };
}

export async function fetchTrainingBoostsForPosition(position, trainingLevel) {
  const pool = getPlayerSkillDataPool();
  const normalizedPosition = toText(position).toUpperCase();
  const normalizedLevel = Math.max(0, toInteger(trainingLevel, 0));

  const result = await pool.query(
    `
      SELECT *
      FROM position_training_calc
      WHERE position = $1 AND training_level = $2
      LIMIT 1
    `,
    [normalizedPosition, normalizedLevel]
  );

  const row = result.rows?.[0];
  if (!row) {
    return {
      position: normalizedPosition,
      level: normalizedLevel,
      boosts: {},
      message: 'No training data found for this position'
    };
  }

  const boosts = {};
  Object.entries(row).forEach(([key, value]) => {
    if (key === 'id' || key === 'position' || key === 'training_level') return;
    if (value === null || value === undefined) return;
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) return;
    boosts[key] = parsed;
  });

  return {
    position: normalizedPosition,
    level: normalizedLevel,
    boosts
  };
}

export async function fetchPlayerPlaystyles(playerId) {
  const pool = getPlayerSkillDataPool();
  const normalizedPlayerId = toText(playerId);
  const parsed = parsePlayerSlug(normalizedPlayerId);
  let queryPlayerId = normalizedPlayerId;

  if (parsed && !parsed.isLegacyId && parsed.uuid) {
    queryPlayerId = parsed.uuid.replace(/-/g, '').toLowerCase();
  } else if (/^[0-9a-f]{32}$/i.test(normalizedPlayerId) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedPlayerId)) {
    queryPlayerId = normalizedPlayerId.replace(/-/g, '').toLowerCase();
  }

  const result = await pool.query(
    `
      SELECT
        ps.playstyle_name,
        CASE WHEN ps.playstyle_level ILIKE '%2%' THEN 2 ELSE 1 END as level,
        ps.playstyle_description as description,
        ps.image_url as icon_level_1,
        ps.image_url as icon_level_2
      FROM vision_player_playstyles ps
      WHERE ps.player_id::text = $1
    `,
    [queryPlayerId]
  );

  return Array.isArray(result.rows) ? result.rows : [];
}

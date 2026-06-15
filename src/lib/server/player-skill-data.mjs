import pg from 'pg';

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
    [normalizedPlayerId, normalizedRank]
  );

  return {
    skills: Array.isArray(result.rows) ? result.rows : [],
    available_skill_points: normalizedRank
  };
}

export async function fetchSkillBoostLevels(skillId) {
  const pool = getPlayerSkillDataPool();
  const normalizedSkillId = toText(skillId);

  const result = await pool.query(
    `
      SELECT DISTINCT ON (level_number)
        level_number,
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

  const result = await pool.query(
    `
      SELECT
        pp.playstyle_name,
        pp.level,
        pc.description,
        pc.icon_level_1,
        pc.icon_level_2
      FROM player_playstyles pp
      LEFT JOIN playstyles_catalog pc ON pp.playstyle_name = pc.name
      WHERE pp.player_id::text = $1
      ORDER BY pp.level DESC, pp.playstyle_name ASC
    `,
    [normalizedPlayerId]
  );

  return Array.isArray(result.rows) ? result.rows : [];
}

import { NextResponse } from 'next/server';
import { getPlayerSlugResolverPool, normalizePlayerStableRecord, preferPlayerStableRecord } from '../../../../src/lib/server/player-seo-contract.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const incoming = new URL(request.url).searchParams;
  const offset = Number.parseInt(incoming.get('offset') || '0', 10) || 0;
  const limit = Math.min(Number.parseInt(incoming.get('limit') || '50', 10) || 50, 240); // Cap limit at 240
  
  const query = String(incoming.get('q') || '').trim();
  const nameStartsWith = String(incoming.get('name_starts_with') || '').trim();
  const position = String(incoming.get('position') || '').trim().toUpperCase();
  const league = String(incoming.get('league') || '').trim();
  const team = String(incoming.get('team') || '').trim();
  const nation = String(incoming.get('nation') || '').trim();
  const eventName = String(incoming.get('event') || '').trim();
  const minOvr = incoming.has('min_ovr') ? parseInt(incoming.get('min_ovr'), 10) : null;
  const maxOvr = incoming.has('max_ovr') ? parseInt(incoming.get('max_ovr'), 10) : null;
  const skillMoves = incoming.has('skill_moves') ? parseInt(incoming.get('skill_moves'), 10) : null;
  const isUntradable = incoming.has('is_untradable') ? incoming.get('is_untradable') : null;

  const pool = getPlayerSlugResolverPool();
  if (!pool) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  let sql = 'SELECT vp.*, vpa.stats FROM vision_players vp LEFT JOIN vision_player_attributes vpa ON vp.player_id = vpa.player_id WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (query) {
    sql += ` AND card_name ILIKE $${paramIndex++}`;
    params.push(`%${query.replace(/ /g, '%')}%`);
  }
  
  if (nameStartsWith) {
    sql += ` AND card_name ILIKE $${paramIndex++}`;
    params.push(`${nameStartsWith}%`);
  }

  // If a search query is present, we ignore the position filter 
  // to allow finding players across all positions (as requested by the user).
  if (position && !query) {
    sql += ` AND (position = $${paramIndex} OR alternate_position ILIKE $${paramIndex + 1} OR alternate_position ILIKE $${paramIndex + 2} OR alternate_position ILIKE $${paramIndex + 3})`;
    params.push(position, `${position},%`, `%,${position},%`, `%,${position}`);
    paramIndex += 4;
  }

  if (league) {
    sql += ` AND league = $${paramIndex++}`;
    params.push(league);
  }

  if (team) {
    sql += ` AND vp.club = $${paramIndex++}`;
    params.push(team);
  }

  if (nation) {
    sql += ` AND nation = $${paramIndex++}`;
    params.push(nation);
  }

  if (eventName) {
    sql += ` AND event_name = $${paramIndex++}`;
    params.push(eventName);
  }

  if (minOvr !== null && !isNaN(minOvr)) {
    sql += ` AND ovr >= $${paramIndex++}`;
    params.push(minOvr);
  }

  if (maxOvr !== null && !isNaN(maxOvr)) {
    sql += ` AND ovr <= $${paramIndex++}`;
    params.push(maxOvr);
  }

  if (skillMoves !== null && !isNaN(skillMoves)) {
    sql += ` AND skill_moves_stars = $${paramIndex++}`;
    params.push(skillMoves);
  }

  if (isUntradable !== null) {
    sql += ` AND is_untradable = $${paramIndex++}`;
    params.push(String(isUntradable) === '1');
  }

  // Count query for pagination
  let totalCount = 0;
  try {
    const countSql = sql.replace('SELECT vp.*, vpa.stats FROM vision_players vp LEFT JOIN vision_player_attributes vpa ON vp.player_id = vpa.player_id', 'SELECT COUNT(*) FROM vision_players vp');
    const countResult = await pool.query(countSql, params);
    totalCount = parseInt(countResult.rows[0].count, 10);
  } catch (err) {
    console.error('[Search API] Count query failed:', err);
  }

  // Sorting
  const sortBy = String(incoming.get('sort_by') || 'date_added').trim();
  const order = String(incoming.get('order') || 'desc').trim().toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const validSortColumns = ['ovr', 'date_added', 'price', 'rating'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'date_added';
  
  sql += ` ORDER BY ${sortColumn} ${order} NULLS LAST, ovr DESC, card_name ASC`;
  
  // Pagination
  sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  try {
    const result = await pool.query(sql, params);
    
    // Process rows through normalizePlayerStableRecord to maintain exact frontend compatibility
    const players = result.rows.map(row => {
      const playerId = String(row.player_id || row.id);
      let normalizedStats = {};
      if (row.stats) {
        for (const [key, value] of Object.entries(row.stats)) {
          normalizedStats[key.toLowerCase().replace(/ /g, '_')] = value;
        }
      }
      const merged = row.stats ? { ...row, ...normalizedStats } : row;
      return normalizePlayerStableRecord(merged, playerId);
    });

    return NextResponse.json({
      players,
      pagination: {
        total: totalCount,
        offset,
        limit,
        has_more: offset + players.length < totalCount
      }
    });
  } catch (error) {
    console.error('[Search API] Database query failed:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

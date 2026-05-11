import { runBlogQuery, withBlogTransaction } from '../blog/db.mjs';

/**
 * Fetches rankings for a specific position and status (draft or live).
 * @param {string} position - The player position (e.g., 'ST', 'GK').
 * @param {string} status - The ranking status ('draft' or 'live').
 * @returns {Promise<Array>} - The list of ranked players.
 */
export async function getTopTenRankings(position, status = 'live') {
  if (!position) return [];
  const normalizedPos = String(position).trim().toUpperCase();
  const normalizedStatus = String(status).trim().toLowerCase();

  console.log(`[top-10-repo] Fetching ${normalizedStatus} rankings for: ${normalizedPos}`);

  const query = `
    SELECT id, position, rank, player_id as "playerId", archetype, status, updated_at as "updatedAt"
    FROM top_10_rankings
    WHERE TRIM(UPPER(position)) = $1 AND TRIM(LOWER(status)) = $2
    ORDER BY rank ASC
    LIMIT 10
  `;
  const result = await runBlogQuery(query, [normalizedPos, normalizedStatus]);
  return result.rows;
}

/**
 * Saves rankings for a specific position and status.
 * @param {string} position - The player position.
 * @param {Array} rankings - Array of objects with { rank, playerId, archetype }.
 * @param {string} status - The ranking status ('draft' or 'live').
 * @param {string} updatedBy - The name or ID of the user performing the update.
 */
export async function upsertTopTenRankings(position, rankings, status = 'draft', updatedBy = 'Admin') {
  const normalizedPos = String(position).trim().toUpperCase();
  const normalizedStatus = String(status).trim().toLowerCase();

  if (!normalizedPos) {
    throw new Error('Position is required for upserting rankings');
  }

  console.log(`[top-10-repo] Saving ${rankings.length} ${normalizedStatus} rankings for ${normalizedPos} by ${updatedBy}`);

  return withBlogTransaction(async (client) => {
    // Delete existing rankings for this exact position and status to refresh
    // Use TRIM(UPPER) to be absolutely sure of match
    await client.query(
      'DELETE FROM top_10_rankings WHERE TRIM(UPPER(position)) = $1 AND TRIM(LOWER(status)) = $2',
      [normalizedPos, normalizedStatus]
    );

    if (!Array.isArray(rankings) || rankings.length === 0) {
      console.log(`[top-10-repo] No rankings provided for ${normalizedPos} ${normalizedStatus}. Cleared existing.`);
      return;
    }

    // Use a sequential approach to ensure order and avoid conflicts
    for (const r of rankings) {
      const rank = parseInt(r.rank, 10);
      const playerId = String(r.playerId || '').trim();
      
      if (!playerId || isNaN(rank)) {
        console.warn(`[top-10-repo] Skipping invalid ranking for ${normalizedPos}:`, r);
        continue;
      }

      await client.query(
        `INSERT INTO top_10_rankings (position, rank, player_id, archetype, status, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [normalizedPos, rank, playerId, r.archetype || '', normalizedStatus, updatedBy]
      );
    }
    
    console.log(`[top-10-repo] Successfully saved ${rankings.length} ${normalizedStatus} rankings for ${normalizedPos}`);
  });
}

/**
 * Publishes draft rankings to live for a specific position.
 * @param {string} position - The player position.
 * @param {string} updatedBy - The name or ID of the user performing the update.
 */
export async function publishTopTenRankings(position, updatedBy = 'Admin') {
  const normalizedPos = String(position).trim().toUpperCase();

  if (!normalizedPos) {
    throw new Error('Position is required for publishing rankings');
  }

  console.log(`[top-10-repo] Publishing rankings for ${normalizedPos} (requested by ${updatedBy})`);

  return withBlogTransaction(async (client) => {
    // 1. Fetch current draft rankings
    const drafts = await client.query(
      'SELECT rank, player_id, archetype FROM top_10_rankings WHERE TRIM(UPPER(position)) = $1 AND TRIM(LOWER(status)) = $2 ORDER BY rank ASC',
      [normalizedPos, 'draft']
    );

    if (drafts.rows.length === 0) {
      console.error(`[top-10-repo] Publish failed: No draft rankings found for position: ${normalizedPos}`);
      // Log all drafts for debugging
      const allDrafts = await client.query('SELECT DISTINCT position FROM top_10_rankings WHERE status = $1', ['draft']);
      console.log(`[top-10-repo] Available draft positions: ${allDrafts.rows.map(r => r.position).join(', ')}`);
      
      throw new Error(`No draft rankings found for position: ${normalizedPos}`);
    }

    console.log(`[top-10-repo] Found ${drafts.rows.length} draft rows for ${normalizedPos}. Moving to live.`);

    // 2. Delete current live rankings for this position
    await client.query(
      'DELETE FROM top_10_rankings WHERE TRIM(UPPER(position)) = $1 AND TRIM(LOWER(status)) = $2',
      [normalizedPos, 'live']
    );

    // 3. Insert draft rankings as live
    for (const r of drafts.rows) {
      await client.query(
        `INSERT INTO top_10_rankings (position, rank, player_id, archetype, status, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [normalizedPos, r.rank, r.player_id, r.archetype, 'live', updatedBy]
      );
    }
    
    console.log(`[top-10-repo] Successfully published ${drafts.rows.length} rankings for ${normalizedPos}`);
  });
}

/**
 * Gets a summary of ranking counts per position and status.
 */
export async function getTopTenDashboardCounts() {
  const query = `
    SELECT UPPER(position) as position, LOWER(status) as status, count(*) as count
    FROM top_10_rankings
    GROUP BY UPPER(position), LOWER(status)
  `;
  const result = await runBlogQuery(query);
  return result.rows;
}


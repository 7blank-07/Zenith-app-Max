import { getPlayerSlugResolverPool } from './src/lib/server/player-seo-contract.mjs';
async function test() {
  const pool = getPlayerSlugResolverPool();
  try {
    const res = await pool.query(`SELECT player_id, COUNT(*) FROM vision_players GROUP BY player_id HAVING COUNT(*) > 1`);
    console.log("Duplicates: ", res.rows.length);
  } catch(e) {
    console.error(e);
  }
}
test();

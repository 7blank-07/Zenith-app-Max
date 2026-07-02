import { getPlayerSlugResolverPool } from './src/lib/server/player-seo-contract.mjs';
async function test() {
  const pool = getPlayerSlugResolverPool();
  try {
    const res = await pool.query("SELECT player_id, card_name FROM vision_players LIMIT 3");
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  }
}
test();

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://zenith_bot:zenith6Z%40@127.0.0.1:5432/zenith_data';
  const pool = new Pool({ connectionString });
  
  console.log('Adding performance indexes to player_stats...');
  
  try {
    await pool.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_stats_rank ON player_stats (rank);`);
    console.log('Added index on rank');
    
    await pool.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_stats_nation_region ON player_stats (nation_region);`);
    console.log('Added index on nation_region');
    
    await pool.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_stats_position ON player_stats (position);`);
    console.log('Added index on position');

    await pool.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_stats_player_id_text ON player_stats (RIGHT(player_id::text, 4));`);
    console.log('Added index on RIGHT(player_id::text, 4)');

    await pool.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_stats_id_text ON player_stats (RIGHT(id::text, 3));`);
    console.log('Added index on RIGHT(id::text, 3)');
    
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await pool.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_stats_name_trgm ON player_stats USING GIN (name gin_trgm_ops);`);
    console.log('Added GIN index on name');

    console.log('All indexes added successfully!');
  } catch (error) {
    console.error('Failed to add indexes:', error);
  } finally {
    pool.end();
  }
}

run();

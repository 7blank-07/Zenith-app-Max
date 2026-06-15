require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
(async () => {
  try {
    await pool.query("INSERT INTO playstyles_catalog (name) VALUES ('Clinical Finisher') ON CONFLICT (name) DO NOTHING;");
    await pool.query("INSERT INTO player_playstyles (player_id, playstyle_name, level) VALUES (30913114, 'Clinical Finisher', 1) ON CONFLICT (player_id, playstyle_name) DO UPDATE SET level = 1;");
    console.log('Successfully inserted Clinical Finisher for Eusebio 120!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();

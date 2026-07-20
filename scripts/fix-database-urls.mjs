import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import path from 'path';

// Load .env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DB_CONFIG = {
    host: process.env.PG_HOST || '157.230.249.27',
    database: process.env.PG_DATABASE || 'zenith_data',
    user: process.env.PG_USER || 'zenith_bot',
    password: process.env.PG_PASSWORD || 'zenith6Z@',
    port: process.env.PG_PORT || 5432,
};

const CDN_BASE = 'https://images.zenithfcm.com';

async function fixDatabaseUrls() {
    console.log('----------------------------------------------------');
    console.log('[AUTO-FIX] Checking for renderz.app URLs in Database');
    console.log('----------------------------------------------------');

    const client = new Client(DB_CONFIG);
    try {
        await client.connect();

        const updates = [
            { table: 'player_stats', col: 'player_image', isCsv: false },
            { table: 'player_stats', col: 'card_background', isCsv: false },
            { table: 'player_stats', col: 'nation_flag', isCsv: false },
            { table: 'player_stats', col: 'club_flag', isCsv: false },
            { table: 'player_stats', col: 'league_image', isCsv: false },
            { table: 'player_stats', col: 'skills', isCsv: true },
            { table: 'player_stats', col: 'traits', isCsv: true },
            { table: 'skills_catalog', col: 'skill_image', isCsv: false }
        ];

        let totalUpdated = 0;

        for (const { table, col, isCsv } of updates) {
            let sql = '';
            if (isCsv) {
                sql = `
                    UPDATE ${table}
                    SET ${col} = regexp_replace(
                        ${col},
                        'https://[^/]+/([^?,]+)\\?[^,]*',
                        '${CDN_BASE}/\\1.png',
                        'g'
                    )
                    WHERE ${col} LIKE '%renderz.app%'
                `;
            } else {
                sql = `
                    UPDATE ${table}
                    SET ${col} = '${CDN_BASE}/'
                        || split_part(split_part(${col}, '/', 4), '?', 1)
                        || '.png'
                    WHERE ${col} LIKE '%renderz.app%'
                `;
            }

            const result = await client.query(sql);
            if (result.rowCount > 0) {
                console.log(`[FIXED] Updated ${result.rowCount} rows in ${table}.${col}`);
                totalUpdated += result.rowCount;
            }
        }

        if (totalUpdated > 0) {
            console.log(`[SUCCESS] Automatically fixed ${totalUpdated} broken image URLs in the database!`);
        } else {
            console.log('[SUCCESS] Database is perfectly clean. No broken image URLs found.');
        }

    } catch (err) {
        console.error('[ERROR] Failed to run database auto-fix script:', err.message);
    } finally {
        await client.end();
        console.log('----------------------------------------------------');
    }
}

fixDatabaseUrls();

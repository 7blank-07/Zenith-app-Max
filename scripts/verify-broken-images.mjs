import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import { buildPlayerPath } from '../src/lib/player-slug.mjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DB_CONFIG = {
    host: process.env.PG_HOST || '157.230.249.27',
    database: process.env.PG_DATABASE || 'zenith_data',
    user: process.env.PG_USER || 'zenith_bot',
    password: process.env.PG_PASSWORD || 'zenith6Z@',
    port: process.env.PG_PORT || 5432,
};

function checkUrlExists(url) {
    return new Promise((resolve) => {
        // use v=3 to bypass any previous CF cache
        const reqUrl = url.includes('?') ? `${url}&v=3` : `${url}?v=3`;
        const req = https.request(reqUrl, { method: 'HEAD', timeout: 3000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
        req.end();
    });
}

async function findBrokenExamples() {
    console.log('[SCAN] Finding 10-20 examples of broken images over the network...');
    
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();

        // Pull 100 random players to scan
        const res = await client.query(`
            SELECT id, player_id, name, ovr, player_image, card_background
            FROM player_stats 
            WHERE player_image LIKE '%-player.png'
            ORDER BY RANDOM() 
            LIMIT 100
        `);

        const brokenExamples = [];
        let checked = 0;

        for (let i = 0; i < res.rows.length; i += 10) {
            const batch = res.rows.slice(i, i + 10);
            const checks = await Promise.all(batch.map(async (row) => {
                const isWorking = await checkUrlExists(row.player_image);
                return { 
                    playerId: row.player_id, 
                    recordId: row.id,
                    name: row.name,
                    ovr: row.ovr,
                    playerImage: row.player_image, 
                    bgImage: row.card_background,
                    isWorking 
                };
            }));

            for (const result of checks) {
                checked++;
                if (!result.isWorking) {
                    brokenExamples.push(result);
                }
            }
            
            // Stop once we have around 15 examples
            if (brokenExamples.length >= 15) {
                break;
            }
        }

        console.log(`\nFound ${brokenExamples.length} broken images after checking ${checked} URLs.\n`);
        console.log(`--- EXAMPLES OF BROKEN PLAYER CARDS ---`);
        brokenExamples.forEach(b => {
            const playerLike = {
                name: b.name,
                ovr: b.ovr,
                player_id: b.playerId,
                record_id: b.recordId
            };
            const playerPath = buildPlayerPath(playerLike);
            
            console.log(`Player ID: ${b.playerId} (${b.name})`);
            console.log(`Broken Player Image: ${b.playerImage}`);
            console.log(`Broken Background: ${b.bgImage}`);
            console.log(`URL to test: http://localhost:3000${playerPath}\n`);
        });

    } catch (err) {
        console.error('[ERROR]', err.message);
    } finally {
        await client.end();
    }
}

findBrokenExamples();

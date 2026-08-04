import pg from 'pg';
const { Client } = pg;
import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { buildPlayerPath } from '../src/lib/player-slug.mjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DB_CONFIG = {
    host: process.env.PG_HOST || '157.230.249.27',
    database: process.env.PG_DATABASE || 'zenith_data',
    user: process.env.PG_USER || 'zenith_bot',
    password: process.env.PG_PASSWORD || 'zenith6Z@',
    port: process.env.PG_PORT || 5432,
};

function extractFilename(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        return u.pathname.split('/').pop();
    } catch {
        return url.split('/').pop();
    }
}

async function generateHitlist() {
    const sftp = new SftpClient();
    const client = new Client(DB_CONFIG);

    try {
        console.log('[1/3] Reading local CDN file index...');
        const fileContent = fs.readFileSync(path.resolve(process.cwd(), 'cdn-files.txt'), 'utf8');
        const remoteFiles = fileContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const cdnFileSet = new Set(remoteFiles);
        console.log(`      Found ${cdnFileSet.size} unique files in local cache.`);

        console.log('[2/3] Connecting to Database & Fetching all Player URLs...');
        await client.connect();
        // Fetch all players
        const res = await client.query(`
            SELECT id, player_id, name, ovr, player_image, card_background
            FROM player_stats
        `);
        console.log(`      Found ${res.rows.length} players in the database.`);

        console.log('[3/3] Cross-referencing missing files...');
        
        const hitlist = [];
        let missingPlayerImages = 0;
        let missingBackgrounds = 0;

        for (const row of res.rows) {
            let isBroken = false;
            let pImgMissing = false;
            let bgImgMissing = false;

            const pImgFile = extractFilename(row.player_image);
            if (pImgFile && !cdnFileSet.has(pImgFile)) {
                isBroken = true;
                pImgMissing = true;
                missingPlayerImages++;
            }

            const bgImgFile = extractFilename(row.card_background);
            if (bgImgFile && !cdnFileSet.has(bgImgFile)) {
                isBroken = true;
                bgImgMissing = true;
                missingBackgrounds++;
            }

            if (isBroken) {
                const playerLike = {
                    name: row.name,
                    ovr: row.ovr,
                    player_id: row.player_id,
                    record_id: row.id
                };
                const testUrl = `http://localhost:3000${buildPlayerPath(playerLike)}`;
                
                hitlist.push({
                    playerId: row.player_id,
                    name: row.name,
                    playerImage: row.player_image,
                    bgImage: row.card_background,
                    playerMissing: pImgMissing,
                    bgMissing: bgImgMissing,
                    testUrl: testUrl
                });
            }
        }

        console.log(`\n=== RESULTS ===`);
        console.log(`Total Players with Missing Assets: ${hitlist.length}`);
        console.log(`Missing Player Portraits: ${missingPlayerImages}`);
        console.log(`Missing Backgrounds: ${missingBackgrounds}`);

        // Write to CSV Hitlist
        const outPath = path.resolve(process.cwd(), 'image-not-found-player-id.csv');
        let csvContent = 'player_id,name,player_image_not_found,player_background_not_found,player_image_url,bg_image_url,test_url\n';
        for (const h of hitlist) {
            const safeName = h.name ? h.name.replace(/"/g, '""') : '';
            csvContent += `${h.playerId},"${safeName}",${h.playerMissing},${h.bgMissing},${h.playerImage},${h.bgImage},${h.testUrl}\n`;
        }
        
        fs.writeFileSync(outPath, csvContent);
        console.log(`\n[SUCCESS] Hitlist saved to: ${outPath}`);

    } catch (err) {
        console.error('[ERROR]', err.message);
    } finally {
        await client.end();
    }
}

generateHitlist();

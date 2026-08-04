import fs from 'fs';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import pLimit from 'p-limit';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CSV_PATH = path.resolve(process.cwd(), 'image-not-found-player-id.csv');
const RECOVERED_DIR = path.resolve(process.cwd(), 'recovered');
const REMOTE_DIR = '/var/www/images.zenithfcm.com';
const LOG_FILE = path.resolve(process.cwd(), 'scraper-progress.log');
const CONCURRENCY = 25; // Safe API concurrency

if (!fs.existsSync(RECOVERED_DIR)) {
    fs.mkdirSync(RECOVERED_DIR, { recursive: true });
}

function getExpectedFilename(url) {
    if (!url || url === 'null') return null;
    try {
        return new URL(url).pathname.split('/').pop();
    } catch {
        return url.split('/').pop();
    }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

async function startApiScraper() {
    console.log('[API SCRAPER] Initializing ULTRA-FAST API Scraper...');

    const processedIds = new Set();
    if (fs.existsSync(LOG_FILE)) {
        const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n');
        for (const line of logs) {
            if (line.trim()) processedIds.add(line.trim());
        }
    }

    const csvData = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });
    
    const uniqueTargetsMap = new Map();
    for (const row of records) {
        if (!processedIds.has(row.player_id) && (row.player_image_not_found === 'true' || row.player_background_not_found === 'true')) {
            if (!uniqueTargetsMap.has(row.player_id)) {
                uniqueTargetsMap.set(row.player_id, row);
            } else {
                const existing = uniqueTargetsMap.get(row.player_id);
                if (row.player_image_not_found === 'true') existing.player_image_not_found = 'true';
                if (row.player_background_not_found === 'true') existing.player_background_not_found = 'true';
            }
        }
    }

    const targets = Array.from(uniqueTargetsMap.values());
    console.log(`[API SCRAPER] Found ${targets.length} unique players left to process.`);
    if (targets.length === 0) return;

    const limit = pLimit(CONCURRENCY);
    let completedCount = 0;
    const total = targets.length;

    const tasks = targets.map(row => limit(async () => {
        const playerId = row.player_id;
        
        try {
            const targetUrl = `https://renderz.app/24/player/${playerId}`;
            
            // Raw Fetch - No Browser needed!
            const response = await fetchWithTimeout(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }, 5000);
            
            if (response.status === 404) {
                // If it doesn't exist at all on Renderz, mark it as done so we don't retry forever
                fs.appendFileSync(LOG_FILE, `${playerId}\n`);
                completedCount++;
                return;
            }

            const html = await response.text();
            
            // Parse HTML rapidly using regex
            let playerSrc = null;
            let bgSrc = null;

            // Search for player image matching the typical pattern
            const playerMatch = html.match(/https:\/\/images-v2\.renderz\.app\/player_[^\s"']+/i);
            if (playerMatch) playerSrc = playerMatch[0];
            // If player_ is not found, fallback to searching for general player image
            if (!playerSrc) {
               const genPlayerMatch = html.match(/https:\/\/images-v2\.renderz\.app\/(?:[^\s"']+(?:player)[^\s"']*)/i);
               if (genPlayerMatch) playerSrc = genPlayerMatch[0];
            }

            // Search for background image
            const bgMatch = html.match(/https:\/\/images-v2\.renderz\.app\/bg_[^\s"']+/i);
            if (bgMatch) bgSrc = bgMatch[0];
            if (!bgSrc) {
               const genBgMatch = html.match(/https:\/\/images-v2\.renderz\.app\/(?:[^\s"']+(?:bg|background)[^\s"']*)/i);
               if (genBgMatch) bgSrc = genBgMatch[0];
            }
            
            // Clean up URLs
            if (playerSrc) playerSrc = playerSrc.replace(/&amp;/g, '&');
            if (bgSrc) bgSrc = bgSrc.replace(/&amp;/g, '&');

            const pMissing = row.player_image_not_found === 'true';
            const bgMissing = row.player_background_not_found === 'true';

            if (pMissing && playerSrc) {
                const expectedFilename = getExpectedFilename(row.player_image_url);
                if (expectedFilename) {
                    const res = await fetchWithTimeout(playerSrc, {}, 5000);
                    if (res.ok) {
                        const buffer = Buffer.from(await res.arrayBuffer());
                        const localPath = path.join(RECOVERED_DIR, expectedFilename);
                        fs.writeFileSync(localPath, buffer);
                        // File saved locally. Upload later to prevent bottlenecks.
                    }
                }
            }

            if (bgMissing && bgSrc) {
                const expectedFilename = getExpectedFilename(row.bg_image_url);
                if (expectedFilename) {
                    const res = await fetchWithTimeout(bgSrc, {}, 5000);
                    if (res.ok) {
                        const buffer = Buffer.from(await res.arrayBuffer());
                        const localPath = path.join(RECOVERED_DIR, expectedFilename);
                        fs.writeFileSync(localPath, buffer);
                        // File saved locally. Upload later to prevent bottlenecks.
                    }
                }
            }

            fs.appendFileSync(LOG_FILE, `${playerId}\n`);
            completedCount++;
            console.log(`[${completedCount}/${total}] Recovered ${row.name} (ID: ${playerId})`);

        } catch (err) {
            console.error(`[ERROR] ID ${playerId}: ${err.message}`);
        }
    }));

    await Promise.all(tasks);
    console.log('\n[API SCRAPER] All processing completed successfully!');
}

startApiScraper().catch(console.error);

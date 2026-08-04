import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import pLimit from 'p-limit';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuration
const CSV_PATH = path.resolve(process.cwd(), 'image-not-found-player-id.csv');
const RECOVERED_DIR = path.resolve(process.cwd(), 'recovered');
const REMOTE_DIR = '/var/www/images.zenithfcm.com';
const LOG_FILE = path.resolve(process.cwd(), 'scraper-progress.log');
const CONCURRENCY = 25; // Increased to 25 concurrent Playwright tabs

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

async function startMasterScraper() {
    console.log('[MASTER SCRAPER] Initializing HYPER-FAST Concurrent Scraper...');

    const processedIds = new Set();
    if (fs.existsSync(LOG_FILE)) {
        const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n');
        for (const line of logs) {
            if (line.trim()) processedIds.add(line.trim());
        }
    }

    const csvData = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });
    
    // Process unique player IDs only to avoid duplicate work on same card variations
    const uniqueTargetsMap = new Map();
    for (const row of records) {
        if (!processedIds.has(row.player_id) && (row.player_image_not_found === 'true' || row.player_background_not_found === 'true')) {
            if (!uniqueTargetsMap.has(row.player_id)) {
                uniqueTargetsMap.set(row.player_id, row);
            } else {
                // If we already have it, make sure we mark both as missing if any variant is missing
                const existing = uniqueTargetsMap.get(row.player_id);
                if (row.player_image_not_found === 'true') existing.player_image_not_found = 'true';
                if (row.player_background_not_found === 'true') existing.player_background_not_found = 'true';
            }
        }
    }

    const targets = Array.from(uniqueTargetsMap.values());
    console.log(`[MASTER SCRAPER] Found ${targets.length} unique players left to process.`);
    if (targets.length === 0) return;

    const sftp = new SftpClient();
    try {
        console.log('[SFTP] Connecting to CDN...');
        await sftp.connect({
            host: process.env.SFTP_HOST,
            username: process.env.SFTP_USER,
            privateKey: fs.readFileSync(process.env.SFTP_PRIVATE_KEY_PATH),
            passphrase: process.env.SFTP_PASSPHRASE
        });
    } catch (err) {
        console.error('[SFTP ERROR]', err.message);
        return;
    }

    const browser = await chromium.launch({ headless: true });
    // Block unnecessary tracking/css/fonts globally
    const context = await browser.newContext();

    const limit = pLimit(CONCURRENCY);
    let completedCount = 0;
    const total = targets.length;

    // Concurrency queue
    const tasks = targets.map(row => limit(async () => {
        const playerId = row.player_id;
        const page = await context.newPage();
        
        // Block heavy resources
        await page.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['stylesheet', 'font', 'media', 'websocket', 'other'].includes(type) || route.request().url().includes('google-analytics') || route.request().url().includes('ads')) {
                route.abort();
            } else {
                route.continue();
            }
        });

        try {
            const targetUrl = `https://renderz.app/24/player/${playerId}`;
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await page.waitForTimeout(500); // Quick wait for React hydration

            const scrapedUrls = await page.evaluate(() => {
                const playerImg = document.querySelector('img[src*="player_24_"], img[src*="player_25_"], img[src*="player_"]');
                const bgImg = document.querySelector('img[src*="bg_23_"], img[src*="bg_24_"], img[src*="bg_"]');
                return {
                    player: playerImg ? playerImg.src : null,
                    bg: bgImg ? bgImg.src : null
                };
            });

            const pMissing = row.player_image_not_found === 'true';
            const bgMissing = row.player_background_not_found === 'true';

            if (pMissing && scrapedUrls.player) {
                const expectedFilename = getExpectedFilename(row.player_image_url);
                if (expectedFilename) {
                    const res = await fetch(scrapedUrls.player);
                    if (res.ok) {
                        const buffer = Buffer.from(await res.arrayBuffer());
                        const localPath = path.join(RECOVERED_DIR, expectedFilename);
                        fs.writeFileSync(localPath, buffer);
                        await sftp.fastPut(localPath, `${REMOTE_DIR}/${expectedFilename}`);
                    }
                }
            }

            if (bgMissing && scrapedUrls.bg) {
                const expectedFilename = getExpectedFilename(row.bg_image_url);
                if (expectedFilename) {
                    const res = await fetch(scrapedUrls.bg);
                    if (res.ok) {
                        const buffer = Buffer.from(await res.arrayBuffer());
                        const localPath = path.join(RECOVERED_DIR, expectedFilename);
                        fs.writeFileSync(localPath, buffer);
                        await sftp.fastPut(localPath, `${REMOTE_DIR}/${expectedFilename}`);
                    }
                }
            }

            fs.appendFileSync(LOG_FILE, `${playerId}\n`);
            completedCount++;
            console.log(`[${completedCount}/${total}] Recovered ${row.name} (ID: ${playerId})`);

        } catch (err) {
            console.error(`[ERROR] ID ${playerId}: ${err.message}`);
        } finally {
            await page.close();
        }
    }));

    await Promise.all(tasks);
    await browser.close();
    await sftp.end();
    console.log('\n[MASTER SCRAPER] All processing completed successfully!');
}

startMasterScraper().catch(console.error);

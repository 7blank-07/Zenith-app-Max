'use server';

import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import { resolvePlayerIdentifiersFromSlug, fetchPlayerStableRecord } from '../../src/lib/server/player-seo-contract.mjs';
import * as cheerio from 'cheerio';
import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';

// Helper to upload to SFTP
async function uploadToSftp(buffer, filename) {
  const sftp = new SftpClient();
  const privateKeyPath = process.env.SFTP_PRIVATE_KEY_PATH;
  let privateKey = undefined;
  if (privateKeyPath) {
     privateKey = fs.readFileSync(privateKeyPath);
  }

  await sftp.connect({
    host: process.env.SFTP_HOST,
    username: process.env.SFTP_USER,
    privateKey: privateKey,
    passphrase: process.env.SFTP_PASSPHRASE
  });

  const remoteDir = '/var/www/images.zenithfcm.com';
  const remotePath = `${remoteDir}/${filename}`;

  await sftp.put(buffer, remotePath);
  await sftp.end();
}

export async function fixSinglePlayerImageAction(url, options) {
  try {
    await requireBlogSessionUser(); // Security check

    if (!url || typeof url !== 'string') {
      return { error: 'Invalid URL provided.' };
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return { error: 'Invalid URL format.' };
    }

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts[0] !== 'player' || !pathParts[1]) {
        return { error: 'Not a valid Zenith player URL.' };
    }
    const slug = pathParts[1];

    let identifiers;
    try {
      identifiers = await resolvePlayerIdentifiersFromSlug(slug);
    } catch (e) {
      return { error: 'Could not resolve player from URL.' };
    }

    const assetId = identifiers.playerId;
    const record = await fetchPlayerStableRecord(assetId, { rank: 0 });
    if (!record) {
      return { error: 'Could not fetch player record from database.' };
    }

    // Fetch Renderz HTML via ScrapingAnt to bypass Cloudflare VPS IP ban
    const renderzTargetUrl = `https://renderz.app/player/${assetId}`;
    const scrapingAntKey = process.env.SCRAPINGANT_API_KEY;
    if (!scrapingAntKey) {
      return { error: 'SCRAPINGANT_API_KEY is not set in environment variables.' };
    }

    const scrapingAntUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(renderzTargetUrl)}&x-api-key=${scrapingAntKey}&browser=true&wait_for_selector=.action-shot`;

    const renderzRes = await fetch(scrapingAntUrl);
    if (!renderzRes.ok) {
      const errText = await renderzRes.text().catch(() => '');
      return { error: `ScrapingAnt failed to load Renderz page (HTTP ${renderzRes.status}): ${errText}` };
    }

    const html = await renderzRes.text();
    const $ = cheerio.load(html);

    // Find all target images on Renderz
    const renderzImages = {
      playerImage: $('.action-shot').attr('src') || $('img').filter((i, el) => $(el).attr('src')?.includes('player_')).attr('src'),
      cardBackground: $('.background').attr('src') || $('img.background').attr('src'),
      nationFlag: $('.nation').attr('src') || $('img.nation').attr('src'),
      clubFlag: $('.club').attr('src') || $('img.club').attr('src'),
      leagueImage: $('.league').attr('src') || $('img.league').attr('src'),
    };

    const results = [];

    // Map selected options to Zenith record fields
    const targets = [];
    if (options.playerImage) targets.push({ key: 'playerImage', zenithUrl: record.playerImage || record.image, renderzUrl: renderzImages.playerImage });
    if (options.cardBackground) targets.push({ key: 'cardBackground', zenithUrl: record.cardBackground, renderzUrl: renderzImages.cardBackground });
    if (options.nationFlag) targets.push({ key: 'nationFlag', zenithUrl: record.nationFlag, renderzUrl: renderzImages.nationFlag });
    if (options.clubFlag) targets.push({ key: 'clubFlag', zenithUrl: record.clubFlag, renderzUrl: renderzImages.clubFlag });
    if (options.leagueImage) targets.push({ key: 'leagueImage', zenithUrl: record.leagueImage, renderzUrl: renderzImages.leagueImage });

    for (const target of targets) {
      if (!target.zenithUrl) {
        results.push({ type: target.key, status: 'skipped', reason: 'No Zenith image URL found for this field' });
        continue;
      }
      if (!target.renderzUrl) {
        results.push({ type: target.key, status: 'error', reason: 'Could not find replacement image on Renderz' });
        continue;
      }

      // Download from Renderz
      try {
        const imgRes = await fetch(target.renderzUrl);
        if (!imgRes.ok) throw new Error(`Renderz image download failed: ${imgRes.status}`);
        
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract Zenith filename
        const filename = target.zenithUrl.split('/').pop();

        // Upload to Zenith SFTP replacing the exact file
        await uploadToSftp(buffer, filename);

        results.push({ type: target.key, status: 'success' });
      } catch (err) {
        console.error(`Failed to process ${target.key} for ${assetId}:`, err);
        results.push({ type: target.key, status: 'error', reason: err.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('AutoFix Error:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

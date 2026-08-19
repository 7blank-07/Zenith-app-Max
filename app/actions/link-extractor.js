'use server';

import { requireBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import { resolvePlayerIdentifiersFromSlug, fetchPlayerStableRecord } from '../../src/lib/server/player-seo-contract.mjs';

export async function extractPlayerLinksAction(url) {
  try {
    await requireBlogSessionUser(); // Ensure only admins can do this
    
    if (!url || typeof url !== 'string') {
      return { error: 'Please provide a valid Zenith FCM player URL.' };
    }
    
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return { error: 'Invalid URL format. Please enter a full valid URL.' };
    }
    
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    // Expecting something like ['player', 'kaka-122-9795135']
    if (pathParts[0] !== 'player' || !pathParts[1]) {
        return { error: 'Invalid URL format. Must be a Zenith player URL (e.g., https://zenithfcm.com/player/...).' };
    }
    
    const slug = pathParts[1];
    
    let identifiers;
    try {
      identifiers = await resolvePlayerIdentifiersFromSlug(slug);
    } catch (e) {
      return { error: 'Could not resolve player from URL. Make sure the link is correct.' };
    }

    const record = await fetchPlayerStableRecord(identifiers.playerId, { rank: 0 }); 
    
    return {
      success: true,
      data: {
        playerImage: record.playerImage || record.image || '',
        cardBackground: record.cardBackground || '',
        leagueImage: record.leagueImage || '',
        nationFlag: record.nationFlag || '',
        clubFlag: record.clubFlag || '',
        traits: Array.isArray(record.traitImages) ? record.traitImages : [],
        skills: Array.isArray(record.skillImages) ? record.skillImages : []
      }
    };
  } catch (error) {
    return { error: error.message || 'Failed to extract links from URL.' };
  }
}

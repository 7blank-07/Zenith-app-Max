'use server';

import { resolvePlayerIdentifiersFromSlug } from '../../src/lib/server/player-seo-contract.mjs';

export async function fetchAssetIdFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Look for the slug after /player/
    const playerIndex = pathParts.indexOf('player');
    if (playerIndex === -1 || playerIndex === pathParts.length - 1) {
      return { error: 'Invalid Zenith player URL. Make sure it contains /player/[slug]' };
    }
    
    const slug = pathParts[playerIndex + 1];
    
    const identifiers = await resolvePlayerIdentifiersFromSlug(slug);
    
    if (!identifiers || !identifiers.playerId) {
      return { error: 'Could not resolve player from URL.' };
    }

    // In Zenith FCM, the core player_id is the asset_id used across other tables (like latest_prices, price_snapshots)
    return { assetId: identifiers.playerId };
  } catch (err) {
    console.error('Asset ID fetch error:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

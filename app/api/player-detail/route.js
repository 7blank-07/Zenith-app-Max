import { NextResponse } from 'next/server';
import { fetchPlayerStableRecord, resolvePlayerIdentifiersFromSlug } from '../../../src/lib/server/player-seo-contract.mjs';
import { parseRank } from '../../components/player-detail-utils';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let playerId = String(searchParams.get('id') || '').trim();

  if (!playerId) {
    return NextResponse.json({ error: 'Missing required query param: id' }, { status: 400 });
  }

  try {
    const rank = parseRank(searchParams.get('rank'));
    
    // If the ID is a slug (contains a hyphen), resolve it to the real EA player ID
    if (playerId.includes('-')) {
      try {
        const identifiers = await resolvePlayerIdentifiersFromSlug(playerId);
        if (identifiers && identifiers.playerId) {
          playerId = identifiers.playerId;
        }
      } catch (err) {
        console.warn('[player-detail-api] Failed to resolve slug to player ID:', err.message);
      }
    }

    const record = await fetchPlayerStableRecord(playerId, { rank });
    return NextResponse.json({ record });
  } catch (error) {
    console.error('[player-detail-api] Failed to load player detail:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load player detail' },
      { status: 500 }
    );
  }
}

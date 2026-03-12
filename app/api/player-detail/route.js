import { NextResponse } from 'next/server';
import { fetchPlayerStableRecord } from '../../../src/lib/server/player-seo-contract.mjs';
import { parseRank } from '../../components/player-detail-utils';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = String(searchParams.get('id') || '').trim();

  if (!playerId) {
    return NextResponse.json({ error: 'Missing required query param: id' }, { status: 400 });
  }

  try {
    const rank = parseRank(searchParams.get('rank'));
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

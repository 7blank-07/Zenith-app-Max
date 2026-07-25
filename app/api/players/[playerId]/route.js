import { NextResponse } from 'next/server';
import { fetchPlayerAvailableSkills, fetchPlayerPlaystyles } from '../../../../src/lib/server/player-skill-data.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const playerId = String(params?.playerId || '').trim();

  if (!playerId) {
    return NextResponse.json({ error: 'Missing required route param: playerId' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rank = Number.parseInt(String(searchParams.get('rank') || '0'), 10) || 0;
    const payload = await fetchPlayerAvailableSkills(playerId, { rank });
    
    // Also fetch playstyles and attach to payload
    const playstyles = await fetchPlayerPlaystyles(playerId);
    console.log(`[API /players/${playerId}] Fetched playstyles from DB:`, playstyles);
    payload.playstyles = playstyles;

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[players-api] Failed to load player skills payload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load player skills payload' },
      { status: 502 }
    );
  }
}

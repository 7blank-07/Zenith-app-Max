import { NextResponse } from 'next/server';
import { runMarketQuery } from '../../../src/lib/server/market-db.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('id');

  if (!playerId) {
    return NextResponse.json({ error: 'Missing required query param: id' }, { status: 400 });
  }

  try {
    const query = await runMarketQuery(
      `SELECT player_id, refresh_time, name, ovr 
       FROM player_refresh_data 
       WHERE player_id = $1 
       LIMIT 1`,
      [playerId]
    );

    if (!query.rows.length) {
      return NextResponse.json({ error: `No refresh time found for player ${playerId}` }, { status: 404 });
    }

    const row = query.rows[0];

    return NextResponse.json({
      playerId: String(row.player_id ?? playerId),
      refreshTime: row.refresh_time
    });
  } catch (error) {
    console.error('[api/player-refresh] Error:', error);
    return NextResponse.json({ error: `Database query failed: ${error.message}` }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { runMarketQuery } from '../../../src/lib/server/market-db.mjs';

export const dynamic = 'force-dynamic';

function parseRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('id');

  if (!playerId) {
    return NextResponse.json({ error: 'Missing required query param: id' }, { status: 400 });
  }

  const rank = parseRank(searchParams.get('rank'));

  try {
    // Using the latest_prices view which is already optimized
    const query = await runMarketQuery(
      `SELECT asset_id, price0, price1, price2, price3, price4, price5, captured_at 
       FROM latest_prices 
       WHERE asset_id = $1 
       LIMIT 1`,
      [playerId]
    );

    if (!query.rows.length) {
      return NextResponse.json({ error: `No price snapshot found for player ${playerId}` }, { status: 404 });
    }

    const row = query.rows[0];
    const priceValue = row[`price${rank}`];

    return NextResponse.json({
      playerId: String(row.asset_id ?? playerId),
      rank: rank,
      requestedRank: rank,
      price: priceValue ? Number(priceValue) : null,
      capturedAt: row.captured_at || null
    });
  } catch (error) {
    console.error('[api/player-price] Error:', error);
    return NextResponse.json({ error: `Database query failed: ${error.message}` }, { status: 500 });
  }
}

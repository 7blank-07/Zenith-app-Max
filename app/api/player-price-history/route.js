import { NextResponse } from 'next/server';
import { runMarketQuery } from '../../../src/lib/server/market-db.mjs';
import { buildHistorySnapshots } from '../../../src/lib/server/price-snapshot-utils.mjs';

export const dynamic = 'force-dynamic';

function parseRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

function parseDays(daysValue) {
  const parsed = Number.parseInt(String(daysValue ?? '7'), 10);
  if (!Number.isFinite(parsed)) return 7;
  return Math.min(30, Math.max(1, parsed));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('id');

  if (!playerId) {
    return NextResponse.json({ error: 'Missing required query param: id' }, { status: 400 });
  }

  const rank = parseRank(searchParams.get('rank'));
  const days = parseDays(searchParams.get('days'));
  const endTime = new Date();
  const startTime = new Date(endTime);
  startTime.setDate(startTime.getDate() - days);

  try {
    const query = await runMarketQuery(
      `SELECT asset_id, captured_at, price0, price1, price2, price3, price4, price5 
       FROM price_snapshots 
       WHERE asset_id = $1 
       AND captured_at >= $2
       ORDER BY captured_at DESC 
       LIMIT 100`,
      [playerId, startTime]
    );

    const rows = query.rows || [];
    const startMs = startTime.getTime();
    const endMs = endTime.getTime();

    const snapshots = buildHistorySnapshots(rows, rank, { startMs, endMs });

    return NextResponse.json({ 
      playerId: String(playerId), 
      rank, 
      days, 
      snapshots 
    });
  } catch (error) {
    console.error('[api/player-price-history] Error:', error);
    return NextResponse.json({ error: `Database query failed: ${error.message}` }, { status: 500 });
  }
}

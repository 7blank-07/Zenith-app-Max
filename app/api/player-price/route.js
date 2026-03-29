import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { selectLatestSnapshotWithPrice } from '../../../src/lib/server/price-snapshot-utils.mjs';

export const dynamic = 'force-dynamic';

const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';

function parseRank(rankValue) {
  const parsed = Number.parseInt(String(rankValue ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_ANON_KEY;
  return { url, key };
}

function isMissingIdColumnError(error) {
  return /column .*id.* does not exist/i.test(String(error?.message || ''));
}

const QUERY_TIERS = [
  { limit: 30, orderBy: 'id' },
  { limit: 20, orderBy: 'id' },
  { limit: 10, orderBy: 'id' },
  { limit: 10, orderBy: 'captured_at' }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('id');

  if (!playerId) {
    return NextResponse.json({ error: 'Missing required query param: id' }, { status: 400 });
  }

  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase configuration is missing on the server' }, { status: 500 });
  }

  const rank = parseRank(searchParams.get('rank'));
  const requestedPriceColumn = `price${rank}`;
  const priceColumns =
    rank === 0
      ? 'price0'
      : `price0, ${requestedPriceColumn}`;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  let query = null;

  for (const tier of QUERY_TIERS) {
    const includeId = tier.orderBy === 'id';
    let attempt = await supabase
      .from('price_snapshots')
      .select(
        includeId
          ? `id, asset_id, captured_at, ${priceColumns}`
          : `asset_id, captured_at, ${priceColumns}`
      )
      .eq('asset_id', playerId)
      .order(tier.orderBy, { ascending: false })
      .limit(tier.limit);

    if (attempt.error && includeId && isMissingIdColumnError(attempt.error)) {
      attempt = await supabase
        .from('price_snapshots')
        .select(`asset_id, captured_at, ${priceColumns}`)
        .eq('asset_id', playerId)
        .order('captured_at', { ascending: false })
        .limit(Math.min(tier.limit, 10));
    }

    if (!attempt.error) {
      query = attempt;
      break;
    }

    query = attempt;
  }

  if (!query || query.error) {
    return NextResponse.json({ error: `Supabase query failed: ${query.error.message}` }, { status: 500 });
  }

  const rows = Array.isArray(query.data) ? query.data : [];
  if (!rows.length) {
    return NextResponse.json({ error: `No price snapshot found for player ${playerId}` }, { status: 404 });
  }

  const latest = selectLatestSnapshotWithPrice(rows, rank);
  if (!latest) {
    return NextResponse.json({ error: `No price snapshot found for player ${playerId}` }, { status: 404 });
  }

  const snapshot = latest.row;
  return NextResponse.json({
    playerId: String(snapshot.asset_id ?? playerId),
    rank: latest.price.resolvedRank,
    requestedRank: rank,
    price: latest.price.value ?? null,
    capturedAt: snapshot.captured_at || null
  });
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';

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

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
  return { url, key };
}

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
  const days = parseDays(searchParams.get('days'));
  const priceColumn = `price${rank}`;
  const endTime = new Date();
  const startTime = new Date(endTime);
  startTime.setDate(startTime.getDate() - days);
  const maxRows = Math.min(Math.max(days * 160, 480), 5000);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  let query = await supabase
    .from('price_snapshots')
    .select(`asset_id, captured_at, ${priceColumn}`)
    .eq('asset_id', playerId)
    .not(priceColumn, 'is', null)
    .order('captured_at', { ascending: false })
    .limit(maxRows);

  if (query.error && /statement timeout/i.test(String(query.error.message || ''))) {
    query = await supabase
      .from('price_snapshots')
      .select(`asset_id, captured_at, ${priceColumn}`)
      .eq('asset_id', playerId)
      .not(priceColumn, 'is', null)
      .order('captured_at', { ascending: false })
      .limit(600);
  }

  if (query.error) {
    return NextResponse.json({ error: `Supabase query failed: ${query.error.message}` }, { status: 500 });
  }

  const rawSnapshots = (query.data || [])
    .map((entry) => ({
      capturedAt: entry.captured_at || null,
      price: entry[priceColumn] ?? null
    }))
    .filter((entry) => entry.capturedAt && entry.price !== null)
    .reverse();

  const startMs = startTime.getTime();
  const endMs = endTime.getTime();
  const filteredSnapshots = rawSnapshots.filter((entry) => {
    const timestamp = Date.parse(entry.capturedAt);
    if (!Number.isFinite(timestamp)) return false;
    return timestamp >= startMs && timestamp <= endMs;
  });
  const snapshots = filteredSnapshots.length ? filteredSnapshots : rawSnapshots;

  return NextResponse.json({
    playerId: String(playerId),
    rank,
    days,
    snapshots
  });
}

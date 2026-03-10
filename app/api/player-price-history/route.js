import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';

// Tiered query limits — descend to smaller limits on timeout to stay under DB statement timeout.
// Null filtering is done in JS (not in DB) so the query stays simple and index-friendly.
const QUERY_TIERS = [
  { limit: 500, withDateFilter: true },
  { limit: 200, withDateFilter: false },
  { limit: 80,  withDateFilter: false }
];

function isTimeoutError(err) {
  return /statement timeout|canceling statement/i.test(String(err?.message || ''));
}

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

async function queryTier(supabase, { playerId, priceColumn, startIso, limit, withDateFilter }) {
  let q = supabase
    .from('price_snapshots')
    .select(`asset_id, captured_at, ${priceColumn}`)
    .eq('asset_id', playerId)
    .order('captured_at', { ascending: false })
    .limit(limit);

  if (withDateFilter) {
    q = q.gte('captured_at', startIso);
  }

  return q;
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
  const startIso = startTime.toISOString();

  console.info('[price-history] request', { playerId, rank, days, priceColumn, startIso });

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let result = null;
  let usedTier = null;

  for (const tier of QUERY_TIERS) {
    console.info('[price-history] trying tier', { limit: tier.limit, withDateFilter: tier.withDateFilter });
    const attempt = await queryTier(supabase, { playerId, priceColumn, startIso, ...tier });

    if (!attempt.error) {
      result = attempt;
      usedTier = tier;
      console.info('[price-history] tier succeeded', { limit: tier.limit, rows: attempt.data?.length ?? 0 });
      break;
    }

    if (isTimeoutError(attempt.error)) {
      console.warn('[price-history] tier timed out, trying smaller', { limit: tier.limit, error: attempt.error.message });
      continue;
    }

    // Non-timeout error — fail immediately
    console.error('[price-history] tier failed (non-timeout)', { limit: tier.limit, error: attempt.error.message });
    return NextResponse.json({ error: `Supabase query failed: ${attempt.error.message}` }, { status: 500 });
  }

  if (!result || result.error) {
    const msg = result?.error?.message || 'All query tiers timed out';
    console.error('[price-history] all tiers failed', { playerId, error: msg });
    return NextResponse.json({ error: `Supabase query failed: ${msg}` }, { status: 500 });
  }

  const startMs = startTime.getTime();
  const endMs = endTime.getTime();

  const rawSnapshots = (result.data || [])
    .map((entry) => ({ capturedAt: entry.captured_at || null, price: entry[priceColumn] ?? null }))
    .filter((entry) => entry.capturedAt && entry.price !== null)
    .reverse(); // flip DESC → ASC for the chart

  // If date-filtered query returned data, keep it; otherwise use raw (most-recent fallback)
  const timeFiltered = usedTier?.withDateFilter
    ? rawSnapshots
    : rawSnapshots.filter((entry) => {
        const ts = Date.parse(entry.capturedAt);
        return Number.isFinite(ts) && ts >= startMs && ts <= endMs;
      });

  const snapshots = timeFiltered.length ? timeFiltered : rawSnapshots;

  console.info('[price-history] response', { playerId, rank, days, snapshotCount: snapshots.length, tier: usedTier?.limit });

  return NextResponse.json({ playerId: String(playerId), rank, days, snapshots });
}

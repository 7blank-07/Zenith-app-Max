import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildHistorySnapshots } from '../../../src/lib/server/price-snapshot-utils.mjs';

export const dynamic = 'force-dynamic';

const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';

// Tiered query limits — descend to smaller limits on timeout to stay under DB statement timeout.
// Null filtering is done in JS (not in DB) so the query stays simple and index-friendly.
const QUERY_TIERS = [
  { limit: 50, orderBy: 'id' },
  { limit: 30, orderBy: 'id' },
  { limit: 20, orderBy: 'id' },
  { limit: 50, orderBy: 'captured_at' }
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

async function queryTier(supabase, { playerId, limit, orderBy }) {
  return supabase
    .from('price_snapshots')
    .select('id, asset_id, captured_at, price0, price1, price2, price3, price4, price5')
    .eq('asset_id', playerId)
    .order(orderBy, { ascending: false })
    .limit(limit);
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
  const endTime = new Date();
  const startTime = new Date(endTime);
  startTime.setDate(startTime.getDate() - days);
  console.info('[price-history] request', { playerId, rank, days });

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let result = null;
  let usedTier = null;

  for (const tier of QUERY_TIERS) {
    console.info('[price-history] trying tier', tier);
    let attempt = await queryTier(supabase, { playerId, ...tier });

    if (attempt.error && tier.orderBy === 'id' && isMissingIdColumnError(attempt.error)) {
      attempt = await supabase
        .from('price_snapshots')
        .select('asset_id, captured_at, price0, price1, price2, price3, price4, price5')
        .eq('asset_id', playerId)
        .order('captured_at', { ascending: false })
        .limit(Math.min(tier.limit, 20));
    }

    if (!attempt.error) {
      let normalizedAttempt = attempt;
      const rows = Array.isArray(attempt.data) ? attempt.data : [];
      const seenCaptured = new Set();
      let hasDuplicateCaptured = false;
      rows.forEach((row) => {
        const key = String(row?.captured_at ?? '');
        if (!key) return;
        if (seenCaptured.has(key)) hasDuplicateCaptured = true;
        else seenCaptured.add(key);
      });

      if (tier.orderBy === 'id' && hasDuplicateCaptured) {
        const byCapturedAttempt = await supabase
          .from('price_snapshots')
          .select('asset_id, captured_at, price0, price1, price2, price3, price4, price5')
          .eq('asset_id', playerId)
          .order('captured_at', { ascending: false })
          .limit(Math.min(rows.length || tier.limit, 20));
        if (!byCapturedAttempt.error) normalizedAttempt = byCapturedAttempt;
      }

      result = normalizedAttempt;
      usedTier = tier;
      console.info('[price-history] tier succeeded', { ...tier, rows: normalizedAttempt.data?.length ?? 0 });
      break;
    }

    if (isTimeoutError(attempt.error)) {
      console.warn('[price-history] tier timed out, trying smaller', { ...tier, error: attempt.error.message });
      continue;
    }

    // Non-timeout error — fail immediately
    console.error('[price-history] tier failed (non-timeout)', { ...tier, error: attempt.error.message });
    return NextResponse.json({ error: `Supabase query failed: ${attempt.error.message}` }, { status: 500 });
  }

  if (!result || result.error) {
    const msg = result?.error?.message || 'All query tiers timed out';
    console.error('[price-history] all tiers failed', { playerId, error: msg });
    return NextResponse.json({ error: `Supabase query failed: ${msg}` }, { status: 500 });
  }

  const startMs = startTime.getTime();
  const endMs = endTime.getTime();

  const rawSnapshots = buildHistorySnapshots(result.data || [], rank);
  const rangeSnapshots = buildHistorySnapshots(result.data || [], rank, { startMs, endMs });

  const snapshots = rangeSnapshots.length ? rangeSnapshots : rawSnapshots;

  console.info('[price-history] response', {
    playerId,
    rank,
    days,
    snapshotCount: snapshots.length,
    tier: usedTier
  });

  return NextResponse.json({ playerId: String(playerId), rank, days, snapshots });
}

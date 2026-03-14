import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';

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

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const query = await supabase
    .from('player_refresh_data')
    .select('player_id, refresh_time, name, ovr')
    .eq('player_id', playerId)
    .maybeSingle();

  if (query.error) {
    return NextResponse.json({ error: `Supabase query failed: ${query.error.message}` }, { status: 500 });
  }

  if (!query.data || !query.data.refresh_time) {
    return NextResponse.json({ error: `No refresh time found for player ${playerId}` }, { status: 404 });
  }

  return NextResponse.json({
    playerId: String(query.data.player_id ?? playerId),
    refreshTime: query.data.refresh_time
  });
}

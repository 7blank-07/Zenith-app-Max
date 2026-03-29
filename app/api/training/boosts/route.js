import { NextResponse } from 'next/server';
import { fetchTrainingBoostsForPosition } from '../../../../src/lib/server/player-skill-data.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const position = String(searchParams.get('position') || '').trim();
  const level = String(searchParams.get('level') || '').trim();

  if (!position) {
    return NextResponse.json({ error: 'Missing required query param: position' }, { status: 400 });
  }

  if (!level) {
    return NextResponse.json({ error: 'Missing required query param: level' }, { status: 400 });
  }

  try {
    const payload = await fetchTrainingBoostsForPosition(position, level);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[training-boosts-api] Failed to load training boosts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load training boosts' },
      { status: 502 }
    );
  }
}

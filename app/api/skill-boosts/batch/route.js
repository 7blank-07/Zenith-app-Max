import { NextResponse } from 'next/server';
import { fetchSkillBoostLevels } from '../../../../src/lib/server/player-skill-data.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ error: 'Missing required query param: ids' }, { status: 400 });
  }

  const skillIds = ids.split(',').map(id => id.trim()).filter(Boolean);

  if (!skillIds.length) {
    return NextResponse.json({ error: 'No valid skill IDs provided' }, { status: 400 });
  }

  try {
    const results = await Promise.all(
      skillIds.map(async (skillId) => {
        const payload = await fetchSkillBoostLevels(skillId);
        return { skillId, boosts: payload.boosts };
      })
    );
    
    // Return an object keyed by skillId
    const responseData = {};
    results.forEach(({ skillId, boosts }) => {
      responseData[skillId] = boosts;
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[skill-boosts-batch-api] Failed to load skill boosts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load skill boosts' },
      { status: 502 }
    );
  }
}

import { NextResponse } from 'next/server';
import { fetchSkillBoostLevels } from '../../../../src/lib/server/player-skill-data.mjs';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const skillId = String(params?.skillId || '').trim();

  if (!skillId) {
    return NextResponse.json({ error: 'Missing required route param: skillId' }, { status: 400 });
  }

  try {
    const payload = await fetchSkillBoostLevels(skillId);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[skill-boosts-api] Failed to load skill boosts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load skill boosts' },
      { status: 502 }
    );
  }
}

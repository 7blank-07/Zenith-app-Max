import { NextResponse } from 'next/server';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { upsertTopTenRankings, publishTopTenRankings } from '../../../../src/lib/server/top-10/repository.mjs';

export async function POST(request) {
  try {
    const user = await requireBlogSessionUser({ nextPath: '/admin/top-10' });
    const body = await request.json();
    const { action, rankings } = body;
    const position = String(body.position || '').trim().toUpperCase();

    if (!position) {
      return NextResponse.json({ error: 'Position is required' }, { status: 400 });
    }

    if (action === 'publish') {
      await publishTopTenRankings(position, user.name);
      return NextResponse.json({ success: true, message: 'Rankings published successfully' });
    }

    if (action === 'save') {
      if (!Array.isArray(rankings)) {
        return NextResponse.json({ error: 'Rankings must be an array' }, { status: 400 });
      }
      await upsertTopTenRankings(position, rankings, 'draft', user.name);
      return NextResponse.json({ success: true, message: 'Rankings saved as draft' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[top-10-api] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

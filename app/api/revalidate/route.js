import { NextResponse } from 'next/server';
import { buildBlogRevalidationPathsFromPayload, revalidateAppPaths } from '../../../src/lib/server/blog/revalidation.mjs';
import { buildRedeemRevalidationPathsFromPayload } from '../../../src/lib/server/redeem-codes/revalidation.mjs';

export const dynamic = 'force-dynamic';

function normalizePath(pathValue) {
  if (typeof pathValue !== 'string') return null;
  const trimmed = pathValue.trim();
  if (!trimmed.startsWith('/')) return null;
  return trimmed;
}

function buildTargetPaths(body) {
  const targetPaths = new Set();
  const providedPaths = Array.isArray(body?.paths) ? body.paths : [];
  const playerIds = Array.isArray(body?.playerIds) ? body.playerIds : [];
  const includeListingPages = body?.includeListings !== false;

  for (const path of providedPaths) {
    const normalized = normalizePath(path);
    if (normalized) targetPaths.add(normalized);
  }

  for (const playerId of playerIds) {
    const normalizedId = String(playerId ?? '').trim();
    if (!normalizedId) continue;
    targetPaths.add(`/player/${encodeURIComponent(normalizedId)}`);
  }

  if (includeListingPages) {
    targetPaths.add('/players');
  }

  for (const blogPath of buildBlogRevalidationPathsFromPayload(body)) {
    targetPaths.add(blogPath);
  }

  for (const redeemPath of buildRedeemRevalidationPathsFromPayload(body)) {
    targetPaths.add(redeemPath);
  }

  return [...targetPaths];
}

export async function POST(request) {
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET is not configured on the server' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  if (!body || body.secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid revalidation secret' }, { status: 401 });
  }

  const paths = buildTargetPaths(body);
  if (!paths.length) {
    return NextResponse.json({ error: 'No valid paths to revalidate' }, { status: 400 });
  }

  const { failures } = await revalidateAppPaths(paths);

  if (failures.length) {
    console.error('[metrics] revalidate failure', {
      attemptedPaths: paths.length,
      failures
    });
    return NextResponse.json({ revalidated: false, paths, failures }, { status: 500 });
  }

  console.info('[metrics] revalidate success', {
    pathCount: paths.length,
    playerIdCount: Array.isArray(body.playerIds) ? body.playerIds.length : 0,
    blogPathCount: buildBlogRevalidationPathsFromPayload(body).length
  });
  return NextResponse.json({ revalidated: true, paths });
}

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const DEFAULT_API_BASE_URL = 'https://zenithfcm.com/api';

const ALLOWED_PARAMS = new Set([
  'name_starts_with',
  'position',
  'league',
  'team',
  'nation',
  'event',
  'min_ovr',
  'max_ovr',
  'skill_moves',
  'is_untradable',
  'limit',
  'offset',
  'sort_by',
  'order',
  'rank'
]);

function getBackendBaseUrl() {
  const baseUrl = String(process.env.ZENITH_API_BASE_URL || DEFAULT_API_BASE_URL).trim();
  return baseUrl.replace(/\/+$/, '');
}

function buildPlayersApiUrl(baseUrl, searchParams) {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '');
  const endpoint = normalizedBaseUrl.endsWith('/api')
    ? `${normalizedBaseUrl}/players`
    : `${normalizedBaseUrl}/api/players`;
  return `${endpoint}?${searchParams.toString()}`;
}

export async function GET(request) {
  const backendUrl = getBackendBaseUrl();

  const incomingUrl = new URL(request.url);
  const outgoingParams = new URLSearchParams();
  for (const [key, value] of incomingUrl.searchParams.entries()) {
    if (!ALLOWED_PARAMS.has(key)) continue;
    if (!String(value || '').trim()) continue;
    outgoingParams.append(key, value);
  }

  if (!outgoingParams.has('limit')) {
    outgoingParams.set('limit', '50');
  }

  const targetUrl = buildPlayersApiUrl(backendUrl, outgoingParams);

  let response;
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to reach backend players API: ${error instanceof Error ? error.message : String(error)}` },
      { status: 502 }
    );
  }

  const payloadText = await response.text();
  if (!payloadText) {
    return NextResponse.json({ players: [], pagination: { total: 0, limit: 50, offset: 0, has_more: false } }, { status: response.status });
  }

  try {
    const payload = JSON.parse(payloadText);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: 'Backend players API returned invalid JSON', details: payloadText.slice(0, 500) },
      { status: 502 }
    );
  }
}

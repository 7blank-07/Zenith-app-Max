import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_API_BASE_URL = 'https://zenithfcm.com/api';
const LOCAL_API_BASE_URLS = ['http://127.0.0.1:8000', 'http://localhost:8000'];

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

function getConfiguredBackendBaseUrl() {
  return String(process.env.ZENITH_API_BASE_URL || '')
    .trim()
    .replace(/\/+$/, '');
}

function getBackendCandidates() {
  const configured = getConfiguredBackendBaseUrl();
  const candidates = [configured, ...LOCAL_API_BASE_URLS, DEFAULT_API_BASE_URL]
    .map((entry) => String(entry || '').trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return [...new Set(candidates)];
}

function buildPlayersApiUrl(baseUrl, searchParams) {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '');
  const endpoint = normalizedBaseUrl.endsWith('/api')
    ? `${normalizedBaseUrl}/players`
    : `${normalizedBaseUrl}/api/players`;
  return `${endpoint}?${searchParams.toString()}`;
}

function normalizePayload(payload, fallbackOffset = 0) {
  if (payload && typeof payload === 'object' && Array.isArray(payload.players)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.results)) {
    const total = Number.isFinite(Number(payload.total)) ? Number(payload.total) : payload.results.length;
    const limit = Number.isFinite(Number(payload.limit)) ? Number(payload.limit) : 50;
    const offset = Number.isFinite(Number(payload.offset)) ? Number(payload.offset) : fallbackOffset;
    return {
      players: payload.results,
      pagination: {
        total,
        limit,
        offset,
        has_more: payload.has_more === true
      }
    };
  }

  return null;
}

function parseErrorReason(payload, fallbackText = '') {
  if (payload?.error) return String(payload.error);
  if (payload?.detail) return String(payload.detail);
  return fallbackText;
}

async function fetchCandidate(targetUrl) {
  const response = await fetch(targetUrl, {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(7_000)
  });

  const text = await response.text();
  if (!text) {
    return { response, payload: null, details: '' };
  }

  try {
    return { response, payload: JSON.parse(text), details: text.slice(0, 500) };
  } catch {
    return { response, payload: null, details: text.slice(0, 500) };
  }
}

export async function GET(request) {
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

  const fallbackOffset = Number.parseInt(String(incomingUrl.searchParams.get('offset') || '0'), 10) || 0;
  const attempts = [];

  for (const candidate of getBackendCandidates()) {
    const targetUrl = buildPlayersApiUrl(candidate, outgoingParams);

    try {
      const { response, payload, details } = await fetchCandidate(targetUrl);
      const normalized = normalizePayload(payload, fallbackOffset);

      if (response.ok && normalized) {
        return NextResponse.json(normalized, { status: response.status });
      }

      const reason = parseErrorReason(payload, details);
      attempts.push({ url: targetUrl, status: response.status, reason });

      // Keep trying other candidates for common routing/deployment errors.
      if (response.status === 404 || response.status >= 500) {
        continue;
      }

      return NextResponse.json(
        {
          error: reason || `Backend players API failed (${response.status})`,
          attempts
        },
        { status: response.status || 502 }
      );
    } catch (error) {
      attempts.push({
        url: targetUrl,
        status: 502,
        reason: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const hint = getConfiguredBackendBaseUrl()
    ? ''
    : ' Set ZENITH_API_BASE_URL to your FastAPI origin (example: http://127.0.0.1:8000).';

  return NextResponse.json(
    {
      error: `Unable to reach a working players backend.${hint}`,
      attempts
    },
    { status: 502 }
  );
}

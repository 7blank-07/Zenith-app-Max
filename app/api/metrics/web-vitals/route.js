import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function asText(value, fallback = 'unknown') {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Metric payload must be valid JSON' }, { status: 400 });
  }

  const name = asText(payload?.name, '').toUpperCase();
  const value = asNumber(payload?.value);
  const path = asText(payload?.path);
  const navigationType = asText(payload?.navigationType);
  const cacheHint = asText(payload?.cacheHint);
  const timestamp = asText(payload?.timestamp, new Date().toISOString());

  if (!name || value === null) {
    return NextResponse.json({ error: 'Metric name and numeric value are required' }, { status: 400 });
  }

  console.info('[metrics] web-vital', {
    name,
    value,
    path,
    navigationType,
    cacheHint,
    timestamp
  });

  return NextResponse.json({ recorded: true });
}

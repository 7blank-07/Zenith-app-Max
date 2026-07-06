import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_API_BASE_URL = process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api';

export async function GET(request) {
  const incoming = new URL(request.url).searchParams;
  const baseUrl = DEFAULT_API_BASE_URL.replace(/\/+$/, '');
  
  // Forward all query parameters to the FastAPI backend
  const endpoint = `${baseUrl}/players?${incoming.toString()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('[Search API Proxy] Failed:', response.status, details);
      return NextResponse.json({ error: 'API request failed' }, { status: response.status });
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[Search API Proxy] Fetch failed:', error);
    return NextResponse.json({ error: 'Failed to contact backend API' }, { status: 500 });
  }
}

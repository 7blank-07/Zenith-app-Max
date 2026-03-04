Below are three ready-to-run prompts you can paste into GitHub Copilot CLI (or any Codex-style agent). Each prompt is a single-phase request: run Phase 1 first, then Phase 2, then Phase 3. Each phase prompt is self-contained and specifies precise outputs, files to add/update, constraints, and acceptance criteria. I also include small example file templates (you can keep or adapt them) so the agent has concrete expected files to create.

PHASE 1 — Data & infra (one CLI request)
- Goal: Add tooling to compute top-10k players (by OVR), add on-demand revalidation endpoint (protected by secret), add a weekly GitHub Action skeleton to update/revalidate, and add a small API wrapper if missing.
- Why first: we need top-players data and a secure revalidation endpoint before pre-rendering pages.

Phase 1 prompt (paste into Copilot CLI):
```
Context:
- Repo: 7blank-07/Zenith-app-Max (Next.js app dir)
- We will pre-render the top 10,000 players by OVR. Prices remain client-side (fetched from DB).
- Pre-rendered pages must use ISR with a long cache window of 50 days (revalidate seconds = 60*60*24*50).
- New players are added weekly (~100/wk). We will NOT rebuild the whole site on each addition; instead we will call an on-demand revalidate endpoint for specific paths and listing pages.
- Use existing api-client or Supabase (repo contains references) for DB access; if missing, create a minimal server-side helper that calls internal API endpoints.

Phase 1 tasks (agent should perform in this single request):
1. Add a script scripts/generate-top-players.js that:
   - Connects to the DB (or reads a provided dataset file if DB credentials are not available).
   - Computes the top 10,000 player IDs ordered by OVR (high → low) and includes both auctionable and unauctionable players.
   - Writes src/data/top-players.json as an array of player IDs (strings).
   - Provide a fallback mode: if DB credentials not supplied, read a CSV/JSON in repo (if available) or fail gracefully with instructions.

2. Add an app-route: app/api/revalidate/route.js (app router) that:
   - Accepts POST with JSON { secret, paths: ["/player/123", "/players"] }.
   - Validates secret against process.env.REVALIDATE_SECRET.
   - Calls the appropriate Next helper to revalidate each path (use revalidatePath or revalidateTag according to Next version; if uncertain create a version that attempts revalidatePath and falls back to a documented alternative).
   - Returns JSON { revalidated: true } or error details.
   - Ensure the route is secure, logs minimal info, and rate-limited comments in code.

3. Add a GitHub Actions workflow .github/workflows/revalidate-new-players.yml skeleton that:
   - Runs weekly (cron) or can be triggered manually.
   - Runs scripts/generate-top-players.js to produce src/data/top-players.json (or uses it if already present).
   - Calls the revalidate API with the new players (and /players listing path).
   - Uses a secret stored in repo secrets: REVALIDATE_SECRET.

4. Add README docs (docs/revalidation.md) describing:
   - How to run scripts/generate-top-players.js locally.
   - How to set REVALIDATE_SECRET and call the revalidate API.
   - The on-demand revalidation workflow.

Required deliverables (files to add/update in repo):
- scripts/generate-top-players.js
- src/data/top-players.json (example: produce a small sample if real DB access not available)
- app/api/revalidate/route.js
- .github/workflows/revalidate-new-players.yml
- docs/revalidation.md

Acceptance criteria (tests/manual checks):
- scripts/generate-top-players.js runs without DB credentials and prints clear instructions; if DB creds provided it outputs src/data/top-players.json with <= 10,000 IDs.
- POST to /api/revalidate with correct secret returns { revalidated: true }.
- Workflow file present and references REVALIDATE_SECRET (not value).
- docs/revalidation.md explains how to call the endpoint and how top-players.json is used.

Additional constraints and notes:
- Use export const revalidate = 60*60*24*50 for pages later — mention this in docs.
- For DB access, prefer Supabase if repo has NEXT_PUBLIC_SUPABASE_URL and keys. If not present, the generator should accept a local JSON/CSV path.
- Keep changes minimal and safe (no destructive writes except generating top-players.json).
- Provide inline TODOs for handoff items (credentials, environment variables).
```

Example files (Phase 1 templates)
```javascript name=scripts/generate-top-players.js
// scripts/generate-top-players.js
// Generates src/data/top-players.json containing top 10k player IDs sorted by OVR.
// Usage:
//  - With Supabase: set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars and run node scripts/generate-top-players.js
//  - Fallback: node scripts/generate-top-players.js --input data/players.csv

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const OUT = path.join(process.cwd(), 'src', 'data', 'top-players.json');
const LIMIT = 10000;

async function fetchFromSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('players')
    .select('id,ovr,auctionable')
    .order('ovr', { ascending: false })
    .limit(LIMIT);
  if (error) throw error;
  return data.map(p => String(p.id));
}

async function fallbackRead(inputPath) {
  if (!fs.existsSync(inputPath)) throw new Error('Input file not found: ' + inputPath);
  const content = fs.readFileSync(inputPath, 'utf8');
  // Very simple CSV/JSON autodetect
  if (inputPath.endsWith('.json')) {
    const arr = JSON.parse(content);
    // expect objects with id and ovr
    return arr.sort((a,b) => b.ovr - a.ovr).slice(0, LIMIT).map(p => String(p.id));
  }
  // CSV parsing (id,ovr,...)
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const rows = lines.slice(1).map(l => {
    const [id, ovr] = l.split(',');
    return { id: id.trim(), ovr: Number(ovr) || 0 };
  });
  return rows.sort((a,b) => b.ovr - a.ovr).slice(0, LIMIT).map(r => String(r.id));
}

async function main() {
  try {
    let topIds;
    // Try Supabase first
    try {
      topIds = await fetchFromSupabase();
      console.log('Fetched top players from Supabase');
    } catch (e) {
      console.warn('Supabase fetch failed:', e.message);
      const input = process.argv[2] || 'data/players.json';
      topIds = await fallbackRead(input);
      console.log('Read top players from local file', input);
    }
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(topIds.slice(0, LIMIT), null, 2));
    console.log(`Wrote ${Math.min(topIds.length, LIMIT)} ids to ${OUT}`);
  } catch (err) {
    console.error('Failed to generate top players:', err);
    process.exit(1);
  }
}

main();
```

```javascript name=app/api/revalidate/route.js
// app/api/revalidate/route.js
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache'; // Next 13.4+ helper

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body || body.secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const paths = body.paths || [];
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ message: 'Missing paths' }, { status: 400 });
    }

    for (const p of paths) {
      // Best-effort; revalidatePath will schedule regeneration for the path
      try {
        await revalidatePath(p);
      } catch (e) {
        console.error('revalidatePath failed for', p, e);
        // continue to attempt other paths
      }
    }
    return NextResponse.json({ revalidated: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ revalidated: false, error: String(err) }, { status: 500 });
  }
}
```

```yaml name=.github/workflows/revalidate-new-players.yml
name: Revalidate new players weekly
on:
  schedule:
    - cron: '0 2 * * 1' # every Monday 02:00 UTC
  workflow_dispatch:

jobs:
  revalidate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install
        run: npm ci
      - name: Generate top players
        run: node scripts/generate-top-players.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      - name: Call revalidate endpoint
        run: |
          PATHS=$(node -e "console.log(JSON.stringify(['/players', ...require('./src/data/top-players.json').slice(0,100)]))")
          curl -X POST -H 'Content-Type: application/json' \
            -d "{\"secret\":\"${{ secrets.REVALIDATE_SECRET }}\",\"paths\":$PATHS}" \
            https://your-production-domain.com/api/revalidate
```

```markdown
name=docs/revalidation.md
# Revalidation & Top players

- Use `scripts/generate-top-players.js` to create `src/data/top-players.json`.
- Provide Supabase credentials via environment variables or pass a local JSON/CSV file.
- Set `REVALIDATE_SECRET` in your environment / repo secrets.
- The workflow `.github/workflows/revalidate-new-players.yml` runs weekly and calls the secure revalidate endpoint.
```

End of Phase 1 prompt.
```

PHASE 2 — Implement Server-rendered routes & client price widget (one CLI request)
- Goal: Convert /player/[id], /players, and /market into Next app-directory server components that:
  - Use generateStaticParams to pre-render top 10k players from src/data/top-players.json.
  - Use export const revalidate = 60 * 60 * 24 * 50 (50 days).
  - Provide generateMetadata per player (title, description, OG image).
  - Keep prices and frequently changing data fetched client-side (client component) from your API/Supabase.
  - Use the API client / Supabase helper in server code to fetch stable player metadata.

Phase 2 prompt (paste into Copilot CLI):
```
Context:
- Use src/data/top-players.json produced in Phase 1; pre-render those IDs at build time.
- Revalidate interval: 50 days (export const revalidate = 60*60*24*50).
- Prices must be client-side; we will add a small client component app/components/PriceWidget.client.js that calls /api/player-price?id=.
- Use server-side fetch for player metadata (name, ovr, summary, image) to build SEO markup and generateMetadata.

Phase 2 tasks (single request):
1. Add server component app/player/[id]/page.js:
   - export const revalidate = 60*60*24*50.
   - export async function generateStaticParams() { read src/data/top-players.json and return array of { id } for up to 10k entries }.
   - export async function generateMetadata({ params }) { fetch server-side player metadata and return title/description/openGraph }.
   - Default export: server component that fetches player metadata and renders core SEO content (name, ovr, position, summaryHTML). Use dangerouslySetInnerHTML only for sanitized summary if necessary.
   - Render a client PriceWidget component that fetches live price from DB.

2. Add client component app/components/PriceWidget.client.js:
   - Uses useEffect to fetch /api/player-price?id= and display market price and a small loading state.
   - Make it lightweight; this keeps HTML cached but updates price at runtime.

3. Add /api/player-price route (app/api/player-price/route.js or pages/api) that returns JSON with latest price from Supabase or existing API client. Protect rate-limiting comments.

4. Add app/players/page.js (listing) that:
   - Renders an SEO listing page for players (first N entries from src/data/top-players.json).
   - Use pagination if needed; ensure /players first page is server-rendered and included in the revalidate calls when new players arrive.

5. Add notes/TODOs for migrations and any missing pieces (e.g., sanitize summary HTML, XSS protection, image CDN).

Expected files to commit:
- app/player/[id]/page.js
- app/components/PriceWidget.client.js
- app/api/player-price/route.js
- app/players/page.js

Acceptance criteria:
- generateStaticParams reads src/data/top-players.json and returns up to 10k params.
- Visiting /player/<id> returns server-rendered HTML with title and meta tags (verify via curl or view-source).
- PriceWidget fetches live price client-side and updates the DOM after hydration.
- All server-side fetches use server-side secrets (do not leak service keys to client).

Provide quick example templates for each file in the output.
```

Example templates (Phase 2)
```javascript name=app/player/[id]/page.js
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import PriceWidget from '../../components/PriceWidget.client';

export const revalidate = 60 * 60 * 24 * 50; // 50 days

export async function generateStaticParams() {
  const file = path.join(process.cwd(), 'src', 'data', 'top-players.json');
  if (!fs.existsSync(file)) return [];
  const ids = JSON.parse(fs.readFileSync(file, 'utf8'));
  return ids.slice(0, 10000).map(id => ({ id: String(id) }));
}

async function fetchPlayerMeta(id) {
  // Replace with your api-client or Supabase server-side fetch
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/player/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const player = await fetchPlayerMeta(params.id);
  if (!player) return { title: 'Player not found' };
  return {
    title: `${player.name} — Zenith`,
    description: player.summary || `Stats and details for ${player.name}`,
    openGraph: { images: player.image ? [{ url: player.image }] : undefined }
  };
}

export default async function PlayerPage({ params }) {
  const player = await fetchPlayerMeta(params.id);
  if (!player) notFound();
  return (
    <main>
      <h1>{player.name}</h1>
      <p>OVR: {player.ovr} — Position: {player.position}</p>
      <section dangerouslySetInnerHTML={{ __html: player.summaryHtml || '' }} />
      <PriceWidget playerId={params.id} />
    </main>
  );
}
```

```javascript name=app/components/PriceWidget.client.js
'use client';
import React, { useEffect, useState } from 'react';

export default function PriceWidget({ playerId }) {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchPrice() {
      try {
        const res = await fetch(`/api/player-price?id=${encodeURIComponent(playerId)}`);
        if (!res.ok) throw new Error('Price fetch failed');
        const data = await res.json();
        if (mounted) setPrice(data.price);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPrice();
    return () => { mounted = false; };
  }, [playerId]);

  if (loading) return <div className="price-widget">Loading price…</div>;
  return <div className="price-widget">Current price: {price ? price : 'N/A'}</div>;
}
```

```javascript name=app/api/player-price/route.js
import { NextResponse } from 'next/server';
// server-side only
export async function GET(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Replace with api-client or Supabase call for latest price
  try {
    // Example: fetch from internal API
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/player-price?id=${encodeURIComponent(id)}`);
    if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const data = await res.json();
    return NextResponse.json({ price: data.price });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

End of Phase 2 prompt.
```

PHASE 3 — On-demand revalidation triggers & rollout automation (one CLI request)
- Goal: Wire up DB/ingest hooks or background jobs to call the revalidate endpoint on new-player creation and to update top-players list and listing pages as needed. Add a GitHub Action for manual runs and a measurement plan.

Phase 3 prompt (paste into Copilot CLI):
```
Context:
- Phase 1 created scripts/generate-top-players.js and app/api/revalidate/route.js.
- Phase 2 created server pages and client widget.
- Now implement automation to revalidate when new players are added and a rollout plan to gradually pre-render top 10k.

Phase 3 tasks (single request):
1. Add a tiny serverless helper scripts/call-revalidate.js that:
   - Accepts arguments: --paths '["/player/123"]' and calls POST /api/revalidate with REVALIDATE_SECRET (from env).
   - Returns success/failure and logs.

2. Add an example DB trigger or webhook consumer (scripts/revalidate-on-insert.js) that shows how to:
   - Listen to Supabase 'INSERT' events for the players table (or poll the DB as fallback).
   - On new player: call scripts/call-revalidate.js for ['/player/<id>', '/players'].

3. Update docs/revalidation.md with:
   - Example webhooks for Supabase (or instructions for your DB) showing how to POST to the revalidate endpoint when a new player is created.
   - Guidance: the new player's page will be generated on first request and cached (first request latency tradeoff), or you can call revalidate endpoint from the webhook to prime the cache immediately.

4. Add rollout recommendations:
   - Start by pre-rendering top 1k in the first deploy to validate render times.
   - Benchmark per-page render time using a small script (scripts/bench-render.js) that imports the server page rendering logic and measures average time for N sampled ids.
   - If average render ≤ 200ms, safely scale to 10k in build; otherwise increase concurrency limits or scale gradually (1k → 3k → 10k).

5. Add monitoring notes and metrics to collect:
   - Revalidate success/failure counts.
   - Cache-hit ratio for player pages.
   - First-contentful-paint for pre-rendered vs on-demand pages.

Expected files to commit:
- scripts/call-revalidate.js
- scripts/revalidate-on-insert.js (example)
- scripts/bench-render.js
- docs/revalidation.md (update)

Acceptance criteria:
- scripts/call-revalidate.js can POST to /api/revalidate with secret and paths.
- docs updated with webhook example and explanation of first-request latency and long cache (50 days).
- bench script prints per-page average render time for a sample.

End of Phase 3 prompt.
```

Notes & final instructions for using these prompts with GitHub Copilot CLI:
- Execute Phase 1 prompt first. Review generated scripts and the revalidate endpoint, run scripts/generate-top-players.js locally to produce sample top-players.json.
- Execute Phase 2 prompt next. Validate that visiting a pre-rendered /player/<id> returns server-rendered title/description via curl or viewing page source (before JS runs).
- Execute Phase 3 prompt last. Wire up webhook or run the call-revalidate script to prime caches for new players.

If you want, I can:
- Customize the Phase prompts to target a specific Next.js version (13.3 vs 13.4+ differences around revalidate helpers).
- Produce ready-to-commit code for all phases in a single PR (I can draft patch files if you want me to).
- Create the bench script that actually imports your server rendering functions and measures real times (requires access to project runtime).

Which of the three phases do you want me to expand into a full PR draft (provide all files, patch content and commit message)?
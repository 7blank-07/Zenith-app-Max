# Zenith App - Run and Validation Guide

## 1) Install dependencies
```bash
npm install
```

---

## 2) When to use each command

- `npm run dev`  
  Use for local development (hot reload, debugging UI changes).

- `npm run build`  
  Use to create a production build and run pre-render/static generation.

- `npm run start`  
  Use to run the production build locally after `npm run build`.

- `npm run generate:top-players`  
  Refresh `src/data/top-players.json` (top player IDs used for player pre-rendering).

- `npm run rollout:status`  
  Show current prerender tier/limit and how many player pages will be pre-rendered.

- `npm run revalidate:call`  
  Trigger on-demand revalidation for player/listing pages.

---

## 3) Pre-render players (top list refresh)
Run this before production build whenever top players need refresh:
```bash
npm run generate:top-players
```

---

## 4) Build with a small pre-render sample for fast validation

### PowerShell (Windows)
```powershell
$env:TOP_PLAYERS_PRERENDER_LIMIT='20'
npm run build
```

### Bash (Linux/macOS)
```bash
TOP_PLAYERS_PRERENDER_LIMIT=20 npm run build
```

---

## 5) Start production server locally

### PowerShell (Windows)
```powershell
$env:REVALIDATE_SECRET='dev-secret'
npm run start
```

### Bash (Linux/macOS)
```bash
REVALIDATE_SECRET=dev-secret npm run start
```

Open:
- `http://localhost:3000/`
- `http://localhost:3000/players`
- `http://localhost:3000/market`
- `http://localhost:3000/player/<id-from-src/data/top-players.json>`
- `http://localhost:3000/sitemap.xml`
- Next-native routes: `/watchlist`, `/tools`
- Compatibility deep links still available: `/squad-builder`, `/compare`, `/shard-calculator` (redirect to `/tools`)

---

## 6) Cache expiry duration (ISR)

Current ISR window is:
- `PLAYER_PAGE_REVALIDATE_SECONDS = 60 * 60 * 24 * 50`
- Equals **4,320,000 seconds (50 days)**

Defined in:
- `src/lib/server/player-seo-contract.mjs`

Used by:
- `app/player/[id]/page.js`
- `app/players/page.js`
- `app/market/page.js`

You can force refresh before expiry via revalidation API/script.

---

## 7) Check rollout tier and effective pre-render limit

Optional tier override:
- `PRERENDER_TIER=1k` -> 1000 players
- `PRERENDER_TIER=5k` -> 5000 players
- `PRERENDER_TIER=10k` -> 10000 players

Or direct limit:
- `TOP_PLAYERS_PRERENDER_LIMIT=<number>`

Check active rollout:
```bash
npm run rollout:status
```

---

## 8) Trigger on-demand revalidation manually

Example:
```bash
npm run revalidate:call -- --endpoint http://localhost:3000/api/revalidate --secret dev-secret --paths /players,/market --player-ids 24029805
```

---

## 9) Quick verification checklist

1. `npm run generate:top-players`
2. `TOP_PLAYERS_PRERENDER_LIMIT=20 npm run build` (or PowerShell equivalent)
3. `npm run build` (full 10k pre-render validation)
4. `REVALIDATE_SECRET=dev-secret npm run start` (or PowerShell equivalent)
5. Open `/`, `/players`, `/market`, `/player/<id>`, `/sitemap.xml`
6. Check tools routing (`/tools`, plus deep links `/squad-builder`, `/compare`, `/shard-calculator`)
7. Run `npm run rollout:status`
8. Run `npm run revalidate:call ...` and confirm success response

---

## 10) No-JS SEO/source validation (important)

For SEO validation, check page source (not hydrated DOM):

1. Start server:
   - PowerShell:
   ```powershell
   $env:REVALIDATE_SECRET='dev-secret'
   npm run start
   ```
2. In browser, open:
   - `view-source:http://localhost:3000/`
   - `view-source:http://localhost:3000/player/<id>`
3. Confirm source HTML already includes:
   - Home (`/`): `Top Players`, player card links, `OVR`, `Filter by Position`
   - Player (`/player/[id]`): `Profile Overview`, `Skill Moves`, `Weak Foot`, `Related Players`, attribute table content
4. Disable JavaScript in browser DevTools and reload:
   - Layout should remain mostly complete
   - Server profile/content should remain visible
   - Only live widgets (price/refresh/simulator) lose interactivity

---

## 11) Rollout safety notes

- Recommended rollout path:
  1. `TOP_PLAYERS_PRERENDER_LIMIT=20` (fast local validation)
  2. `PRERENDER_TIER=1k` (initial deployment)
  3. `PRERENDER_TIER=5k`
  4. `PRERENDER_TIER=10k`
- Use `npm run rollout:status` before deploy to confirm effective tier/limit.
- Keep `REVALIDATE_SECRET` set in runtime and use `/api/revalidate` for targeted refreshes instead of full rebuilds.

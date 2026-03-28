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

- `npm run db:migrate:blog`  
  Apply the blog CMS PostgreSQL schema migrations using `DATABASE_URL`.

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

## 4.1) Blog CMS database migrations

Set `DATABASE_URL` to your PostgreSQL connection string before running the migration command.

### PowerShell (Windows)
```powershell
$env:DATABASE_URL='postgresql://user:password@host:5432/database'
npm run db:migrate:blog
```

### Bash (Linux/macOS)
```bash
DATABASE_URL='postgresql://user:password@host:5432/database' npm run db:migrate:blog
```

Optional dry run:
```bash
node scripts/db/run-blog-migrations.mjs --dry-run
```

For admin login, also set `BLOG_SESSION_SECRET` plus bootstrap user credentials, then seed the initial users.

### PowerShell (Windows)
```powershell
$env:BLOG_SESSION_SECRET='replace-with-a-long-random-secret'
$env:BLOG_ADMIN_EMAIL='admin@example.com'
$env:BLOG_ADMIN_PASSWORD='Password123!'
$env:BLOG_EDITOR_EMAIL='editor@example.com'
$env:BLOG_EDITOR_PASSWORD='Password123!'
npm run db:seed:blog-users
```

### Bash (Linux/macOS)
```bash
BLOG_SESSION_SECRET='replace-with-a-long-random-secret' \
BLOG_ADMIN_EMAIL='admin@example.com' \
BLOG_ADMIN_PASSWORD='Password123!' \
BLOG_EDITOR_EMAIL='editor@example.com' \
BLOG_EDITOR_PASSWORD='Password123!' \
npm run db:seed:blog-users
```
#check

Optional bootstrap dry run:
```bash
node scripts/db/seed-blog-users.mjs --dry-run
```

Phase 4 editor routes:
- `/admin/blogs/new`
- `/admin/blogs/edit/<blog-id>`

The protected image upload endpoint is:
- `POST /api/blog/uploads`

It expects these environment variables for authenticated local filesystem storage:
- `BLOG_UPLOAD_DIR`
- `BLOG_PUBLIC_URL`
- optional `BLOG_IMAGE_MAX_BYTES`

Example VPS values:
- `BLOG_UPLOAD_DIR=/var/www/images.zenithfcm.com/blog`
- `BLOG_PUBLIC_URL=https://images.zenithfcm.com/blog`

---

## 4.2) Blog SEO and indexing surfaces

Public blog routes:
- `/blogs`
- `/blogs/<category>`
- `/blogs/tag/<tag>`
- `/blogs/<category>/<slug>`

They now use server-side `generateMetadata` plus JSON-LD helpers:
- archive pages emit collection and breadcrumb schema
- article pages emit `BlogPosting` and `BreadcrumbList` schema

Indexing routes:
- `/robots.txt` allows public crawling, blocks `/admin`, and points to `/sitemap.xml`
- `/sitemap.xml` includes published blog URLs alongside the existing site routes

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
- `http://localhost:3000/blogs`
- `http://localhost:3000/blogs/reviews`
- `http://localhost:3000/player/<id-from-src/data/top-players.json>`
- `http://localhost:3000/robots.txt`
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

Blog ISR window is:
- `BLOG_ROUTE_REVALIDATE_SECONDS = 60 * 60`
- Equals **3,600 seconds (1 hour)**

Defined in:
- `src/lib/server/blog/seo.mjs`

Used by:
- `app/blogs/page.js`
- `app/blogs/[category]/page.js`
- `app/blogs/tag/[tag]/page.js`
- `app/blogs/[category]/[slug]/page.js`

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

Blog publish/update payload example:
```json
{
  "secret": "dev-secret",
  "includeListings": false,
  "blogPost": {
    "status": "published",
    "slug": "example-post",
    "category": { "slug": "news" },
    "tags": [{ "slug": "tag-one" }, { "slug": "tag-two" }]
  }
}
```

That payload revalidates `/blogs`, the affected category page, the article page, any affected tag pages, and `/sitemap.xml`.

---

## 9) Quick verification checklist

1. `npm run generate:top-players`
2. `TOP_PLAYERS_PRERENDER_LIMIT=20 npm run build` (or PowerShell equivalent)
3. `npm run build` (full 10k pre-render validation)
4. `REVALIDATE_SECRET=dev-secret npm run start` (or PowerShell equivalent)
5. Open `/`, `/players`, `/market`, `/blogs`, `/blogs/reviews`, `/player/<id>`, `/robots.txt`, `/sitemap.xml`
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

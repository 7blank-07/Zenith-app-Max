## Zenith Internal Architecture and Runtime Details

This document is a code-backed audit of the current Zenith implementation.
It is based on repository sources and local build output, with explicit notes
where infrastructure details are not defined in this repo.

## 1) Technology Stack

- **Framework/runtime:** Next.js App Router (`app/`) on Next 14, React 18.
- **Language mix:** JavaScript + ESM `.mjs` server modules.
- **Data/storage:** PostgreSQL (`pg`) for blog CMS; Supabase for live market
  snapshots; external player API via `ZENITH_API_BASE_URL`.
- **Client libraries:** `chart.js`, `html2canvas`, `@supabase/supabase-js`.
- **Build bridge:** `scripts/prepare-legacy.mjs` still runs before `dev/build`.

### Is it fully App Router, or still SPA?

- Core product routes are App Router pages (`/`, `/players`, `/player/[id]`,
  `/tools`, `/watchlist`, `/blogs`, etc.).
- A **legacy SPA runtime still exists** and is mounted at **`/legacy`**:
  `app/legacy/page.js` + `app/legacy-app-shell.js` load
  `/assets/js/legacy-app.bundle.mjs`.
- So, architecture is **App Router-first with an isolated legacy SPA
  compatibility route**, not a pure SPA.

## 2) Rendering Architecture

Zenith currently uses all major Next rendering modes:

- **Static generation** (`○` in build output)
- **SSG with static params** (`●` for `/player/[id]`)
- **Dynamic SSR** (`ƒ` in build output)
- **Client components** for interactive surfaces
- **ISR-style revalidation windows** via route-level `revalidate` constants

### Route rendering status (from `npm run build`)

| Route | Build mode | Notes |
| --- | --- | --- |
| `/` | `○ Static` | Exports `revalidate` and prerenders home shell/content |
| `/players` | `ƒ Dynamic` | Server-rendered on demand (search-param aware) |
| `/player/[id]` | `● SSG` | 10,000 static params at build (`+9997 more`) |
| `/blogs` | `ƒ Dynamic` | Blog DB-backed pages rendered on demand |
| `/tools` | `ƒ Dynamic` | Request-aware tool shell + server player pool |
| `/watchlist` | `○ Static` | Compat route, server redirect to `/tools/watchlist` |
| `/compare` | `○ Static` | Compat route, server redirect to `/tools/player-compare` |
| `/legacy` | `○ Static` | Static HTML shell + client legacy runtime bootstrap |

## 3) Player Page Generation Strategy (`/player/[id]`)

### `prerenderLimit` logic

- `MAX_PRERENDER_LIMIT = 10000` in
  `src/lib/server/prerender-rollout.mjs`.
- Effective limit is from `PRERENDER_TIER` (`1k`, `5k`, `10k`) or
  `TOP_PLAYERS_PRERENDER_LIMIT`, capped at 10,000.
- Current runtime status (`npm run rollout:status`) reports `10k`.

### How first 10k players are chosen

- `generateStaticParams()` in `app/player/[id]/page.js` reads IDs from
  `src/data/top-players.json` and slices to `prerenderLimit`.
- `top-players.json` currently contains exactly **10,000 IDs**.
- Generation source (`scripts/generate-top-players.mjs`) ranks by:
  1) higher OVR first, 2) tradable before untradable, 3) `playerId` tie-break.

### What happens to the remaining ~25k players

- Only IDs in the 10k list are built ahead of time.
- Players outside that list are **not prebuilt**.
- With App Router dynamic params behavior and `revalidate` on the route, those
  pages are expected to render on first request, then be cached by Next.

### Lifecycle flow

```text
Build time
  -> read top-players.json
  -> generateStaticParams() takes first N (<=10k)
  -> prebuild player pages for those IDs

First visit (non-prebuilt player)
  -> request hits /player/[id]
  -> server fetches player + related data
  -> response generated and cached

Subsequent visits
  -> cached result served until revalidation window expires or manual revalidate
```

### Where cached output lives

- Build artifacts are under `.next/server/app` (e.g. static `*.html`/`*.rsc`).
- Incremental runtime cache uses Next’s default filesystem cache under
  `.next/cache` (no custom cache handler is configured in `next.config.js`).

## 4) Cache and Revalidation Layers

### Next.js route-level revalidation

- `PLAYER_PAGE_REVALIDATE_SECONDS = 60*60*24*50` (**50 days**) used by:
  `/`, `/players`, `/market`, `/player/[id]`, `/tools`.
- `BLOG_ROUTE_REVALIDATE_SECONDS = 60*60` (**1 hour**) exported by blog pages.
- On-demand invalidation exists via `POST /api/revalidate` and
  `revalidatePath(...)` in blog workflow paths.

### Browser/static caching

- No custom response headers are configured in `next.config.js`.
- Build `routes-manifest.json` shows `headers: []`.
- `_next/static` assets are content-hashed bundles (browser-cache friendly).
- `public/assets/*` are served as standard public assets (no repo-level custom
  cache policy shown).

### Nginx caching

- **Not configured in this repository.**
- No Nginx config file or cache rules are present here.

### Image CDN caching

- External image host references exist (`images.zenithfcm.com`) and blog uploads
  can publish URLs there via `BLOG_PUBLIC_URL`.
- Cache policy for that CDN/domain is **external to this repo**.

## 5) Static Assets and CDN Delivery

### `public/assets` and legacy assets

- `scripts/prepare-legacy.mjs` copies `assets/` -> `public/assets/`,
  patches CSS paths, extracts `legacy-body.html`, and generates
  `public/assets/js/legacy-app.bundle.mjs`.
- Global CSS is linked in `app/layout.js`:
  `/assets/css/style.css`, `/assets/css/tool-style.css`,
  `/assets/css/watchlist-styles.css`.

### `_next/static` bundles

- Produced by `next build`, referenced by Next runtime.
- First-load JS from latest build: shared ~87.4 kB, route-specific deltas vary
  (e.g., `/tools` ~112 kB first load, `/player/[id]` ~183 kB first load).

### `images.zenithfcm.com`

- Used in existing assets/docs (legacy code + blog upload config examples).
- Blog editor images are uploaded to local filesystem path (`BLOG_UPLOAD_DIR`)
  and returned with `BLOG_PUBLIC_URL` (often that image domain on VPS).

## 6) Tools System Architecture

### Current Next tools implementation

- `/tools` server page loads top 350 players and passes normalized data into
  `ToolsInteractions.client.js`.
- `ToolsInteractions` manages:
  - Squad Builder state (formation, starters/bench, badges, theme, drag/drop)
  - compare entry points
  - persistence (`toolsSquadState`, `selectedFieldTheme`, supplemental players)
- Bundle splitting:
  - page-level dynamic import for `ToolsInteractions`
  - client-level dynamic imports for `ComparePlayersTool.client` and
    `SquadPlayerCustomizationModal`.

### Compare tool

- Implemented in `ComparePlayersTool.client.js` as a client component.
- Supports basic/advanced stat comparisons with position-aware logic.

### Squad Builder

- Fully client-side interactive module in `ToolsInteractions.client.js`.
- URL round-trip back from `/players` is supported through query/context state.

### Shard calculator status (important)

- `/shard-calculator` exists only as a compatibility route that redirects to
  `/tools` (without selecting a shard tool).
- No active shard calculator component exists in current Next `/tools` UI.
- Legacy code references shard calculator behavior, but the standalone
  `assets/js/views/shardCalculator.js` is not in `orderedLegacyScripts`.

## 7) Blog System Architecture

### PostgreSQL schema

Defined in `scripts/db/001_blog_schema.sql`:

- `users`
- `blog_categories`
- `blogs`
- `blog_tags`
- `blog_tag_relations`
- migration tracking table (`blog_schema_migrations`) via migration runner

### Admin workflow

- Auth: signed cookie session (`zenith_blog_admin_session`),
  roles `admin` / `editor`, permission checks.
- Admin routes are protected by `middleware.js` for `/admin/:path*`.
- Editorial states: `draft -> pending -> published/rejected`.
- Actions are implemented via server actions in `app/actions/blog-editor.js`
  and workflow resolver in `src/lib/server/blog/workflow.mjs`.

### Public blog routes

- `/blogs`
- `/blogs/[category]`
- `/blogs/tag/[tag]`
- `/blogs/[category]/[slug]`

All use server-side metadata helpers and JSON-LD schema builders.

### Blog revalidation behavior

- Route export: `BLOG_ROUTE_REVALIDATE_SECONDS` (1h).
- Editorial updates call `revalidatePath` for affected blog/list/sitemap paths.

### SEO structure

- Route-level `generateMetadata(...)` in each blog page.
- JSON-LD helpers (`BlogPosting`, `BreadcrumbList`, collection schema).
- `app/robots.js` + `app/sitemap.js` include blog URLs.

## 8) Data Layer

### Player/domain data sources

- **Top IDs list:** `src/data/top-players.json` (10k IDs)
- **Player detail/list API:** external `${ZENITH_API_BASE_URL}/players...`
  via `top-players.mjs` and `player-seo-contract.mjs`
- **Market snapshots:** Supabase tables:
  - `price_snapshots` (`/api/player-price`, `/api/player-price-history`)
  - `player_refresh_data` (`/api/player-refresh`)

### Blog/CMS data source

- PostgreSQL via repository layer:
  `src/lib/server/blog/repository.mjs` + `queries.mjs` + `db.mjs`.

### Internal API endpoints

| Endpoint | Purpose | Backend source |
| --- | --- | --- |
| `/api/player-detail` | rank-specific player record | external player API |
| `/api/player-price` | latest price snapshot | Supabase `price_snapshots` |
| `/api/player-price-history` | historical price series | Supabase `price_snapshots` |
| `/api/player-refresh` | market refresh cycle time | Supabase `player_refresh_data` |
| `/api/revalidate` | on-demand path revalidation | Next cache APIs |
| `/api/blog/uploads` | authenticated image upload | local FS + blog session auth |

## 9) Build System

Build pipeline (`npm run build`):

1. `prebuild`: runs `scripts/prepare-legacy.mjs`
2. `next build`: compile, type/lint checks, collect data, generate pages,
   finalize optimization, collect traces

Observed build highlights:

- `generateStaticParams` logged: player prerender limit 10,000
- static generation progress: up to `10021/10021` pages
- route report with `○`, `●`, `ƒ` markers and per-route bundle sizes

### What route markers mean in output

- `○` Static prerendered content
- `●` SSG prerendered dynamic-route paths
- `ƒ` Dynamic server-rendered route

## 10) Runtime Architecture

### What is explicit in this repo

- App runtime is `next start` (Node.js server).
- Route handlers serve API endpoints from App Router.
- PostgreSQL and Supabase are external dependencies.

### What is **not** explicit in this repo

- No PM2 config file (`ecosystem*.js`) present.
- No Nginx reverse-proxy config present.
- These are operational concerns likely managed on the host/VPS.

### Request flow (current code-backed model)

```text
User Browser
   -> Next.js App Router server (next start)
      -> external player API (ZENITH_API_BASE_URL) for player content
      -> Supabase for live price/refresh APIs
      -> PostgreSQL for blog CMS queries
```

### If deployed with Nginx + PM2 (ops pattern, not repo-defined)

```text
User
  -> Nginx reverse proxy
     -> PM2-managed Next.js process (next start)
        -> PostgreSQL / Supabase / external player API
```

## 11) Performance Strategy (Current)

- **10k prerendered player pages** reduce first-hit latency for top traffic IDs.
- **On-demand generation** handles long-tail players without massive build size.
- **Tool bundle splitting** via dynamic imports reduces initial JS for non-tools
  routes.
- **Selective Next Image usage** for internal assets; external URLs often use
  plain `<img>` (delegates optimization/caching to external host/CDN).
- **Client-side market polling/fetches** keep live values fresh but can increase
  API/DB pressure at scale.

For a catalog around 35k players, the architecture handles it by:

- prebuilding top 10k
- serving the remaining ~25k through on-demand generation + cache

## 12) Deployment Process

The repo scripts support this workflow:

```text
Local dev -> git push -> VPS pull -> npm install -> npm run build -> start/restart process
```

Operational commands documented in-repo:

- `npm run generate:top-players`
- `npm run rollout:status`
- `npm run build`
- `npm run start`
- `npm run revalidate:call ...`
- blog setup: `npm run db:migrate:blog`, `npm run db:seed:blog-users`

`pm2 restart` is a valid host-level step but is not scripted in this repository.

## 13) Known Limits and Constraints

- Player prerender cap: **10,000** (`MAX_PRERENDER_LIMIT`)
- Current top-player source file size: **10,000 IDs**
- `/players` listing server fetch size: **350 players**
- `/tools` player pool size: **350 players**
- `/market` featured cards: **18 players**
- Blog pagination:
  - public default 12, max 50
  - admin default 25, max 100
- Price history API:
  - rank clamped to 0..5
  - days clamped to 1..30
  - query tiers: 500 -> 200 -> 80 rows
- Compare tool max players: **5**
- No repo-defined Nginx/PM2 config, cache proxy rules, or horizontal scaling
  orchestration.

## 14) Future Scaling Considerations (10k / 50k / 100k users/day)

### ~10k users/day

- Current architecture should generally cope if traffic is spread out.
- Biggest variable: external player API latency and Supabase query load.

### ~50k users/day

Likely bottlenecks:

- Dynamic routes (`/players`, `/tools`, blog pages) doing server work per
  request.
- Client-driven live market fetches (many per-page API hits).
- Single-node filesystem cache limitations if not shared across replicas.

### ~100k users/day

Expected pressure points:

- Node process concurrency and upstream API rate limits
- Supabase read amplification from market widgets/history
- Blog DB read/write load under editorial and public traffic
- cache consistency across instances if scaling horizontally

Recommended next steps:

- Add explicit edge/CDN caching policy for static + public API responses.
- Introduce shared/distributed cache for ISR/incremental outputs if multi-node.
- Aggregate or batch price/refresh API calls for watchlist/list pages.
- Add observability around API latency, cache hit ratio, and DB query timings.


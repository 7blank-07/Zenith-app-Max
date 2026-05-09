# Repository Guidelines

## Project Structure & Module Organization

Next.js App Router project with:

- `app/`: routes, API handlers (`app/api/*/route.js`), and React components
- `app/components/`: shared UI components, including `admin/` and `blog/` submodules
- `app/components/SiteChrome.js`: shared page chrome (nav, footer) used by most top-level pages
- `src/lib/server/`: server/domain logic modules (player data, blog, price snapshots)
- `src/data/top-players.json`: canonical player ID list (generated, do not hand-edit)
- `scripts/`: operational scripts (revalidation, top-player generation, blog DB setup)
- `assets/` → `public/assets/`: legacy assets copied by `scripts/prepare-legacy.mjs`

Key routes: `/`, `/players`, `/player/[slug]`, `/market`, `/tools` (`/tools/squad-builder`, `/tools/player-compare`, `/tools/watchlist`), `/blogs`, `/legacy`, plus localized redeem code pages (e.g., `/fc-mobile-redeem-codes`, `/ae/kod-fifa`).

## Build, Test, and Development Commands

- `npm run dev`: local dev server (runs `predev` first: legacy prep)
- `npm run build`: production build (runs `prebuild` first: legacy prep)
- `npm run start`: serve built app
- `npm run lint`: Next.js lint

Targeted tests (no repo-wide `npm test`):
- `npm run test:price`: price snapshot utils
- `node --test <file>.test.mjs`: run individual test files
- `node --test <file>.test.mjs --test-name-pattern "pattern"`: run specific test

Operational commands:
- `npm run generate:top-players`: refresh `src/data/top-players.json`
- `npm run rollout:status`: print prerender tier
- `npm run revalidate:call -- --endpoint <url> --secret <secret> --paths /players,/market`
- `npm run db:migrate:blog` / `npm run db:seed:blog-users`: blog CMS setup

## Coding Style & Naming Conventions

- 2-space indentation, semicolons, ES modules (`.js`/`.mjs`)
- Components: `PascalCase` (e.g., `PlayerPriceWidget.client.js`)
- Utilities/functions: `camelCase`; routes follow Next.js conventions (`[slug]`, `route.js`)
- Keep navigation links compatible with existing interception logic: preserve both `href` and `data-link`/`data-nav-link` attributes

**Do not hand-edit generated files:**
- `src/lib/legacy-body.html`
- `public/assets/js/legacy-app.bundle.mjs`
- `src/data/top-players.json`

## Architecture Notes

**Player data + SEO pipeline (shared across pages):**
- `src/lib/server/top-players.mjs`: fetches player batches, in-memory caching
- `src/lib/server/player-seo-contract.mjs`: normalizes API payloads, builds metadata/JSON-LD

**Price data:**
- `/api/player-price` and `/api/player-price-history` query Supabase `price_snapshots`
- `src/lib/server/price-snapshot-utils.mjs`: rank/timeout fallback logic

**Legacy compatibility:**
- `scripts/prepare-legacy.mjs` copies `assets/` → `public/assets/`, extracts legacy body HTML, generates legacy bundle
- `/legacy` renders generated legacy shell
- Preserve legacy DOM contracts in `src/lib/legacy-parity-contract.mjs` (required IDs/classes/selectors)

**Blog subsystem:**
- Public: `src/lib/server/blog/public.mjs`, SEO: `src/lib/server/blog/seo.mjs`
- Revalidation: `src/lib/server/blog/revalidation.mjs` invoked by `/api/revalidate`

## Key Conventions

- Reuse canonical normalization helpers instead of ad-hoc parsing:
  - `app/components/search-normalization.js` for search text
  - `normalizePlayerStableRecord` / `preferPlayerStableRecord` for player payloads
  - `normalizeLegacyPlayerId` for legacy ID handling

- Watchlist identity is composite: `getPlayerUniqueId` format `${playerId}_${rank}_${untradable}`

- For player skill/training payloads in client tools, use local API proxies (`/api/players/[playerId]`, `/api/skill-boosts/[skillId]`, `/api/training/boosts`) via `app/components/player-skill-stats-utils.js`

- Tool routes: `/tools/squad-builder`, `/tools/player-compare`, `/tools/watchlist`

## Testing Guidelines

Before opening a PR:
1. Run `npm run lint`
2. Run `npm run build`
3. Run relevant targeted tests if applicable
4. Manually verify changed flows in `npm run dev` (especially `/players`, `/player/[slug]`, `/tools`, `/watchlist`, affected API routes)

## Commit Guidelines

Short, task-focused commit subjects (often lowercase, e.g., "sitemap, robots.txt done"). Keep commits small and scoped.

## Security

- Secrets only in `.env.local` and CI secret storage
- Required integrations: Supabase, revalidation secrets — never commit credentials

# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js App Router project.

- `app/`: routes, API handlers, and React components (for example `app/player/[slug]/page.js`, `app/api/*/route.js`).
- `app/components/`: shared UI and client interaction components, including `admin/` and `blog/` submodules.
- `src/lib/`: server/domain logic (`src/lib/server/*`) and legacy contracts used by modern pages.
- `src/data/`: generated datasets such as `src/data/top-players.json`.
- `scripts/`: operational scripts (rollout status, revalidation, top-player generation, blog DB migrations/seeding).
- `assets/` -> `public/assets/`: source legacy/static assets copied by `scripts/prepare-legacy.mjs`.

## Build, Test, and Development Commands
- `npm run dev`: starts local dev server (runs legacy prep first).
- `npm run build`: production build (also runs legacy prep).
- `npm run start`: serves the built app.
- `npm run lint`: runs Next.js lint command (initialize ESLint config if prompted).
- `npm run generate:top-players`: refreshes `src/data/top-players.json`.
- `npm run rollout:status`: prints current prerender rollout tier.
- `npm run revalidate:call -- --paths /players,/market`: triggers cache revalidation endpoint.
- `npm run db:migrate:blog` / `npm run db:seed:blog-users`: blog database setup utilities.

## Coding Style & Naming Conventions
- Use 2-space indentation, semicolons, and ES module syntax (`.js`/`.mjs`) consistent with existing files.
- Components: `PascalCase` (for example `PlayerPriceWidget.client.js`).
- Utilities and functions: `camelCase`; route folders follow Next.js conventions (`[slug]`, `route.js`).
- Prefer small, focused modules in `src/lib/server/*`; keep cross-page helpers centralized.
- Do not hand-edit generated files: `src/lib/legacy-body.html` and `public/assets/js/legacy-app.bundle.mjs`.

## Testing Guidelines
There is currently no `npm test` suite configured. Before opening a PR:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Manually verify changed flows in `npm run dev` (especially `/players`, `/player/[slug]`, `/tools`, `/watchlist`, and affected API routes).

## Commit & Pull Request Guidelines
Recent history uses short, task-focused commit subjects (often lowercase, e.g. "sitemap, robots.txt done"). Keep commits small and scoped; prefer clear imperative summaries (for example `fix: normalize player slug metadata`).

PRs should include:

1. What changed and why.
2. Impacted routes/modules.
3. Env/config updates (if any).
4. Screenshots for UI changes (desktop/mobile when relevant).
5. Verification steps and command output summary (`lint`, `build`, manual checks).

## Security & Configuration Tips
- Keep secrets only in `.env.local` and CI secret storage.
- Required integrations include Supabase and revalidation secrets; never commit credentials.

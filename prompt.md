Aadar@Blank MINGW64 /c/project-files/Zenith-app-Max (watchlist-card)
$ npm run build

> zenith-app-max@1.0.0 prebuild
> node scripts/prepare-legacy.mjs

[prepare-legacy] Done: public assets, body HTML, and legacy bundle generated (CSS preserved).

> zenith-app-max@1.0.0 build
> next build

  ▲ Next.js 14.2.35
  - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully
   Skipping validation of types
   Skipping linting
   Collecting page data  ...[rollout] /player static params { prerenderLimit: 10000, totalIds: 10000, generated: 10000 }
 ✓ Collecting page data    
   Generating static pages (18/10049)  [ ===][metrics] /market render {
  elapsedMs: 67,
  featuredPlayers: 18,
  prerenderTier: '10k',
  prerenderLimit: 10000
}
[metrics] /market render {
  elapsedMs: 62,
  featuredPlayers: 18,
  prerenderTier: '10k',
  prerenderLimit: 10000
}
   Generating static pages (73/10049)  [=   ][top-players] Sanitized invalid control characters in /players metadata JSON response
[tools-data] Failed to fetch full filter metadata; using player pool fallback: SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at c (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:674)
    at async S (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:6726)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:7141
[tools-data] Failed to fetch full filter metadata; using player pool fallback: SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at c (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:674)
    at async S (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:6726)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:7141
[top-players] Sanitized invalid control characters in /players metadata JSON response
[tools-data] Failed to fetch full filter metadata; using player pool fallback: SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at c (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:674)
    at async S (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:6726)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:7141
[tools-data] Failed to fetch full filter metadata; using player pool fallback: SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at c (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:674)
    at async S (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:6726)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:7141
[top-players] Sanitized invalid control characters in /players metadata JSON response
[tools-data] Failed to fetch full filter metadata; using player pool fallback: SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at c (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:674)
    at async S (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:6726)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:7141
[tools-data] Failed to fetch full filter metadata; using player pool fallback: SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at c (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:674)
    at async S (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:6726)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:7141
 ✓ Generating static pages (10049/10049)
 ✓ Collecting build traces    
 ✓ Finalizing page optimization    

Route (app)                              Size     First Load JS
┌ ○ /                                    9.48 kB         114 kB
├ ○ /_not-found                          876 B          88.4 kB
├ ○ /about-us                            234 B           105 kB
├ ƒ /admin                               1.64 kB        89.2 kB
├ ƒ /admin/blogs                         1.14 kB        97.4 kB
├ ƒ /admin/blogs/drafts                  1.14 kB        97.4 kB
├ ƒ /admin/blogs/edit/[id]               145 B           107 kB
├ ƒ /admin/blogs/new                     145 B           107 kB
├ ƒ /admin/blogs/pending                 1.14 kB        97.4 kB
├ ƒ /admin/redeem-codes                  1.14 kB        97.4 kB
├ ƒ /admin/redeem-codes/edit/[id]        2.31 kB        98.6 kB
├ ƒ /admin/redeem-codes/new              2.31 kB        98.6 kB
├ ƒ /admin/streaming                     1.14 kB        97.4 kB
├ ƒ /admin/streaming/edit/[id]           145 B          99.2 kB
├ ƒ /admin/streaming/new                 145 B          99.2 kB
├ ƒ /admin/top-10                        5.34 kB         102 kB
├ ƒ /ae/kod-fifa                         1.21 kB         106 kB
├ ƒ /api/admin/top-10                    0 B                0 B
├ ƒ /api/blog/categories                 0 B                0 B
├ ƒ /api/blog/uploads                    0 B                0 B
├ ƒ /api/export-image                    0 B                0 B
├ ƒ /api/metrics/web-vitals              0 B                0 B
├ ƒ /api/player-detail                   0 B                0 B
├ ƒ /api/player-price                    0 B                0 B
├ ƒ /api/player-price-history            0 B                0 B
├ ƒ /api/player-refresh                  0 B                0 B
├ ƒ /api/players/[playerId]              0 B                0 B
├ ƒ /api/players/search                  0 B                0 B
├ ƒ /api/revalidate                      0 B                0 B
├ ƒ /api/skill-boosts/[skillId]          0 B                0 B
├ ƒ /api/training/boosts                 0 B                0 B
├ ƒ /blogs                               1.4 kB          106 kB
├ ƒ /blogs/[category]                    1.4 kB          106 kB
├ ƒ /blogs/[category]/[slug]             1.4 kB          106 kB
├ ƒ /blogs/tag/[tag]                     1.4 kB          106 kB
├ ○ /bug-feature-request                 234 B           105 kB
├ ○ /compare                             155 B          87.7 kB
├ ○ /contact                             234 B           105 kB
├ ○ /disclaimer                          234 B           105 kB
├ ƒ /fc-mobile-redeem-codes              1.21 kB         106 kB
├ ƒ /fc-mobile-redeem-codes-today        1.21 kB         106 kB
├ ƒ /id/kode-redeem-fc-mobile            1.21 kB         106 kB
├ ƒ /in/fc-mobile-redeem-codes           1.21 kB         106 kB
├ ƒ /internal-api/players/search         0 B                0 B
├ ○ /legacy                              123 kB          256 kB
├ ○ /market                              1.06 kB        97.3 kB
├ ƒ /my/fc-mobile-redeem-codes           1.21 kB         106 kB
├ ƒ /ph/ea-fc-mobile-redeem-codes        1.21 kB         106 kB
├ ● /player/[slug]                       17.5 kB         122 kB
├   ├ /player/van-dijk-117-9805896
├   ├ /player/dembele-117-9839100
├   ├ /player/vitinha-117-9841112
├   └ [+9997 more paths]
├ ƒ /players                             12.6 kB         117 kB
├ ○ /privacy-policy                      234 B           105 kB
├ ○ /robots.txt                          0 B                0 B
├ ○ /shard-calculator                    155 B          87.7 kB
├ ○ /sitemap.xml                         0 B                0 B
├ ƒ /sitemap/[id]                        0 B                0 B
├ ○ /squad-builder                       155 B          87.7 kB
├ ƒ /streaming                           704 B           105 kB
├ ƒ /streaming/[slug]                    704 B           105 kB
├ ○ /terms-and-conditions                234 B           105 kB
├ ƒ /th/fc-mobile-code                   1.21 kB         106 kB
├ ○ /tools                               225 B           173 kB
├ ● /tools/[slug]                        6.46 kB         179 kB
├   ├ /tools/squad-builder
├   ├ /tools/player-compare
├   └ /tools/watchlist
├ ƒ /top-10                              624 B           105 kB
├ ƒ /us/ea-redeem-codes                  1.21 kB         106 kB
├ ƒ /vn/code-fc-mobile                   1.21 kB         106 kB
└ ○ /watchlist                           155 B          87.7 kB
+ First Load JS shared by all            87.6 kB
  ├ chunks/2117-b1bf387a15a3bbf7.js      31.7 kB
  ├ chunks/fd9d1056-502aa2b1a6c37e98.js  53.6 kB
  └ other shared chunks (total)          2.2 kB


ƒ Middleware                             27.4 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic)  server-rendered on demand
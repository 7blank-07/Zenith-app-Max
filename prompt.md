blank@zenith-production:~$ pm2 status
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 3  │ portfolio          │ fork     │ 0    │ online    │ 0%       │ 25.3mb   │
│ 0  │ zenith             │ fork     │ 105  │ online    │ 0%       │ 34.1mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
blank@zenith-production:~$ history | grep npm
 1129  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1140  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1153  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1165  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1183  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1192  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1201  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1236  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1295  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1386  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1408  npm --version
 1416  npm list @playwright/test playwright
 1418  npm install @playwright/test
 1427  npm run sync
 1463  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1611  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1637  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1705  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1720  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1760  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1766  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1785  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1791  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1836  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1915  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1936  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1951  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1955  git pull && rm -rf .next && npm install && npm run build && pm2 restart zenith
 1966  history | grep npm
blank@zenith-production:~$ history | grep node
 1423  node -e "const { chromium } = require('playwright'); (async()=>{ const browser = await chromium.launch({headless:true}); console.log('Chromium OK'); await browser.close(); })();"
 1428  npx ts-node src/index.ts sync
 1433  npx ts-node src/index.ts sync --audit
 1474  npx ts-node src/index.ts revert-sync
 1493  npx ts-node src/index.ts sync --audit
 1494  npx ts-node src/index.ts sync
 1500  npx ts-node src/index.ts sync --audit
 1547  npx ts-node debug_screenshot.ts
 1567  npx ts-node debug_html.ts
 1576  npx ts-node src/index.ts sync
 1580  npx ts-node src/index.ts sync --audit
 1582  npx ts-node src/index.ts sync
 1587  npx ts-node src/index.ts sync
 1591  npx ts-node src/index.ts sync
 1597  npx ts-node src/index.ts sync
 1608  xvfb-run --server-args="-screen 0 1920x1080x24" npx ts-node src/index.ts sync
 1643  node -e "require('dotenv').config(); const { Client } = require('pg'); const c = new Client({host: process.env.PG_HOST, user: process.env.PG_USER, password: process.env.PG_PASSWORD, database:
 1649  node -e "require('dotenv').config(); const { Client } = require('pg'); const c = new Client({host: process.env.PG_HOST, user: process.env.PG_USER, password: process.env.PG_PASSWORD, database:
 1694  node check_player.js
 1696  node check_player.js
 1967  history | grep node
blank@zenith-production:~$ pm2 logs zenith --lines 20
[TAILING] Tailing last 20 lines for [zenith] process (change the value with --lines option)
/home/blank/.pm2/logs/zenith-out.log last 20 lines:
0|zenith   | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Ma&limit=50&offset=0&rank=0
0|zenith   | [SearchProxy] Incoming search: q="Mar" pos="CDM" criteria= { query: 'Mar', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith   | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith   | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Mar")
0|zenith   | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Mar&limit=50&offset=0&rank=0
0|zenith   | [SearchProxy] Incoming search: q="Marq" pos="CDM" criteria= { query: 'Marq', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith   | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith   | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Marq")
0|zenith   | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Marq&limit=50&offset=0&rank=0
0|zenith   | [metrics] /blogs/[category] render {
0|zenith   |   elapsedMs: 292,
0|zenith   |   category: 'reviews',
0|zenith   |   configured: true,
0|zenith   |   feedCount: 12,
0|zenith   |   page: 3
0|zenith   | }
0|zenith   | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="")
0|zenith   | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CDM
0|zenith   | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="")
0|zenith   | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=220&offset=0&rank=0&min_ovr=40&max_ovr=120

/home/blank/.pm2/logs/zenith-error.log last 20 lines:
0|zenith   |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith   |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith   |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith   |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith   |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith   |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith   |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith   |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith   |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith   | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith   |     at node:internal/deps/undici/undici:14902:13
0|zenith   |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith   |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith   |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith   |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith   |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith   |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith   |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith   |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith   |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)

0|zenith  | [SearchProxy] Incoming search: q="Marqu" pos="CDM" criteria= { query: 'Marqu', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Marqu")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Marqu&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Search endpoint returned 50 players after refinement
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] SUCCESS: Found 50 players. Enriching colors...
0|zenith  | [SearchProxy] Incoming search: q="Marquz" pos="CDM" criteria= { query: 'Marquz', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Marquz")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Marquz&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Mar")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Mar&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Incoming search: q="Marqu" pos="CDM" criteria= { query: 'Marqu', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Marqu")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Marqu&limit=50&offset=0&rank=0
0|zenith  | [metrics] /blogs/[category]/[slug] render {
0|zenith  |   elapsedMs: 547,
0|zenith  |   category: 'reviews',
0|zenith  |   slug: 'messi-tots-review-fc-mobile',
0|zenith  |   configured: true,
0|zenith  |   hasPost: true,
0|zenith  |   relatedCount: 4
0|zenith  | }
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Marq")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Marq&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CDM
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Marqu")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Marqu&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Marquz")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Marquz&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Mar")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Mar&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Marqu")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Marqu&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Marq")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Marq&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '30917318',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 17534
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: High string
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '30917318',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 15216
0|zenith  | }
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '30917318',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 22221
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: High string
0|zenith  | [DEBUG] record.workRateAttack: High string
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Marqu")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Marqu&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Marquz")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Marquz&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [metrics] web-vital {
0|zenith  |   name: 'FCP',
0|zenith  |   value: 19284,
0|zenith  |   path: '/player/ljungberg-119-7318591',
0|zenith  |   navigationType: 'navigate',
0|zenith  |   cacheHint: 'network-or-miss',
0|zenith  |   timestamp: '2026-07-05T10:24:08.925Z'
0|zenith  | }
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Marqu")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Marqu&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [metrics] /blogs/[category]/[slug] render {
0|zenith  |   elapsedMs: 610,
0|zenith  |   category: 'reviews',
0|zenith  |   slug: 'messi-tots-review-fc-mobile',
0|zenith  |   configured: true,
0|zenith  |   hasPost: true,
0|zenith  |   relatedCount: 4
0|zenith  | }
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [metrics] /blogs/[category] render {
0|zenith  |   elapsedMs: 506,
0|zenith  |   category: 'reviews',
0|zenith  |   configured: true,
0|zenith  |   feedCount: 12,
0|zenith  |   page: 4
0|zenith  | }
0|zenith  | [SearchProxy] Incoming search: q="Marq" pos="CDM" criteria= { query: 'Marq', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Marq")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Marq&limit=50&offset=0&rank=0
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '30913063',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 33071
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: Medium string
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 25 rows -> Output 25 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Search endpoint returned 50 players after refinement
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] SUCCESS: Found 50 players. Enriching colors...
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '24025626',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 25869
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: Medium string
0|zenith  | [metrics] /blogs/[category] render {
0|zenith  |   elapsedMs: 151,
0|zenith  |   category: 'reviews',
0|zenith  |   configured: true,
0|zenith  |   feedCount: 12,
0|zenith  |   page: 1
0|zenith  | }
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '30917318',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 21112
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: High string
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 9 rows -> Output 9 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 1 rows -> Output 1 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 1 rows -> Output 1 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 1 rows -> Output 1 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 1 rows -> Output 1 players (isSearchActive: false)
0|zenith  | [SearchProxy] Incoming search: q="" pos="" criteria= { query: '', minOvr: 40, maxOvr: 120, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying players endpoint: http://127.0.0.1:8000/api/players?limit=220&offset=0&rank=0&min_ovr=40&max_ovr=120
0|zenith  | [metrics] /players render {
0|zenith  |   elapsedMs: 1,
0|zenith  |   listedPlayers: 0,
0|zenith  |   prerenderTier: '10k',
0|zenith  |   prerenderLimit: 10000
0|zenith  | }
0|zenith  | [SearchProxy] Incoming search: q="" pos="CB" criteria= { query: '', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying players endpoint: http://127.0.0.1:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CB
0|zenith  | [api/player-price] Error: Error: timeout exceeded when trying to connect
0|zenith  |     at /var/www/zenith/node_modules/pg-pool/index.js:45:11
0|zenith  |     at async o (/var/www/zenith/.next/server/app/api/player-price/route.js:1:1497)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  |     at async NextNodeServer.renderPageComponent (/var/www/zenith/node_modules/next/dist/server/base-server.js:1924:24)
0|zenith  |     at async NextNodeServer.renderToResponseImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1962:32)
0|zenith  | [api/player-price] Error: Error: timeout exceeded when trying to connect
0|zenith  |     at /var/www/zenith/node_modules/pg-pool/index.js:45:11
0|zenith  |     at async o (/var/www/zenith/.next/server/app/api/player-price/route.js:1:1497)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  |     at async NextNodeServer.renderPageComponent (/var/www/zenith/node_modules/next/dist/server/base-server.js:1924:24)
0|zenith  |     at async NextNodeServer.renderToResponseImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1962:32)
0|zenith  | [api/player-price] Error: Error: timeout exceeded when trying to connect
0|zenith  |     at /var/www/zenith/node_modules/pg-pool/index.js:45:11
0|zenith  |     at async o (/var/www/zenith/.next/server/app/api/player-price/route.js:1:1497)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  |     at async NextNodeServer.renderPageComponent (/var/www/zenith/node_modules/next/dist/server/base-server.js:1924:24)
0|zenith  |     at async NextNodeServer.renderToResponseImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1962:32)
0|zenith  | [metrics] /blogs/[category]/[slug] render {
0|zenith  |   elapsedMs: 475,
0|zenith  |   category: 'reviews',
0|zenith  |   slug: 'messi-tots-review-fc-mobile',
0|zenith  |   configured: true,
0|zenith  |   hasPost: true,
0|zenith  |   relatedCount: 4
0|zenith  | }
0|zenith  | [SearchProxy] Incoming search: q="Gab" pos="CB" criteria= { query: 'Gab', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Gab")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Gab&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=220&offset=0&rank=0&min_ovr=40&max_ovr=120
0|zenith  | [SearchProxy] Incoming search: q="Gabriel" pos="CB" criteria= { query: 'Gabriel', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Gabriel")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Gabriel&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CB
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 220 rows -> Output 220 players (isSearchActive: false)
0|zenith  | [SearchProxy] [http://localhost:8000] Players endpoint returned 220 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] SUCCESS: Found 220 players. Enriching colors...
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Gab")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Gab&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Gabriel")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Gabriel&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 52 rows -> Output 52 players (isSearchActive: false)
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CB
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '24030014',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 14678
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: High string
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://localhost:8000] Search endpoint returned 50 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] SUCCESS: Found 50 players. Enriching colors...
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://localhost:8000] Search endpoint returned 50 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] SUCCESS: Found 50 players. Enriching colors...
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 21 rows -> Output 21 players (isSearchActive: false)
0|zenith  | [metrics] /blogs/[category]/[slug] render {
0|zenith  |   elapsedMs: 191,
0|zenith  |   category: 'reviews',
0|zenith  |   slug: 'lamine-yamal-tots-fc-mobile-review',
0|zenith  |   configured: true,
0|zenith  |   hasPost: true,
0|zenith  |   relatedCount: 4
0|zenith  | }
0|zenith  | [metrics] /blogs/[category] render {
0|zenith  |   elapsedMs: 201,
0|zenith  |   category: 'reviews',
0|zenith  |   configured: true,
0|zenith  |   feedCount: 12,
0|zenith  |   page: 4
0|zenith  | }
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 18 rows -> Output 18 players (isSearchActive: false)
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 3 rows -> Output 3 players (isSearchActive: false)
0|zenith  | [SearchProxy] Incoming search: q="" pos="" criteria= { query: '', minOvr: 40, maxOvr: 120, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying players endpoint: http://127.0.0.1:8000/api/players?limit=220&offset=0&rank=0&min_ovr=40&max_ovr=120
0|zenith  | [metrics] /players render {
0|zenith  |   elapsedMs: 2,
0|zenith  |   listedPlayers: 0,
0|zenith  |   prerenderTier: '10k',
0|zenith  |   prerenderLimit: 10000
0|zenith  | }
0|zenith  | [SearchProxy] Incoming search: q="" pos="CB" criteria= { query: '', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying players endpoint: http://127.0.0.1:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CB
0|zenith  | [SearchProxy] Incoming search: q="J" pos="CB" criteria= { query: 'J', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="J")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=J&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Incoming search: q="Jo" pos="CB" criteria= { query: 'Jo', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Jo")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Jo&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=220&offset=0&rank=0&min_ovr=40&max_ovr=120
0|zenith  | [SearchProxy] Incoming search: q="Joco" pos="CB" criteria= { query: 'Joco', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Joco")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Joco&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CB
0|zenith  | [SearchProxy] Incoming search: q="Jocobo" pos="CB" criteria= { query: 'Jocobo', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Jocobo")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Jocobo&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="J")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=J&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Jo")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Jo&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=220&offset=0&rank=0&min_ovr=40&max_ovr=120
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying players endpoint: http://127.0.0.1:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Joco
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '24027011',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 16542
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: Medium string
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&position=CB
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Jocobo")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Jocobo&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Incoming search: q="Jocobo ramon" pos="CB" criteria= {
0|zenith  |   query: 'Jocobo ramon',
0|zenith  |   minOvr: null,
0|zenith  |   maxOvr: null,
0|zenith  |   isUntradable: null
0|zenith  | }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="Jocobo ramon")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=Jocobo+ramon&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="J")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=J&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 220 rows -> Output 220 players (isSearchActive: false)
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Players endpoint returned 220 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] SUCCESS: Found 220 players. Enriching colors...
0|zenith  | [SearchProxy] Error with candidate http://localhost:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:7790)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Jo")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Jo&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] Error with candidate http://127.0.0.1:8000: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Joco")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Joco&limit=50&offset=0&rank=0
0|zenith  | [metrics] /blogs/[category]/[slug] render {
0|zenith  |   elapsedMs: 757,
0|zenith  |   category: 'reviews',
0|zenith  |   slug: 'messi-tots-review-fc-mobile',
0|zenith  |   configured: true,
0|zenith  |   hasPost: true,
0|zenith  |   relatedCount: 4
0|zenith  | }
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://localhost:8000] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Jocobo
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying players endpoint: http://127.0.0.1:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Jocobo+ramon
0|zenith  | [SearchProxy] Error with candidate https://zenithfcm.com/api: DOMException [TimeoutError]: The operation was aborted due to timeout
0|zenith  |     at node:internal/deps/undici/undici:14902:13
0|zenith  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|zenith  |     at async _ (/var/www/zenith/.next/server/chunks/8770.js:1:4719)
0|zenith  |     at async $ (/var/www/zenith/.next/server/chunks/8770.js:1:8415)
0|zenith  |     at async /var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
0|zenith  |     at async e_.execute (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
0|zenith  |     at async e_.handle (/var/www/zenith/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
0|zenith  |     at async doRender (/var/www/zenith/node_modules/next/dist/server/base-server.js:1366:42)
0|zenith  |     at async cacheEntry.responseCache.get.routeKind (/var/www/zenith/node_modules/next/dist/server/base-server.js:1588:28)
0|zenith  |     at async NextNodeServer.renderToResponseWithComponentsImpl (/var/www/zenith/node_modules/next/dist/server/base-server.js:1496:28)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 52 rows -> Output 52 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Search endpoint returned 50 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] SUCCESS: Found 50 players. Enriching colors...
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://localhost:8000] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Joco
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://localhost:8000] Players endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] Trying fuzzy fallback: http://localhost:8000/api/players?q=Jocobo&limit=50&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Players endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying fuzzy fallback: http://127.0.0.1:8000/api/players?q=Jocobo+ramon&limit=50&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Search endpoint returned 50 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] SUCCESS: Found 50 players. Enriching colors...
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 24 rows -> Output 24 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 32 rows -> Output 32 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Candidate returned no results, trying next...
0|zenith  | [SearchProxy] Trying candidate: http://localhost:8000 (searchQuery="Jocobo ramon")
0|zenith  | [SearchProxy] [http://localhost:8000] Trying search endpoint: http://localhost:8000/api/players/search?q=Jocobo+ramon&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://localhost:8000] Players endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] Trying fuzzy fallback: http://localhost:8000/api/players?q=Joco&limit=50&rank=0
0|zenith  | [metrics] /players render {
0|zenith  |   elapsedMs: 0,
0|zenith  |   listedPlayers: 0,
0|zenith  |   prerenderTier: '10k',
0|zenith  |   prerenderLimit: 10000
0|zenith  | }
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://localhost:8000] Candidate returned no results, trying next...
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Jocobo")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Jocobo&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://localhost:8000] Candidate returned no results, trying next...
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Joco")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Joco&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://localhost:8000] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] Trying players endpoint: http://localhost:8000/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Jocobo+ramon
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Jocobo
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Joco
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [http://localhost:8000] Players endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [http://localhost:8000] Trying fuzzy fallback: http://localhost:8000/api/players?q=Jocobo+ramon&limit=50&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 2 rows -> Output 2 players (isSearchActive: false)
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Players endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying fuzzy fallback: https://zenithfcm.com/api/players?q=Jocobo&limit=50&rank=0
0|zenith  | [metrics] /player render {
0|zenith  |   playerId: '24037263',
0|zenith  |   rank: 0,
0|zenith  |   attributeSectionCount: 6,
0|zenith  |   relatedCount: 8,
0|zenith  |   elapsedMs: 9115
0|zenith  | }
0|zenith  | [DEBUG] record.workRateAttack: High string
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Players endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying fuzzy fallback: https://zenithfcm.com/api/players?q=Joco&limit=50&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://localhost:8000] Candidate returned no results, trying next...
0|zenith  | [SearchProxy] Trying candidate: https://zenithfcm.com/api (searchQuery="Jocobo ramon")
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying search endpoint: https://zenithfcm.com/api/players/search?q=Jocobo+ramon&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Candidate returned no results, trying next...
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Candidate returned no results, trying next...
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Search endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying players endpoint: https://zenithfcm.com/api/players?limit=50&offset=0&rank=0&sort_by=ovr&order=desc&name_starts_with=Jocobo+ramon
0|zenith  | [SearchProxy] dedupePreferredPlayers: rows is not an array or empty
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Players endpoint returned 0 players after refinement
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Trying fuzzy fallback: https://zenithfcm.com/api/players?q=Jocobo+ramon&limit=50&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 50 rows -> Output 50 players (isSearchActive: true)
0|zenith  | [SearchProxy] [https://zenithfcm.com/api] Candidate returned no results, trying next...
0|zenith  | [SearchProxy] Incoming search: q="ramon" pos="CB" criteria= { query: 'ramon', minOvr: null, maxOvr: null, isUntradable: null }
0|zenith  | [SearchProxy] Backend candidates: http://127.0.0.1:8000, http://localhost:8000, https://zenithfcm.com/api
0|zenith  | [SearchProxy] Trying candidate: http://127.0.0.1:8000 (searchQuery="ramon")
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Trying search endpoint: http://127.0.0.1:8000/api/players/search?q=ramon&limit=50&offset=0&rank=0
0|zenith  | [SearchProxy] dedupePreferredPlayers: Input 7 rows -> Output 7 players (isSearchActive: true)
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] Search endpoint returned 7 players after refinement
0|zenith  | [SearchProxy] [http://127.0.0.1:8000] SUCCESS: Found 7 players. Enriching colors...
0|zenith  | [metrics] /blogs/[category]/[slug] render {
0|zenith  |   elapsedMs: 210,
0|zenith  |   category: 'reviews',
0|zenith  |   slug: 'messi-tots-review-fc-mobile',
0|zenith  |   configured: true,
0|zenith  |   hasPost: true,
0|zenith  |   relatedCount: 4
0|zenith  | }
0|zenith  | [metrics] /blogs/[category]/[slug] render {
0|zenith  |   elapsedMs: 101,
0|zenith  |   category: 'reviews',
0|zenith  |   slug: 'lamine-yamal-utots-review',
0|zenith  |   configured: true,
0|zenith  |   hasPost: true,
0|zenith  |   relatedCount: 4
0|zenith  | }

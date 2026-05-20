
Aadar@Blank MINGW64 /c/project-files/Zenith-app-Max (watchlist-card)
$ npm run start

> zenith-app-max@1.0.0 start
> next start

  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000

 ✓ Starting...
Error: ENOENT: no such file or directory, open 'C:\project-files\Zenith-app-Max\.next\prerender-manifest.json'
    at async open (node:internal/fs/promises:634:25)
    at async Object.readFile (node:internal/fs/promises:1236:14)
    at async setupFsCheck (C:\project-files\Zenith-app-Max\node_modules\next\dist\server\lib\router-utils\filesystem.js:188:40)
    at async initialize (C:\project-files\Zenith-app-Max\node_modules\next\dist\server\lib\router-server.js:64:23)
    at async Server.<anonymous> (C:\project-files\Zenith-app-Max\node_modules\next\dist\server\lib\start-server.js:249:36) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\project-files\\Zenith-app-Max\\.next\\prerender-manifest.json'
}

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
   Collecting page data  .[rollout] /player static params { prerenderLimit: 10000, totalIds: 10000, generated: 10000 }
 ✓ Collecting page data    
   Generating static pages (16/10049)  [=== ][metrics] /market render {
  elapsedMs: 78,
  featuredPlayers: 18,
  prerenderTier: '10k',
  prerenderLimit: 10000
}
[metrics] /market render {
  elapsedMs: 81,
  featuredPlayers: 18,
  prerenderTier: '10k',
  prerenderLimit: 10000
}
   Generating static pages (70/10049)  [=== ]SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296 {
  digest: '646088061'
}
SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296 {
  digest: '646088061'
}
SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async F (C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9583)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9982 {
  digest: '1191153399'
}
SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async F (C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9583)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9982 {
  digest: '1191153399'
}
SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async F (C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9583)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9982 {
  digest: '1191153399'
}

Error occurred prerendering page "/tools/squad-builder". Read more: https://nextjs.org/docs/messages/prerender-error

SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async F (C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9583)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\1668.js:1:9982
SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296 {
  digest: '646088061'
}
SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296 {
  digest: '646088061'
}
SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296 {
  digest: '646088061'
}

Error occurred prerendering page "/tools". Read more: https://nextjs.org/docs/messages/prerender-error

SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296
   Generating static pages (77/10049)  [==  ]SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296 {
  digest: '646088061'
}

Error occurred prerendering page "/tools/player-compare". Read more: https://nextjs.org/docs/messages/prerender-error

SyntaxError: Bad control character in string literal in JSON at position 785576
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:5852:19)
    at successSteps (node:internal/deps/undici/undici:5833:27)
    at fullyReadBody (node:internal/deps/undici/undici:4725:9)
    at async consumeBody (node:internal/deps/undici/undici:5842:7)
    at async k (C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:6897)
    at async Promise.all (index 0)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\5067.js:1:7296
 ✓ Generating static pages (10049/10049)

> Export encountered errors on following paths:
        /tools/[slug]/page: /tools/player-compare
        /tools/[slug]/page: /tools/squad-builder
        /tools/page: /tools

Aadar@Blank MINGW64 /c/project-files/Zenith-app-Max (watchlist-card)
$ 
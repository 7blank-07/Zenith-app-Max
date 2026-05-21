Aadar@Blank MINGW64 /c/project-files/Zenith-app-Max (home-search-dropdown)
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
   Collecting page data  ..TypeError: fetch failed
    at node:internal/deps/undici/undici:14902:13
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:2876
    at async Promise.all (index 84)
    at async g (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:2740)
    at async C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:4661
    at async $ (C:\project-files\Zenith-app-Max\.next\server\chunks\7744.js:1:5106)
    at async Object.f [as generateStaticParams] (C:\project-files\Zenith-app-Max\.next\server\app\player\[slug]\page.js:1:34110)
    at async buildParams (C:\project-files\Zenith-app-Max\node_modules\next\dist\build\utils.js:1026:40)
    at async C:\project-files\Zenith-app-Max\node_modules\next\dist\build\utils.js:1043:33
    at async C:\project-files\Zenith-app-Max\node_modules\next\dist\build\utils.js:1178:114 {
  [cause]: SocketError: other side closed
      at TLSSocket.<anonymous> (node:internal/deps/undici/undici:6408:28)
      at TLSSocket.emit (node:events:536:35)
      at endReadableNT (node:internal/streams/readable:1698:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
    code: 'UND_ERR_SOCKET',
    socket: {
      localAddress: '10.26.30.185',
      localPort: 50640,
      remoteAddress: '104.21.64.214',
      remotePort: 443,
      remoteFamily: 'IPv4',
      timeout: undefined,
      bytesWritten: 1312,
      bytesRead: 0
    },
    [Symbol(undici.error.UND_ERR)]: true,
    [Symbol(undici.error.UND_ERR_SOCKET)]: true
  }
}

> Build error occurred
Error: Failed to collect page data for /player/[slug]
    at C:\project-files\Zenith-app-Max\node_modules\next\dist\build\utils.js:1269:15 {
  type: 'Error'
}

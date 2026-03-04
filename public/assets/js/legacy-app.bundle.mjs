/* Generated legacy runtime loader. */
const LEGACY_SCRIPT_SOURCES = [
  "/assets/js/data/config.js",
  "/assets/js/data/api-client.js",
  "/assets/js/data/supabase-provider.js",
  "/assets/js/utils/helpers.js",
  "/assets/js/views/dashboard.js",
  "/assets/js/views/database.js",
  "/assets/js/views/market.js",
  "/assets/js/views/history.js",
  "/assets/js/views/stats-modal.js",
  "/assets/js/views/roiCalculator.js",
  "/assets/js/views/themeSelector.js",
  "/assets/js/views/squadBuilder.js",
  "/assets/js/views/squadBuilder-saveload.js",
  "/assets/js/views/squadBuilder-export.js",
  "/assets/js/views/eventGuide.js",
  "/assets/js/views/shardCalculator.js",
  "/assets/js/watchlist-professional.js",
  "/assets/js/refresh-time.js",
  "/assets/js/router.js",
  "/assets/js/app.js"
];

if (!window.__legacyLoaderStarted) {
  window.__legacyLoaderStarted = true;

  const dispatchLegacyEvent = (name, detail) => {
    window.dispatchEvent(new CustomEvent(name, detail ? { detail } : undefined));
  };

  const installDOMContentLoadedShim = () => {
    if (document.readyState === 'loading') {
      return { enabled: false, queuedHandlers: [], originalAddEventListener: null };
    }

    const queuedHandlers = [];
    const originalAddEventListener = document.addEventListener.bind(document);
    document.addEventListener = function legacyShimAddEventListener(type, handler, ...args) {
      if (type === 'DOMContentLoaded') {
        queuedHandlers.push({ handler });
        return;
      }
      return originalAddEventListener(type, handler, ...args);
    };

    return { enabled: true, queuedHandlers, originalAddEventListener };
  };

  const restoreDOMContentLoadedShim = (shimState) => {
    if (!shimState.enabled) return;

    document.addEventListener = shimState.originalAddEventListener;
    if (!shimState.queuedHandlers.length) return;

    console.log('[legacy-loader] running deferred DOMContentLoaded handlers:', shimState.queuedHandlers.length);
    const domContentLoadedEvent = new Event('DOMContentLoaded');
    for (const { handler } of shimState.queuedHandlers) {
      try {
        if (typeof handler === 'function') {
          handler(domContentLoadedEvent);
        } else if (handler && typeof handler.handleEvent === 'function') {
          handler.handleEvent(domContentLoadedEvent);
        }
      } catch (error) {
        console.error('[legacy-loader] DOMContentLoaded handler failed:', error);
      }
    }
  };

  const loadClassicScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve(src);
    script.onerror = () => reject(new Error('Failed to load script: ' + src));
    document.head.appendChild(script);
  });

  (async () => {
    const domContentLoadedShim = installDOMContentLoadedShim();
    try {
      for (const src of LEGACY_SCRIPT_SOURCES) {
        console.log('[legacy-loader] loading', src);
        await loadClassicScript(src);
      }

      restoreDOMContentLoadedShim(domContentLoadedShim);
      window.__legacyBundleFailed = false;
      window.__legacyBundleReady = true;
      console.log('[legacy-loader] legacy runtime ready');
      dispatchLegacyEvent('legacy:ready');
    } catch (error) {
      restoreDOMContentLoadedShim(domContentLoadedShim);
      window.__legacyBundleReady = false;
      window.__legacyBundleFailed = true;
      console.error('[legacy-loader] legacy runtime bootstrap failed:', error);
      dispatchLegacyEvent('legacy:error', { message: error?.message || String(error) });
    }
  })();
} else if (window.__legacyBundleReady) {
  window.dispatchEvent(new CustomEvent('legacy:ready'));
}

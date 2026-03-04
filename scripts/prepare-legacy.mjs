// Auto-generated at dev/build time from legacy index.html and scripts.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceAssetsDir = path.join(root, 'assets');
const publicAssetsDir = path.join(root, 'public', 'assets');
const sourceIndexPath = path.join(root, 'index.html');
const generatedBodyPath = path.join(root, 'src', 'lib', 'legacy-body.html');
const legacyBundlePath = path.join(publicAssetsDir, 'js', 'legacy-app.bundle.mjs');

const orderedLegacyScripts = [
  'assets/js/data/config.js',
  'assets/js/data/api-client.js',
  'assets/js/data/supabase-provider.js',
  'assets/js/utils/helpers.js',
  'assets/js/views/dashboard.js',
  'assets/js/views/database.js',
  'assets/js/views/market.js',
  'assets/js/views/history.js',
  'assets/js/views/stats-modal.js',
  'assets/js/views/roiCalculator.js',
  'assets/js/views/themeSelector.js',
  'assets/js/views/squadBuilder.js',
  'assets/js/views/squadBuilder-saveload.js',
  'assets/js/views/squadBuilder-export.js',
  'assets/js/views/eventGuide.js',
  'assets/js/views/shardCalculator.js',
  'assets/js/watchlist-professional.js',
  'assets/js/refresh-time.js',
  'assets/js/router.js',
  'assets/js/app.js'
];

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function normalizeLegacyHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/(src|href)=(["'])assets\//gi, '$1=$2/assets/')
    .replace(/srcset=(["'])assets\//gi, 'srcset=$1/assets/')
    .replace(/url\((['"]?)assets\//gi, 'url($1/assets/');
}

function fixCssPaths(css) {
  return css
    .replace(/url\((['"]?)assets\/fonts\//gi, 'url($1/assets/fonts/')
    .replace(/url\((['"]?)\.\.\/images\//gi, 'url($1/assets/images/');
}

function extractBodyContent(html) {
  const bodyOpenMatch = html.match(/<body[^>]*>/i);
  const bodyCloseIndex = html.toLowerCase().lastIndexOf('</body>');
  if (!bodyOpenMatch || bodyCloseIndex === -1 || bodyCloseIndex <= bodyOpenMatch.index) {
    throw new Error('Could not extract <body> from index.html');
  }
  return html.slice(bodyOpenMatch.index + bodyOpenMatch[0].length, bodyCloseIndex);
}

function generateLegacyBody() {
  const html = fs.readFileSync(sourceIndexPath, 'utf8');
  const body = extractBodyContent(html);
  const normalizedBody = normalizeLegacyHtml(body).trim();
  fs.mkdirSync(path.dirname(generatedBodyPath), { recursive: true });
  fs.writeFileSync(generatedBodyPath, normalizedBody, 'utf8');
}

function patchPublicCss() {
  const cssDir = path.join(publicAssetsDir, 'css');
  if (!fs.existsSync(cssDir)) return;
  for (const file of fs.readdirSync(cssDir)) {
    if (!file.endsWith('.css')) continue;
    const fullPath = path.join(cssDir, file);
    const css = fs.readFileSync(fullPath, 'utf8');
    fs.writeFileSync(fullPath, fixCssPaths(css), 'utf8');
  }
}

function toPublicScriptPath(relPath) {
  return `/${relPath.replace(/\\/g, '/').replace(/^assets\//, 'assets/')}`;
}

function buildLegacyBundle() {
  for (const rel of orderedLegacyScripts) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      throw new Error(`Missing legacy script: ${rel}`);
    }
  }

  const scriptSources = orderedLegacyScripts.map(toPublicScriptPath);
  const loaderSource = `/* Generated legacy runtime loader. */
const LEGACY_SCRIPT_SOURCES = ${JSON.stringify(scriptSources, null, 2)};

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
`;

  fs.mkdirSync(path.dirname(legacyBundlePath), { recursive: true });
  fs.writeFileSync(legacyBundlePath, loaderSource, 'utf8');
}

function main() {
  if (!fs.existsSync(sourceAssetsDir)) {
    throw new Error('assets directory not found.');
  }
  if (!fs.existsSync(sourceIndexPath)) {
    throw new Error('index.html not found.');
  }

  copyDirRecursive(sourceAssetsDir, publicAssetsDir);
  patchPublicCss();
  generateLegacyBody();
  buildLegacyBundle();

  console.log('[prepare-legacy] Done: public assets, body HTML, and legacy bundle generated.');
}

main();

'use client';

import { useEffect } from 'react';
import { ensureLegacyRuntimeGlobals } from './runtime-init';

const SCRIPT_ID = 'legacy-app-bundle-script';
const BUNDLE_SRC = '/assets/js/legacy-app.bundle.mjs';

function shouldBlockInlineEvent(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('[onclick], [onchange], [onsubmit]'));
}

export default function LegacyAppShell({ html }) {
  useEffect(() => {
    ensureLegacyRuntimeGlobals();

    if (window.__legacyBundleReady) return;
    window.__legacyBundleFailed = false;

    const handleLegacyReady = () => {
      window.__legacyBundleReady = true;
      window.__legacyBundleFailed = false;
      console.log('[LegacyAppShell] Legacy runtime ready.');
    };

    const handleLegacyError = (event) => {
      window.__legacyBundleReady = false;
      window.__legacyBundleFailed = true;
      console.error('[LegacyAppShell] Legacy runtime failed to initialize.', event?.detail || event);
    };

    window.addEventListener('legacy:ready', handleLegacyReady);
    window.addEventListener('legacy:error', handleLegacyError);

    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) return () => {
      window.removeEventListener('legacy:ready', handleLegacyReady);
      window.removeEventListener('legacy:error', handleLegacyError);
    };

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'module';
    script.src = BUNDLE_SRC;
    script.dataset.loaded = 'false';
    script.onload = () => {
      script.dataset.loaded = 'true';
      console.log('[LegacyAppShell] Legacy loader script loaded.');
    };
    script.onerror = (event) => {
      window.__legacyBundleFailed = true;
      console.error('[LegacyAppShell] Failed to load legacy bundle:', BUNDLE_SRC, event);
    };

    console.log('[LegacyAppShell] Loading legacy bundle:', BUNDLE_SRC);
    document.head.appendChild(script);
    // Do NOT remove the script on cleanup – removing a script that has
    // already executed has no effect and can trigger NotFoundError if the node
    // was moved by the browser or another reconciliation pass.
    return () => {
      window.removeEventListener('legacy:ready', handleLegacyReady);
      window.removeEventListener('legacy:error', handleLegacyError);
    };
  }, []);

  useEffect(() => {
    const guardInlineHandlersUntilReady = (event) => {
      if (window.__legacyBundleReady || window.__legacyBundleFailed) return;
      if (!shouldBlockInlineEvent(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    };

    document.addEventListener('click', guardInlineHandlersUntilReady, true);
    document.addEventListener('change', guardInlineHandlersUntilReady, true);
    document.addEventListener('submit', guardInlineHandlersUntilReady, true);

    return () => {
      document.removeEventListener('click', guardInlineHandlersUntilReady, true);
      document.removeEventListener('change', guardInlineHandlersUntilReady, true);
      document.removeEventListener('submit', guardInlineHandlersUntilReady, true);
      if (typeof window !== 'undefined' && typeof window.cleanupRefreshTimers === 'function') {
        window.cleanupRefreshTimers();
      }
    };
  }, []);

  return (
    <>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

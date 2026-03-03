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
  if (typeof window !== 'undefined') {
    ensureLegacyRuntimeGlobals();
  }

  useEffect(() => {
    // Guard: skip if already loaded or script element already exists
    if (window.__legacyBundleReady || document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'module';
    script.src = BUNDLE_SRC;
    script.onload = () => {
      window.__legacyBundleReady = true;
      console.log('[LegacyAppShell] Legacy bundle loaded successfully.');
    };
    script.onerror = (event) => {
      console.error('[LegacyAppShell] Failed to load legacy bundle:', BUNDLE_SRC, event);
    };

    document.body.appendChild(script);
    // Do NOT remove the script on cleanup – removing a module script that has
    // already executed has no effect and can trigger NotFoundError if the node
    // was moved by the browser or another reconciliation pass.
  }, []);

  useEffect(() => {
    const guardInlineHandlersUntilReady = (event) => {
      if (window.__legacyBundleReady) return;
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

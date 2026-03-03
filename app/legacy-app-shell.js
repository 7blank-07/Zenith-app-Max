'use client';

import { useEffect } from 'react';
import { ensureLegacyRuntimeGlobals } from './runtime-init';

function shouldBlockInlineEvent(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('[onclick], [onchange], [onsubmit]'));
}

export default function LegacyAppShell({ html }) {
  if (typeof window !== 'undefined') {
    ensureLegacyRuntimeGlobals();
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/assets/js/legacy-app.bundle.mjs';
    script.onload = () => {
      window.__legacyBundleReady = true;
      console.log('Legacy bundle executed');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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

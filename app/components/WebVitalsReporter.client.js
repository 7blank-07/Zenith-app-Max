'use client';

import { useEffect } from 'react';

function sendMetric(metric) {
  const payload = JSON.stringify(metric);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon('/api/metrics/web-vitals', blob);
    return;
  }

  fetch('/api/metrics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

export default function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

    const navEntry = performance.getEntriesByType('navigation')[0];
    const navigationType = navEntry?.type || 'unknown';
    const cacheHint = navEntry && navEntry.transferSize === 0 ? 'likely-cache-hit' : 'network-or-miss';
    let sentFcp = false;

    const observer = new PerformanceObserver((entryList) => {
      const paintEntries = entryList.getEntries();
      for (const entry of paintEntries) {
        if (entry.name !== 'first-contentful-paint' || sentFcp) continue;
        sentFcp = true;
        sendMetric({
          name: 'FCP',
          value: Number(entry.startTime.toFixed(2)),
          path: window.location.pathname,
          navigationType,
          cacheHint,
          timestamp: new Date().toISOString()
        });
      }
    });

    observer.observe({ type: 'paint', buffered: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

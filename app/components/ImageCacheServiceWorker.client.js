'use client';

import { useEffect } from 'react';

const IMAGE_CACHE_SW_PATH = '/zenith-image-cache-sw.js';

export default function ImageCacheServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register(IMAGE_CACHE_SW_PATH, { scope: '/' })
      .catch((error) => {
        console.error('[sw] Failed to register image cache service worker', error);
      });
  }, []);

  return null;
}

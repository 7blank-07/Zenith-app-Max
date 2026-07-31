const IMAGE_CACHE_NAME = 'zenith-image-cache-v3';
const REMOTE_IMAGE_HOSTS = new Set(['images.zenithfcm.com']);
const LOCAL_IMAGE_PREFIXES = ['/assets/images/', '/_next/image'];

function isCacheableImageRequest(request, url) {
  if (request.method !== 'GET') return false;
  if (request.destination === 'image') return true;

  if (url.origin === self.location.origin) {
    return LOCAL_IMAGE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
  }

  return REMOTE_IMAGE_HOSTS.has(url.hostname);
}

function isCacheableImageResponse(response) {
  if (!response) return false;
  // Never cache opaque responses (cross-origin no-cors requests) 
  // because we cannot know if they are 200 OKs or 404/500 errors.
  if (response.type === 'opaque') return false;
  return response.ok;
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (!isCacheableImageRequest(request, url)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;

      const networkResponse = await fetch(request);
      if (isCacheableImageResponse(networkResponse)) {
        cache.put(request, networkResponse.clone()).catch(() => {});
      }
      return networkResponse;
    })()
  );
});

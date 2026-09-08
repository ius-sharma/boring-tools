// BoringTools Service Worker - Offline Caching Engine
const CACHE_NAME = 'boringtools-cache-v2';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.png',
  '/boringtools-logo.png',
  '/json-formatter',
  '/emi-calculator',
  '/sip-calculator',
  '/bmi-calculator',
  '/word-counter',
  '/text-formatter',
  '/unit-converter',
  '/base-converter',
  '/password-generator',
];

// Install: Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('Some assets failed to pre-cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or chrome-extension URLs
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip API routes, telemetry, and analytics
  if (url.pathname.startsWith('/api') || url.pathname.includes('/_vercel/')) {
    return;
  }

  // 1. Navigation (HTML Pages): Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached home page if route isn't cached
          const fallback = await caches.match('/');
          return fallback || Response.error();
        })
    );
    return;
  }

  // 2. Static Assets (_next/static, fonts, icons, images): Cache-First
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|ico|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => Response.error());
      })
    );
    return;
  }

  // 3. All other requests: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || Response.error());

      return cached || networkFetch;
    })
  );
});

// Push notification support (Pomodoro timer)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Timer notification',
    icon: '/icon.png',
  };
  event.waitUntil(self.registration.showNotification('Pomodoro Timer', options));
});

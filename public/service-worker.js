// public/service-worker.js

const CACHE_NAME = 'al-furqan-v2';
const ASSETS = [
  '/',               
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  // icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',    // make sure you've generated this!
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-192x192.maskable.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512.maskable.png',
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log('All assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Claiming clients');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Activation failed:', error);
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Don't cache non-GET requests
  if (req.method !== 'GET') {
    event.respondWith(fetch(req));
    return;
  }

  // 1) Static assets: cache-first strategy
  if (
    req.destination === 'script' ||
    req.destination === 'style' ||
    req.destination === 'image' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      caches.match(req)
        .then(cached => {
          if (cached) {
            return cached;
          }
          return fetch(req)
            .then(response => {
              // Don't cache if not a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              // Clone the response
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(req, responseToCache);
                });
              return response;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              return caches.match('/offline.html'); // Optional: serve offline page
            });
        })
    );
    return;
  }

  // 2) Navigation requests: network-first strategy
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(response => {
          // Cache the new response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(req, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 3) All other requests: network-first
  event.respondWith(
    fetch(req)
      .catch(() => {
        return caches.match(req);
      })
  );
});

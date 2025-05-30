// public/service-worker.js

const CACHE_NAME = 'al-furqan-v2';
const ASSETS = [
  '/',               // index.html shell
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  // icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',    // make sure you’ve generated this!
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-192x192.maskable.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512.maskable.png',
];

self.addEventListener('install', event => {
  // pre-cache your app shell + icons
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    // delete old caches if you bump CACHE_NAME
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Static assets: cache-first
  if (
    req.destination === 'script' ||
    req.destination === 'style' ||
    req.destination === 'image' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
    return;
  }

  // 2) Navigation (HTML) requests: serve shell
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(cached => cached || fetch(req))
    );
    return;
  }

  // 3) All others: network
  event.respondWith(fetch(req));
});

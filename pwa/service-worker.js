const version = 'v1';

// Define static assets. These files will be cached.
const assets = [
  './',
  './app.js',
  './index.css',
];

self.addEventListener('install', async event => {
  // Add static assets to cache.
  const cache = await caches.open('app-' + version);
  cache.addAll(assets);
});

// Check whether to return cache or live data.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // If the request is to the app shell, return cache.
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(event.request));
  }
});

// If there's cache return it, else try to fetch.
const cacheFirst = async request => {
  return await caches.match(request) || fetch(request);
};

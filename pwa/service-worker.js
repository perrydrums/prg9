const assets = [
  './',
  './app.js'
];

self.addEventListener('install', async e => {
  const cache = await caches.open('app');
  cache.addAll(assets);
});

self.addEventListener('fetch', e => {
  e.respondWith(cacheFirst(e.request));
});

const cacheFirst = async (request) => {
  return await caches.match(request) || fetch(request);
};

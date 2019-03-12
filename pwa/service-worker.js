// Define static assets. These files will be cached.
const assets = [
  './',
  './app.js',
  './fallback.json'
];

// Ass static assets to cache.
self.addEventListener('install', async e => {
  const cache = await caches.open('app');
  cache.addAll(assets);
});

// Check whether to return cache or live data.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // If the request is to the app shell, return cache.
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(event.request));
  }
  else {
    event.respondWith(networkFirst(event.request));
  }
});

// If there's cache return it, else try to fetch.
const cacheFirst = async (request) => {
  return await caches.match(request) || fetch(request);
};

// First try fetching, else check if there's cache.
const networkFirst = async (request) => {
  const cache = await caches.open('projects');

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  }
  catch (error) {
    // Return cache when fetch fails. If there's no cache, return the fallback project.
    return await caches.match(request) || await caches.match('./fallback.json');
  }
};

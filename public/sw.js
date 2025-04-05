// Service Worker for cache control
const CACHE_NAME = 'neuromatch-cache-v1';

// Add event listener for the install event
self.addEventListener('install', (event) => {
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  console.log('Service Worker installed');
});

// Add event listener for the activate event
self.addEventListener('activate', (event) => {
  // Clear old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log('Service Worker activated');
});

// Add event listener for the fetch event
self.addEventListener('fetch', (event) => {
  // For development, bypass cache and always fetch from network
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .catch((error) => {
        console.error('Fetch failed; returning offline page instead.', error);
        return caches.match(event.request);
      })
  );
});

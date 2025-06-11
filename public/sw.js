importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (self.workbox) {
  self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  self.workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    new self.workbox.strategies.NetworkFirst({ cacheName: 'pages' })
  );

  self.workbox.routing.registerRoute(
    ({request}) => ['style','script','worker'].includes(request.destination),
    new self.workbox.strategies.StaleWhileRevalidate({ cacheName: 'assets' })
  );
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_ITINERARY') {
    const data = event.data.payload;
    event.waitUntil(
      caches.open('itinerary-cache').then(cache => {
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
        return cache.put('/offline-itinerary', response);
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/offline-itinerary')) {
    event.respondWith(
      caches.open('itinerary-cache').then(cache => cache.match('/offline-itinerary'))
    );
  }
});

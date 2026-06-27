// Self-destructing service worker
// This replaces the old CRA service worker that was intercepting requests
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    // Clear all caches
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      // Unregister this service worker
      return self.registration.unregister();
    }).then(function() {
      console.log('[SW] Unregistered successfully');
      // Force reload all clients
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.navigate(client.url);
      });
    })
  );
});

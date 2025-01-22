const CACHE_NAME = 'pushups-app-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icon-192.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force l'activation immédiate
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Supprime l'ancien cache
          }
        })
      );
    }).then(() => self.clients.claim()) // Prend le contrôle immédiatement
  );
});

self.addEventListener('fetch', event => {
  // Ne pas mettre en cache les requêtes chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Vérifie si la requête est pour script.js
        if (event.request.url.endsWith('script.js')) {
          // Pour script.js, toujours aller chercher la dernière version
          return fetch(event.request).then(networkResponse => {
            // Clone la réponse car elle ne peut être utilisée qu'une fois
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }).catch(() => response);
        }
        
        // Pour les autres fichiers, utiliser le cache d'abord
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          // Ne pas mettre en cache les requêtes qui ont échoué
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      })
  );
});

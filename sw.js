const CACHE_NAME = 'pushup-cache-v3';
const STATIC_CACHE_NAME = 'pushup-static-v3';
const DYNAMIC_CACHE_NAME = 'pushup-dynamic-v3';

const STATIC_ASSETS = [
  '/app.html',
  '/style.css',
  '/global.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache statique pour les fichiers essentiels
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Cache statique initialisé');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache dynamique pour les autres ressources
      caches.open(DYNAMIC_CACHE_NAME)
    ])
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Supprimer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME].includes(cacheName)) {
              console.log('Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  );
});

// Stratégie de cache : Cache First, puis Network
self.addEventListener('fetch', event => {
  // Ignorer les requêtes chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Ignorer les requêtes POST
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retourner la réponse du cache si elle existe
        if (cachedResponse) {
          // En parallèle, mettre à jour le cache pour la prochaine fois
          fetch(event.request)
            .then(response => {
              if (response.ok) {
                caches.open(DYNAMIC_CACHE_NAME)
                  .then(cache => cache.put(event.request, response));
              }
            })
            .catch(() => {/* Ignorer les erreurs de mise à jour */});
          
          return cachedResponse;
        }

        // Si pas dans le cache, faire la requête réseau
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }

            // Mettre en cache la nouvelle réponse
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            // En cas d'erreur réseau, essayer de retourner une page offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            throw error;
          });
      })
  );
});

// Périodiquement nettoyer le cache dynamique
self.addEventListener('periodicsync', event => {
  if (event.tag === 'clean-caches') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        // Supprimer les entrées plus vieilles que 7 jours
        cache.keys().then(requests => {
          requests.forEach(request => {
            cache.match(request).then(response => {
              if (response) {
                const date = new Date(response.headers.get('date'));
                if (Date.now() - date.getTime() > 7 * 24 * 60 * 60 * 1000) {
                  cache.delete(request);
                }
              }
            });
          });
        });
      })
    );
  }
});

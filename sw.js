const CACHE_VERSION = 'v4';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const APP_SHELL = `app-shell-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
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
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache pour l'app shell
      caches.open(APP_SHELL).then(cache => {
        console.log('Mise en cache de l\'app shell');
        return cache.addAll(['/app.html']);
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Supprimer les anciens caches
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (!key.includes(CACHE_VERSION)) {
              console.log('Suppression de l\'ancien cache:', key);
              return caches.delete(key);
            }
          })
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  );
});

// Stratégie de cache : Network First avec fallback sur le cache
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;

  // Ignorer les requêtes chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) return;

  // Stratégie spécifique pour app.html
  if (event.request.url.includes('/app.html')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request)
            .then(response => {
              return caches.open(APP_SHELL)
                .then(cache => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            });
        })
    );
    return;
  }

  // Pour les autres requêtes
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200) {
          throw new Error('Invalid response');
        }

        // Mettre en cache la réponse
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // En cas d'erreur, essayer le cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si la ressource n'est pas dans le cache et qu'on est hors ligne
            if (event.request.url.includes('/app.html')) {
              return caches.match('/app.html');
            }
            
            // Pour les autres ressources, retourner une erreur
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Synchroniser les données locales avec le serveur
      syncData()
    );
  }
});

// Nettoyage périodique du cache
self.addEventListener('periodicsync', event => {
  if (event.tag === 'clean-caches') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Ne garder que les caches de la version actuelle
            if (!cacheName.includes(CACHE_VERSION)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

const CACHE_NAME = 'compteur-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon-192.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Mise en cache des ressources');
                return cache.addAll(ASSETS);
            })
    );
    // Force le Service Worker à devenir actif immédiatement
    self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Prend le contrôle immédiatement
    self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retourne la réponse du cache si elle existe
                if (response) {
                    return response;
                }

                // Sinon, fait la requête au réseau
                return fetch(event.request)
                    .then((response) => {
                        // Vérifie si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone la réponse car elle ne peut être utilisée qu'une fois
                        const responseToCache = response.clone();

                        // Ajoute la nouvelle ressource au cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
            .catch(() => {
                // Si la requête échoue (pas de connexion), retourne une page d'erreur du cache
                return caches.match('/index.html');
            })
    );
});

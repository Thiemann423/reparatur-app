
const CACHE_NAME = 'reparatur-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/service-worker.js'
];

// Beim Installieren direkt alle Dateien cachen
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Alte Caches beim Aktivieren entfernen
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: PDF-Bibliotheken nie cachen, immer aus Netz laden
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);

  // Prüfen ob es sich um pdf-Bibliotheken handelt
  if (requestUrl.href.includes('html2pdf') || requestUrl.href.includes('html2canvas') || requestUrl.href.includes('jspdf')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});

// Update-Erkennung bei neuer Version
self.addEventListener('message', function (event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

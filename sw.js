const CACHE_NAME = 'todo-app-v1';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 서비스 워커 설치
self.addEventListener('install', (e) => {
  console.log('Service Worker installing...');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(FILES_TO_CACHE).catch((err) => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', (e) => {
  console.log('Service Worker activating...');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 처리 (캐시 우선)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return response;
      }).catch(() => {
        console.log('Fetch failed for:', e.request.url);
      });
    })
  );
});

// sw.js
const CACHE_NAME = 'goal-tracker-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './preview.png',
  // Кэшируем внешнюю библиотеку для конфетти, чтобы она работала офлайн
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// 1. Установка: кэшируем все важные файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: кэширование ресурсов');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Активируем новый SW сразу
  self.skipWaiting();
});

// 2. Активация: очищаем старые кэши, если имя изменилось
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: удаление старого кэша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Берём под контроль все открытые страницы сразу
  self.clients.claim();
});

// 3. Перехват запросов: стратегия "Сначала кэш, потом сеть"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Если есть в кэше — отдаём сразу (молниеносная загрузка офлайн)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Если нет в кэше (например, новая картинка награды из интернета) — идём в сеть
      return fetch(event.request).catch(() => {
        // Если сети нет и в кэше нет, можно вернуть заглушку, но для простоты пока оставим так
        console.log('Service Worker: ресурс недоступен офлайн', event.request.url);
      });
    })
  );
});

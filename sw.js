// 🚀 正式同步升級為 v1.2.0！日後更新 index.html 時，記得將這裡的版本號一併累加（例如 v1.2.1）
const APP_VERSION = 'v3.0.0';
const CACHE_NAME = `ava-wealth-app-${APP_VERSION}`;

// 🚀 離線緩存完整清單，確保包含新加入的 icon-192.png
const urlsToCache = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// 1. 安裝階段：將所有核心檔案秒速寫入手機快取
self.addEventListener('install', event => {
  self.skipWaiting(); // 強制立刻激活新版 Service Worker，無需等待舊版 App 關閉
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 成功建立 v1.2.0 離線快取');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 啟動激活階段：清除舊版本的快取垃圾，釋放手機空間
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 成功清理舊版本快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 讓新版 Service Worker 立刻全面掌控當前網頁
});

// 3. 攔截請求：實現真正的離線可用 (Cache-First 策略)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 快取有檔案就直接由手機本地秒開（離線可用）；無快取才會動用數據聯網抓取
        return response || fetch(event.request);
      })
  );
});

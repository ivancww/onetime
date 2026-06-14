// 每次你更新了 index.html 的內容，請務必更改這個版本號！(例如改為 v1.0.2)
const APP_VERSION = 'v1.1.0';
const CACHE_NAME = `ava-wealth-app-${APP_VERSION}`;

// 這裡列出所有離線必須存在的檔案（請確保檔名完全正確）
const urlsToCache = [
  './',
  './index.html',
  './icon-512.png',
  './manifest.json'
];

// 1. 安裝階段：將檔案寫入離線緩存
self.addEventListener('install', event => {
  self.skipWaiting(); // 【強制更新關鍵 1】強制立刻安裝，不等待舊版 SW 關閉
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 緩存已建立:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 啟動階段：清除舊版本的垃圾緩存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 刪除舊緩存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 【強制更新關鍵 2】新版 SW 立刻接管所有已打開的網頁
});

// 3. 攔截請求：實現離線可用 (Cache First 策略)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果緩存裡有這個檔案，直接秒速返回（離線可用）；沒有才去網絡抓取
        return response || fetch(event.request);
      })
  );
});

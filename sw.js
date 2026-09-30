// 首次打开后把页面缓存到手机，之后没网也能用。改了页面就把版本号加一。
const CACHE = "collector-v46";
// 页面本身必须缓存成功；位置库、地图这些大文件单独缓存，失败了也不影响页面更新（否则新版会装不上、一直停在旧版）
const FILES = ["./", "index.html", "zxing.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const BIG = ["locations.js", "marks.js", "makers.js", "maps/v1-2f.webp", "maps/v2-2f.webp", "maps/v2-3f.webp", "maps/v3-2f.webp"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(FILES);
    await Promise.allSettled(BIG.map(f => c.add(f)));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});

const CACHE_NAME = "screen-share-cache-v1";
const urlsToCache = [
  "/",
  "./index.html",
  "./js/script.js",
  "./assets/css/styles.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

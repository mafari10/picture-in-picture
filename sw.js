const CACHE_NAME = "pip-cache-v1";
const ASSETS_TO_CACHE = [
  "/mafari10/",
  "/mafari10/index.html",
  "/mafari10/js/script.js",
  "/mafari10/assets/css/styles.css",
  "/mafari10/favicon.ico",
  "/mafari10/assets/icons/icon-192x192.png",
  "/mafari10/assets/icons/icon-512x512.png",
  "/mafari10/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      // Cache each file individually to prevent complete failure if one fails
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.log(`Failed to cache ${url}:`, err);
          });
        })
      );
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

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

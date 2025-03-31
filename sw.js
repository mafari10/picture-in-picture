const CACHE_NAME = "pip-cache-v2"; // Changed version to force update
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
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache
            .add(new Request(url, { cache: "reload" }))
            .catch((err) => {
              console.error(`Failed to cache ${url}:`, err);
              // Continue even if some files fail to cache
              return Promise.resolve();
            });
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Enable navigation preload if supported
        if (self.registration.navigationPreload) {
          return self.registration.navigationPreload.enable();
        }
      })
  );
  // Tell the active service worker to take control immediately
  self.clients.claim();
});
